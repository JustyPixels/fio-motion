use spade::{ConstrainedDelaunayTriangulation, HasPosition, Point2, Triangulation};
use std::collections::{HashMap, HashSet};
use std::cell::RefCell;
use std::rc::Rc;
use std::hash::{Hash, Hasher};
use std::collections::VecDeque;
use nalgebra::DMatrix;
use nalgebra_sparse::{coo::CooMatrix,csc::CscMatrix,factorization::CscCholesky};

thread_local! { static OUTPUT: RefCell<Vec<f64>> = const { RefCell::new(Vec::new()) }; }
type Adjacency=Vec<Vec<(usize,f64)>>;
thread_local! { static TOPOLOGY: RefCell<Vec<(u64,Rc<Adjacency>)>> = const { RefCell::new(Vec::new()) }; }
struct PreparedSolve { order:Vec<usize>, factor:CscCholesky<f64> }
thread_local! { static FACTORS: RefCell<Vec<(u64,Rc<PreparedSolve>)>> = const { RefCell::new(Vec::new()) }; }

fn prepare(key:u64,adj:&Adjacency,diag:&[f64],strengths:&[f64])->Option<Rc<PreparedSolve>> {
    let mut hash=std::collections::hash_map::DefaultHasher::new();key.hash(&mut hash);for s in strengths{s.to_bits().hash(&mut hash);}let matrix_key=hash.finish();
    FACTORS.with(|cache|{let mut entries=cache.borrow_mut();if let Some((_,factor))=entries.iter().find(|(k,_)|*k==matrix_key){return Some(Rc::clone(factor));}
        // Reverse Cuthill–McKee reduces fill before sparse Cholesky factorization.
        let n=adj.len();let mut seen=vec![false;n];let mut order=Vec::with_capacity(n);
        while order.len()<n {let root=(0..n).filter(|i|!seen[*i]).min_by_key(|i|adj[*i].len()).unwrap();seen[root]=true;let mut queue=VecDeque::from([root]);while let Some(i)=queue.pop_front(){order.push(i);let mut next:Vec<_>=adj[i].iter().map(|(j,_)|*j).filter(|j|!seen[*j]).collect();next.sort_by_key(|j|(adj[*j].len(),*j));for j in next{if !seen[j]{seen[j]=true;queue.push_back(j);}}}}
        order.reverse();let mut inverse=vec![0;n];for(i,j)in order.iter().enumerate(){inverse[*j]=i;}let mut coo=CooMatrix::new(n,n);
        for i in 0..n{coo.push(inverse[i],inverse[i],diag[i]);for &(j,w) in &adj[i]{coo.push(inverse[i],inverse[j],-w);}}
        let matrix=CscMatrix::from(&coo);let factor=CscCholesky::factor(&matrix).ok()?;let prepared=Rc::new(PreparedSolve{order,factor});if entries.len()>=8{entries.remove(0);}entries.push((matrix_key,Rc::clone(&prepared)));Some(prepared)
    })
}

#[no_mangle]
pub extern "C" fn alloc(len: usize) -> *mut f64 {
    let buffer = vec![0.0; len].into_boxed_slice(); Box::into_raw(buffer) as *mut f64
}
#[no_mangle]
pub unsafe extern "C" fn free(ptr: *mut f64, len: usize) { if !ptr.is_null() { drop(Box::from_raw(std::ptr::slice_from_raw_parts_mut(ptr, len))); } }
#[no_mangle]
pub extern "C" fn output_ptr() -> *const f64 { OUTPUT.with(|o| o.borrow().as_ptr()) }
#[no_mangle]
pub extern "C" fn output_len() -> usize { OUTPUT.with(|o| o.borrow().len()) }

#[derive(Clone)]
struct Vertex { point: Point2<f64>, index: usize }
impl HasPosition for Vertex { type Scalar = f64; fn position(&self) -> Point2<f64> { self.point } }

fn triangulate(mask: &[f64], cols: usize, rows: usize, step: f64, spacing: f64, width: f64, height: f64, pins: &[f64]) -> Vec<f64> {
    let inside = |x: isize, y: isize| x >= 0 && y >= 0 && (x as usize) < cols && (y as usize) < rows && mask[y as usize * cols + x as usize] > 0.0;
    let mut cdt = ConstrainedDelaunayTriangulation::<Vertex>::new();
    let mut handles = HashMap::new(); let mut vertices = Vec::new();
    let mut insert = |x: f64, y: f64, cdt: &mut ConstrainedDelaunayTriangulation<Vertex>| {
        let key = ((x * 1000.0).round() as i64, (y * 1000.0).round() as i64);
        if let Some(h) = handles.get(&key) { return *h; }
        let index = vertices.len() / 2; vertices.extend([x, y]);
        let h = cdt.insert(Vertex { point: Point2::new(x, y), index }).unwrap(); handles.insert(key, h); h
    };
    for y in 0..rows { for x in 0..cols {
        if !inside(x as isize, y as isize) { continue; }
        let x0 = x as f64 * step; let y0 = y as f64 * step; let x1 = (x0 + step).min(width); let y1 = (y0 + step).min(height);
        let edges = [((x0,y0),(x1,y0),x as isize,y as isize-1), ((x1,y0),(x1,y1),x as isize+1,y as isize), ((x1,y1),(x0,y1),x as isize,y as isize+1), ((x0,y1),(x0,y0),x as isize-1,y as isize)];
        for (a,b,nx,ny) in edges { if !inside(nx,ny) && a != b { let h1=insert(a.0,a.1,&mut cdt); let h2=insert(b.0,b.1,&mut cdt); if cdt.can_add_constraint(h1,h2) { cdt.add_constraint(h1,h2); } } }
    } }
    let mut y = spacing / 2.0;
    while y < height { let mut x = spacing / 2.0; while x < width { if inside((x / step) as isize, (y / step) as isize) { insert(x,y,&mut cdt); } x += spacing; } y += spacing; }
    for pin in pins.chunks_exact(2) { if pin[0].is_finite() && pin[1].is_finite() && inside((pin[0]/step) as isize,(pin[1]/step) as isize) { insert(pin[0],pin[1],&mut cdt); } }
    let mut triangles = Vec::new();
    for face in cdt.inner_faces() { let v = face.vertices(); let cx = (v[0].position().x+v[1].position().x+v[2].position().x)/3.0; let cy = (v[0].position().y+v[1].position().y+v[2].position().y)/3.0; if inside((cx/step) as isize,(cy/step) as isize) { triangles.extend(v.map(|p| p.data().index as f64)); } }
    let mut out = vec![(vertices.len()/2) as f64, (triangles.len()/3) as f64]; out.extend(vertices); out.extend(triangles); out
}

#[no_mangle]
pub unsafe extern "C" fn mesh(mask_ptr: *const f64, cols: usize, rows: usize, step: f64, spacing: f64, width: f64, height: f64, pins_ptr: *const f64, pin_count: usize) {
    if cols == 0 || rows == 0 || cols*rows > 1_048_576 || !step.is_finite() || step <= 0.0 || !spacing.is_finite() || spacing <= 0.0 { OUTPUT.with(|o| *o.borrow_mut() = vec![0.0,0.0]); return; }
    let mask=std::slice::from_raw_parts(mask_ptr,cols*rows); let pins=std::slice::from_raw_parts(pins_ptr,pin_count*2);
    let result=triangulate(mask,cols,rows,step,spacing,width,height,pins); OUTPUT.with(|o| *o.borrow_mut()=result);
}

pub fn arap(rest: &[f64], triangles: &[usize], targets: &[f64], strengths: &[f64], rigidity: &[f64]) -> Vec<f64> {
    let n=rest.len()/2; if n==0 { return Vec::new(); }
    if targets.iter().zip(rest).all(|(a,b)|(a-b).abs()<1e-10) {return rest.to_vec();}
    let mut hash=std::collections::hash_map::DefaultHasher::new();n.hash(&mut hash);triangles.hash(&mut hash);for value in rest.iter().chain(rigidity){value.to_bits().hash(&mut hash);}let key=hash.finish();
    let adj=TOPOLOGY.with(|cache|{let mut entries=cache.borrow_mut();if let Some((_,adj))=entries.iter().find(|(k,_)|*k==key){return Rc::clone(adj);}let mut edges=HashSet::new();for triangle in triangles.chunks_exact(3){for(a,b)in[(triangle[0],triangle[1]),(triangle[1],triangle[2]),(triangle[2],triangle[0])]{if a<n&&b<n&&a!=b{edges.insert((a.min(b),a.max(b)));}}}let mut ordered:Vec<_>=edges.into_iter().collect();ordered.sort_unstable();let mut adj=vec![Vec::<(usize,f64)>::new();n];for(a,b)in ordered{let weight=1.0+8.0*(rigidity[a]+rigidity[b])/2.0;adj[a].push((b,weight));adj[b].push((a,weight));}let adj=Rc::new(adj);if entries.len()>=16{entries.remove(0);}entries.push((key,Rc::clone(&adj)));adj});
    let diag:Vec<f64>=(0..n).map(|i| adj[i].iter().map(|(_,w)|w).sum::<f64>()+strengths[i].max(0.0)+1e-6).collect();
    let prepared=prepare(key,&adj,&diag,strengths);
    let mut p=targets.to_vec(); let mut rotations=vec![(1.0,0.0);n];
    for _ in 0..8 {
        for i in 0..n { let (mut dot,mut cross)=(0.0,0.0); for &(j,w) in &adj[i] { let rx=rest[2*i]-rest[2*j]; let ry=rest[2*i+1]-rest[2*j+1]; let px=p[2*i]-p[2*j]; let py=p[2*i+1]-p[2*j+1]; dot+=w*(rx*px+ry*py); cross+=w*(rx*py-ry*px); } let angle=cross.atan2(dot); rotations[i]=(angle.cos(),angle.sin()); }
        for axis in 0..2 {
            let mut rhs=vec![0.0;n];
            for i in 0..n { rhs[i]=strengths[i].max(0.0)*targets[2*i+axis]+1e-6*rest[2*i+axis]; for &(j,w) in &adj[i] { let dx=rest[2*i]-rest[2*j]; let dy=rest[2*i+1]-rest[2*j+1]; let c=(rotations[i].0+rotations[j].0)/2.0; let s=(rotations[i].1+rotations[j].1)/2.0; rhs[i]+=w*if axis==0 {c*dx-s*dy} else {s*dx+c*dy}; } }
            if let Some(prepared)=&prepared{let ordered=DMatrix::from_column_slice(n,1,&prepared.order.iter().map(|i|rhs[*i]).collect::<Vec<_>>());let solution=prepared.factor.solve(&ordered);for(i,j)in prepared.order.iter().enumerate(){p[2*j+axis]=if solution[i].is_finite(){solution[i]}else{rest[2*j+axis]};}continue;}
            let mut x:Vec<f64>=(0..n).map(|i|p[2*i+axis]).collect();
            let apply=|v:&[f64]| -> Vec<f64> {(0..n).map(|i|diag[i]*v[i]-adj[i].iter().map(|&(j,w)|w*v[j]).sum::<f64>()).collect()};
            let ax=apply(&x); let mut r:Vec<f64>=(0..n).map(|i|rhs[i]-ax[i]).collect(); let mut z:Vec<f64>=(0..n).map(|i|r[i]/diag[i]).collect(); let mut d=z.clone(); let mut rz:f64=r.iter().zip(&z).map(|(a,b)|a*b).sum();
            for _ in 0..60 { if rz.abs()<1e-8 {break;} let ad=apply(&d); let denom:f64=d.iter().zip(&ad).map(|(a,b)|a*b).sum(); if denom.abs()<1e-20 {break;} let alpha=rz/denom; for i in 0..n {x[i]+=alpha*d[i];r[i]-=alpha*ad[i];z[i]=r[i]/diag[i];} let next:f64=r.iter().zip(&z).map(|(a,b)|a*b).sum(); let beta=next/rz; for i in 0..n {d[i]=z[i]+beta*d[i];} rz=next; }
            for i in 0..n {p[2*i+axis]=if x[i].is_finite(){x[i]}else{rest[2*i+axis]};}
        }
    }
    p
}

#[no_mangle]
pub unsafe extern "C" fn solve(rest_ptr:*const f64,n:usize,tri_ptr:*const f64,tri_count:usize,target_ptr:*const f64,strength_ptr:*const f64,rigid_ptr:*const f64) {
    let rest=std::slice::from_raw_parts(rest_ptr,n*2); let triangles:Vec<usize>=std::slice::from_raw_parts(tri_ptr,tri_count).iter().map(|v|*v as usize).collect(); let targets=std::slice::from_raw_parts(target_ptr,n*2); let strengths=std::slice::from_raw_parts(strength_ptr,n); let rigidity=std::slice::from_raw_parts(rigid_ptr,n);
    let result=arap(rest,&triangles,targets,strengths,rigidity); OUTPUT.with(|o|*o.borrow_mut()=result);
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn transparent_hole_and_island() { let mask=vec![1.,1.,1.,0.,1., 1.,0.,1.,0.,0., 1.,1.,1.,0.,0.]; let result=triangulate(&mask,5,3,10.,8.,50.,30.,&[]); let n=result[0] as usize; let verts=&result[2..2+2*n]; for tri in result[2+2*n..].chunks_exact(3) { let x=tri.iter().map(|i|verts[*i as usize*2]).sum::<f64>()/3.; let y=tri.iter().map(|i|verts[*i as usize*2+1]).sum::<f64>()/3.; assert!(mask[(y/10.) as usize*5+(x/10.) as usize]>0.); } }
    #[test] fn arap_rest_and_translation() { let rest=vec![0.,0.,10.,0.,10.,10.,0.,10.]; let triangles=vec![0,1,2,0,2,3]; let targets:Vec<f64>=rest.iter().enumerate().map(|(i,v)|v+if i%2==0{7.}else{-3.}).collect(); let result=arap(&rest,&triangles,&targets,&[10000.;4],&[0.;4]); for (a,b) in result.iter().zip(targets) {assert!((a-b).abs()<0.001);} }
    #[test] fn contradictory_constraints_stay_finite() { let rest=vec![0.,0.,10.,0.,10.,10.,0.,10.]; let result=arap(&rest,&[0,1,2,0,2,3],&[0.,0.,-100.,200.,0.,0.,500.,-500.],&[10000.;4],&[1.;4]); assert!(result.iter().all(|n|n.is_finite())); }
}
