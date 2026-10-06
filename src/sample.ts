import { bindPieces } from './connections';
import { type Asset, type Project, type Pin, id, makeProject, makeLayer } from './model';
import { Engine } from './engine';
import { addKey } from './animation';
async function illustration(name:string,body:string,width:number,height:number):Promise<Asset>{const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,image=new Image();image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;await image.decode();const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.drawImage(image,0,0);return {id:id(),name,type:'image',mime:'image/png',width,height,data:canvas.toDataURL()};}
export async function sampleProject(engine:Engine):Promise<Project>{
  const p=makeProject(),scene=p.scenes[0];p.name='A little hello';p.scenes[0].name='01 · A little hello';
  const shapes=[
    ['Head',430,300,745,185,`<path d="M70 128 L40 24 Q37 9 56 16 L142 71 Q213 29 286 71 L378 15 Q391 9 389 30 L361 136 Q396 187 365 238 Q328 294 215 294 Q99 294 61 237 Q32 186 70 128" fill="#e89a5c"/><path d="M65 45 L86 112 L127 79Z M367 46L343 113L302 80Z" fill="#9f573e"/><path d="M69 182 Q91 141 146 171 Q184 203 214 245 Q244 203 282 171 Q336 143 362 182 Q373 259 215 287 Q57 259 69 182" fill="#fff1d7"/><path d="M133 161Q149 150 166 161 M266 161Q283 150 299 161" fill="none" stroke="#4c3d36" stroke-width="11" stroke-linecap="round"/><path d="M195 224Q215 212 235 224Q216 246 195 224" fill="#4c3d36"/><path d="M214 242V256M193 262Q214 280 235 262" fill="none" stroke="#4c3d36" stroke-width="6" stroke-linecap="round"/><ellipse cx="116" cy="196" rx="20" ry="10" fill="#e69b83"/><ellipse cx="312" cy="196" rx="20" ry="10" fill="#e69b83"/>`],
    ['Scarf',290,140,813,434,`<path d="M28 13Q143 59 263 13L259 75Q143 111 34 77Z" fill="#8576c9"/><path d="M152 71L232 88L239 139L165 123Z" fill="#7263b3"/><path d="M37 21Q143 64 257 23" stroke="#a99cde" stroke-width="9" fill="none"/>`],
    ['Left arm',260,300,640,469,`<path d="M206 42 Q165 35 139 88 L87 181 Q60 219 30 229 Q6 248 27 268 Q61 298 109 256 L181 172 Q243 110 231 63Z" fill="#57948a"/><path d="M73 214Q51 230 29 234Q8 248 27 268Q52 285 82 269L105 248Z" fill="#e89a5c"/><path d="M182 53Q145 89 128 128" stroke="#78b0a2" stroke-width="11" stroke-linecap="round" fill="none"/>`],
    ['Right arm',280,350,1023,452,`<path d="M45 39Q78 25 97 61L137 144L217 172Q259 187 250 221Q239 251 208 243L119 213Q88 205 71 170L22 80Q8 48 45 39" fill="#57948a"/><path d="M202 166Q238 155 260 177Q280 202 257 228Q239 252 210 240L195 210Z" fill="#e89a5c"/><path d="M39 58L81 142" stroke="#78b0a2" stroke-width="11" stroke-linecap="round"/>`],
    ['Body',310,360,806,478,`<path d="M67 0Q155 33 244 0L279 280Q164 335 35 281Z" fill="#57948a"/><path d="M129 32H184V288H129Z" fill="#4a837c"/><circle cx="158" cy="104" r="7" fill="#d7d7aa"/><circle cx="158" cy="160" r="7" fill="#d7d7aa"/><path d="M57 226L110 234L106 278L48 268Z M204 236L259 225L270 268L211 280Z" fill="#78ab9c"/><path d="M48 286L136 301L122 355H28Q17 325 48 286M178 302L262 287Q294 325 280 355H188Z" fill="#453e43"/>`],
    ['Tail',430,300,1042,638,`<path d="M49 187Q153 239 228 191Q287 152 284 56Q284 19 313 27Q402 62 408 139Q414 245 295 279Q192 315 48 247Z" fill="#d7864f"/><path d="M284 57Q290 12 319 29Q383 51 403 113Q372 118 356 143Q324 124 291 132Z" fill="#fff1d7"/>`],
  ] as const;
  for(const [name,w,h,x,y,svg] of shapes){const asset=await illustration(name,svg,w,h);p.assets.push(asset);const layer=makeLayer(name,asset.id);layer.transform.position={x,y};scene.layers.push(layer);}
  const right=scene.layers.find(l=>l.name==='Right arm')!,asset=p.assets.find(a=>a.id===right.assetId)!;
  const pins:Pin[]=[{id:id(),name:'Shoulder',kind:'fixed',rest:{x:49,y:57},position:{x:49,y:57},radius:90,strength:1,angle:0,scale:1,depth:0},{id:id(),name:'Hand',kind:'move',rest:{x:235,y:201},position:{x:235,y:201},radius:90,strength:1,angle:0,scale:1,depth:0}];
  const mesh=await engine.mesh(asset,24,4,pins),rig={id:id(),revision:1,mesh,pins,bones:[],density:24,expansion:4};p.rigs.push(rig);right.rigId=rig.id;
  const hand=pins[1],property=`rig/pins/${hand.id}/position`;
  for(const [time,x,y] of [[0,235,201],[1.2,212,80],[2,240,110],[2.8,205,68],[3.6,240,110],[4.4,210,78],[5.5,235,201],[8,235,201]])addKey(scene,right.id,property,time,{x,y},24);
  p.clips.push({id:id(),name:'A friendly wave',duration:8,sourceRigId:rig.id,tracks:structuredClone(scene.tracks)});
  const body=scene.layers.find(l=>l.name==='Body')!;
  bindPieces(scene,scene.layers.filter(l=>l.id!==body.id).map(l=>l.id),{layerId:body.id,kind:'layer'},await engine.evaluate(p,{...scene,tracks:[],clips:[]},0));
  return p;
}
