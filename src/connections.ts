import type { Layer, Rig, Scene, EvaluatedScene, LayerAttachment } from './model';
import { bonePoses } from './rigging';
import { identity, multiply, inverseMatrix, layerMatrix } from './transforms';

export type MeshPose = {vertices: Float32Array; depths: Float32Array};

// A control frame stays in artwork coordinates. The connection's bind matrix
// preserves placement without flattening layers or changing their draw order.
export function controlFrame(rig: Rig | undefined, pose: MeshPose | undefined, attachment: LayerAttachment): number[] {
  if (!rig || attachment.kind==='layer') return identity();
  if (attachment.kind==='bone') {
    const bone=rig.bones.find(b=>b.id===attachment.controlId);
    if (!bone) return identity();
    const p=bonePoses(rig.bones).get(bone.id)!, dx=bone.end.x-bone.start.x, dy=bone.end.y-bone.start.y;
    const c=Math.cos(p.angle),s=Math.sin(p.angle),a=p.angle+Math.atan2(dy,dx);
    return [Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),p.start.x+c*dx-s*dy,p.start.y+s*dx+c*dy];
  }
  const pin=rig.pins.find(p=>p.id===attachment.controlId);
  if (!pin) return identity();
  const fallback=[1,0,0,1,pin.kind==='fixed'?pin.rest.x:pin.position.x,pin.kind==='fixed'?pin.rest.y:pin.position.y];
  if (!pose) return fallback;
  const rest=rig.mesh.vertices,triangles=rig.mesh.triangles;
  let nearest: number[] | undefined, distance=Infinity;
  for (let i=0;i<triangles.length;i+=3) {
    const a=triangles[i]*2,b=triangles[i+1]*2,c=triangles[i+2]*2;
    const basis=[rest[b]-rest[a],rest[b+1]-rest[a+1],rest[c]-rest[a],rest[c+1]-rest[a+1],rest[a],rest[a+1]];
    if (Math.abs(basis[0]*basis[3]-basis[1]*basis[2])<1e-8) continue;
    const inv=inverseMatrix(basis),u=inv[0]*pin.rest.x+inv[2]*pin.rest.y+inv[4],v=inv[1]*pin.rest.x+inv[3]*pin.rest.y+inv[5];
    const penalty=Math.max(0,-u)+Math.max(0,-v)+Math.max(0,u+v-1);
    if (penalty<distance) {distance=penalty;nearest=[a,b,c,...basis];}
    if (penalty<1e-8) break;
  }
  if (!nearest) return fallback;
  const [a,b,c,...basis]=nearest,verts=pose.vertices;
  const affine=multiply([verts[b]-verts[a],verts[b+1]-verts[a+1],verts[c]-verts[a],verts[c+1]-verts[a+1],verts[a],verts[a+1]],inverseMatrix(basis));
  if (!affine.every(Number.isFinite)||Math.abs(affine[0]*affine[3]-affine[1]*affine[2])<1e-8) return fallback;
  return [affine[0],affine[1],affine[2],affine[3],affine[0]*pin.rest.x+affine[2]*pin.rest.y+affine[4],affine[1]*pin.rest.x+affine[3]*pin.rest.y+affine[5]];
}

export function worldMatrices(scene: Scene, rigs: Map<string,Rig>, poses: Map<string,MeshPose>) {
  const byId=new Map(scene.layers.map(l=>[l.id,l])),worlds=new Map<string,number[]>(),visiting=new Set<string>();
  function world(layer: Layer): number[] {
    if (worlds.has(layer.id)) return worlds.get(layer.id)!;
    if (visiting.has(layer.id)) throw new Error('These pieces would create a circular rig connection.');
    visiting.add(layer.id);
    const attachment=layer.attachment,target=attachment&&byId.get(attachment.layerId),parent=byId.get(layer.parentId??'');
    const base=target?multiply(world(target),controlFrame(rigs.get(target.id),poses.get(target.id),attachment!)):parent?world(parent):identity();
    const result=multiply(base,multiply(layer.rigPlacement??identity(),layerMatrix(layer.transform)));
    visiting.delete(layer.id);worlds.set(layer.id,result);return result;
  }
  for (const layer of scene.layers) world(layer);
  return worlds;
}

export function canConnect(scene: Scene, childId: string, targetId: string) {
  const byId=new Map(scene.layers.map(l=>[l.id,l])),visited=new Set<string>();
  function reaches(id: string): boolean {
    if (id===childId) return true;
    if (visited.has(id)) return false;
    visited.add(id);const layer=byId.get(id);
    return !!layer&&[layer.parentId,layer.attachment?.layerId].some(parent=>!!parent&&reaches(parent));
  }
  return byId.has(childId)&&byId.has(targetId)&&!reaches(targetId);
}

export function bindPieces(scene: Scene, childIds: string[], attachment: LayerAttachment | undefined, frame: EvaluatedScene) {
  const worlds=new Map(Object.entries(frame.worlds??Object.fromEntries(frame.layers.map(l=>[l.id,l.world]))));
  const target=attachment&&frame.layers.find(l=>l.id===attachment.layerId);
  const targetWorld=attachment&&worlds.get(attachment.layerId);
  if (attachment&&!targetWorld) throw new Error('The connection target is unavailable.');
  for (const id of childIds) {
    const layer=scene.layers.find(l=>l.id===id);if(!layer||!worlds.has(id))continue;
    if (attachment&&!canConnect(scene,id,attachment.layerId)) throw new Error('These pieces would create a circular rig connection.');
    const base=attachment?multiply(targetWorld!,controlFrame(frame.rigs?.[attachment.layerId]??target?.rig,frame.poses?.[attachment.layerId]??target,attachment)):worlds.get(layer.parentId??'')??identity();
    if (Math.abs(base[0]*base[3]-base[1]*base[2])<1e-10) throw new Error('Reset the target scale before connecting this piece.');
    const local=layerMatrix(layer.transform);if(Math.abs(local[0]*local[3]-local[1]*local[2])<1e-10)throw new Error('Reset the piece scale before connecting it.');
    layer.rigPlacement=multiply(inverseMatrix(base),multiply(worlds.get(id)!,inverseMatrix(local)));
    layer.attachment=attachment?{...attachment}:undefined;
  }
}

export function connectedPieceIds(scene: Scene, rootId: string) {
  const ids=new Set([rootId]);let changed=true;
  while(changed){changed=false;for(const l of scene.layers)if((l.parentId&&ids.has(l.parentId)||l.attachment&&ids.has(l.attachment.layerId))&&!ids.has(l.id)){ids.add(l.id);changed=true;}}
  return ids;
}
