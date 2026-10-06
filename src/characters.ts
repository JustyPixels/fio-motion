import { snapshot } from './animation';
import { id, makeLayer, type Bone, type CharacterDefinition, type CharacterInstance, type Project, type Scene, type EvaluatedScene, type Point, type Rig } from './model';
import { applyMatrix, identity, inverseMatrix, multiply } from './transforms';
import { bonePoses } from './rigging';
import { connectedPieceIds } from './connections';

export const roles=['torso','head','leftArm','leftUpperArm','leftForearm','leftHand','rightArm','rightUpperArm','rightForearm','rightHand','leftLeg','leftThigh','leftShin','leftFoot','rightLeg','rightThigh','rightShin','rightFoot'] as const;
export type Role=typeof roles[number];
export type Joint='neck'|'hip'|'leftShoulder'|'leftElbow'|'leftWrist'|'rightShoulder'|'rightElbow'|'rightWrist'|'leftHip'|'leftKnee'|'leftAnkle'|'rightHip'|'rightKnee'|'rightAnkle';
export type HumanoidDraft={name:string;assignments:Partial<Record<Role,string>>;joints:Record<Joint,Point>;copy:boolean};
export function initialHumanoid(project:Project,scene:Scene):HumanoidDraft {
  const w=project.width,h=project.height,pt=(x:number,y:number)=>({x:w*x,y:h*y});
  const assignments:HumanoidDraft['assignments']={};
  const names:Record<string,string[]>={torso:['body','torso','corpo','tronco'],head:['head','cabeça'],leftArm:['left arm','braço esquerdo'],rightArm:['right arm','braço direito'],leftLeg:['left leg','perna esquerda'],rightLeg:['right leg','perna direita']};
  for(const [role,aliases] of Object.entries(names)){const l=scene.layers.find(l=>l.kind==='image'&&aliases.includes(l.name.toLowerCase()));if(l)assignments[role as Role]=l.id;}
  return {name:'Character',assignments,copy:false,joints:{neck:pt(.5,.25),hip:pt(.5,.55),leftShoulder:pt(.4,.3),leftElbow:pt(.3,.43),leftWrist:pt(.24,.56),rightShoulder:pt(.6,.3),rightElbow:pt(.7,.43),rightWrist:pt(.76,.56),leftHip:pt(.44,.55),leftKnee:pt(.42,.72),leftAnkle:pt(.4,.9),rightHip:pt(.56,.55),rightKnee:pt(.58,.72),rightAnkle:pt(.6,.9)}};
}
export function humanoidBones(d:HumanoidDraft):Bone[]{
  const j=d.joints,b=(name:string,start:Point,end:Point,parentId?:string):Bone=>({id:name,ikEnabled:name.endsWith('Forearm')||name.endsWith('Shin'),name:name.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),parentId,start:{...start},end:{...end},angle:0,minAngle:-180,maxAngle:180,weights:[]});
  return [b('spine',j.hip,j.neck),...(['left','right'] as const).flatMap(s=>[
    b(`${s}UpperArm`,j[`${s}Shoulder`],j[`${s}Elbow`],'spine'),b(`${s}Forearm`,j[`${s}Elbow`],j[`${s}Wrist`],`${s}UpperArm`),
    b(`${s}Thigh`,j[`${s}Hip`],j[`${s}Knee`]),b(`${s}Shin`,j[`${s}Knee`],j[`${s}Ankle`],`${s}Thigh`)
  ])];
}
function influences(role:string){if(role==='torso'||role==='head')return ['spine'];if(role.endsWith('Arm')&&!role.endsWith('UpperArm')){const s=role.startsWith('left')?'left':'right';return [`${s}UpperArm`,`${s}Forearm`];}if(role.endsWith('Leg')){const s=role.startsWith('left')?'left':'right';return [`${s}Thigh`,`${s}Shin`];}return [role.replace('Hand','Forearm').replace('Foot','Shin')];}
export function partWeights(vertices:number[],rest:number[],bones:Bone[],ids:string[]):number[][]{
  const weights=ids.map(()=>[] as number[]);
  for(let i=0;i<vertices.length;i+=2){const p=applyMatrix(rest,{x:vertices[i],y:vertices[i+1]}),values=ids.map(id=>{const b=bones.find(b=>b.id===id)!;const dx=b.end.x-b.start.x,dy=b.end.y-b.start.y,t=Math.max(0,Math.min(1,((p.x-b.start.x)*dx+(p.y-b.start.y)*dy)/(dx*dx+dy*dy||1)));return 1/(Math.hypot(p.x-b.start.x-t*dx,p.y-b.start.y-t*dy)+6)**2;}),sum=values.reduce((a,b)=>a+b,0);values.forEach((v,k)=>weights[k].push(v/sum));}return weights;
}
export function applyHumanoid(project:Project,scene:Scene,d:HumanoidDraft,worlds:Record<string,number[]>,prepared:Map<string,Rig>){
  const ids=Object.values(d.assignments).filter(Boolean) as string[];
  if(!d.assignments.torso||!ids.length||new Set(ids).size!==ids.length)throw new Error('Assign a torso and use each layer only once.');
  for(const side of ['left','right'])for(const [whole,a,b]of [['Arm','UpperArm','Forearm'],['Leg','Thigh','Shin']])if(d.assignments[`${side}${whole}` as Role]&&(d.assignments[`${side}${a}` as Role]||d.assignments[`${side}${b}` as Role]))throw new Error('Choose a whole limb or separate segments, not both.');
  const hasExisting=ids.some(v=>scene.layers.find(l=>l.id===v)?.rigId||scene.tracks.some(t=>t.targetId===v)||scene.characters.some(c=>c.parts.some(p=>p.layerId===v)));
  if(hasExisting&&!d.copy)throw new Error('These pieces already have a rig or animation. Enable work on a copy.');
  const root=makeLayer(d.name),bones=humanoidBones(d).map(b=>({...b,start:{x:b.start.x-d.joints.hip.x,y:b.start.y-d.joints.hip.y},end:{x:b.end.x-d.joints.hip.x,y:b.end.y-d.joints.hip.y}})),rig:Rig={id:id(),revision:1,controlOnly:true,mesh:{vertices:[],triangles:[],width:project.width,height:project.height,revision:1},pins:[],bones,density:24,expansion:0};root.rigId=rig.id;root.transform.position={...d.joints.hip};
  const definition:CharacterDefinition={id:id(),name:d.name,rigId:rig.id,parts:[]},instance:CharacterInstance={id:id(),definitionId:definition.id,rootLayerId:root.id,parts:[]};
  for(const [role,layerId]of Object.entries(d.assignments)){if(!layerId)continue;const source=scene.layers.find(l=>l.id===layerId)!;if(source.locked)throw new Error('Unlock the selected pieces before connecting them.');const l=d.copy?snapshot(source):source;if(d.copy){l.id=id();scene.layers.splice(scene.layers.indexOf(source),0,l);source.visible=false;}const meshRig=structuredClone(prepared.get(layerId)!);meshRig.id=id();project.rigs.push(meshRig);l.rigId=meshRig.id;l.attachment={layerId:root.id,kind:'layer'};l.rigPlacement=undefined;
    const rest=multiply([1,0,0,1,-d.joints.hip.x,-d.joints.hip.y],worlds[layerId]??identity());l.transform={position:{x:0,y:0},scale:{x:1,y:1},rotation:0};l.rigPlacement=[...rest];
    const boneIds=influences(role);definition.parts.push({slot:role,role,boneIds,meshRevision:meshRig.mesh.revision,weights:partWeights(meshRig.mesh.vertices,rest,bones,boneIds)});instance.parts.push({slot:role,layerId:l.id,rest:[...rest]});}
  scene.layers.push(root);project.rigs.push(rig);project.characterDefinitions.push(definition);scene.characters.push(instance);return root.id;
}
export function skinCharacter(rig:Rig,definition:CharacterDefinition,part:CharacterInstance['parts'][number],skeleton:Rig){
  const binding=definition.parts.find(p=>p.slot===part.slot);if(!binding)return;const poses=bonePoses(skeleton.bones),inv=inverseMatrix(part.rest),out:number[]=[];
  for(let i=0;i<rig.mesh.vertices.length;i+=2){const rest=applyMatrix(part.rest,{x:rig.mesh.vertices[i],y:rig.mesh.vertices[i+1]}),p={x:0,y:0};let total=0;
    binding.boneIds.forEach((id,k)=>{const b=skeleton.bones.find(b=>b.id===id),pose=poses.get(id),w=binding.weights[k]?.[i/2]??0;if(!b||!pose)return;const dx=rest.x-b.start.x,dy=rest.y-b.start.y;p.x+=w*(pose.start.x+Math.cos(pose.angle)*dx-Math.sin(pose.angle)*dy);p.y+=w*(pose.start.y+Math.sin(pose.angle)*dx+Math.cos(pose.angle)*dy);total+=w;});const local=applyMatrix(inv,total?{x:p.x/total,y:p.y/total}:rest);out.push(local.x,local.y);}
  rig.characterVertices=out;
}
export function characterRoot(scene:Scene,layerId:string){const c=scene.characters.find(c=>c.rootLayerId===layerId||c.parts.some(p=>p.layerId===layerId));if(c)return c.rootLayerId;let l=scene.layers.find(l=>l.id===layerId),seen=new Set<string>();while(l?.attachment&&!seen.has(l.id)){seen.add(l.id);l=scene.layers.find(p=>p.id===l!.attachment!.layerId);}return l?.id??layerId;}
export function copyCharacterMetadata(scene:Scene,source:Scene,mapping:Map<string,string>){for(const c of source.characters??[])if(mapping.has(c.rootLayerId))scene.characters.push({...snapshot(c),id:id(),rootLayerId:mapping.get(c.rootLayerId)!,parts:c.parts.filter(p=>mapping.has(p.layerId)).map(p=>({...p,layerId:mapping.get(p.layerId)!}))});}
export { connectedPieceIds };

export function refreshCharacterWeights(project:Project){
 for(const scene of project.scenes)for(const instance of scene.characters){const definition=project.characterDefinitions.find(d=>d.id===instance.definitionId),skeleton=project.rigs.find(r=>r.id===definition?.rigId);if(!definition||!skeleton)continue;for(const part of instance.parts){const layer=scene.layers.find(l=>l.id===part.layerId),rig=project.rigs.find(r=>r.id===layer?.rigId),binding=definition.parts.find(p=>p.slot===part.slot);if(rig&&binding&&binding.meshRevision!==rig.mesh.revision){binding.weights=partWeights(rig.mesh.vertices,part.rest,skeleton.bones,binding.boneIds);binding.meshRevision=rig.mesh.revision;}}}
}

// Keep artwork UVs in the original mesh while preserving the solved shape when
// a weighted member becomes an ordinary connected or disconnected piece.
export function detachCharacterParts(project:Project,scene:Scene,ids:string[],frame:EvaluatedScene){
  for(const c of scene.characters)for(const part of c.parts.filter(p=>ids.includes(p.layerId))){const layer=scene.layers.find(l=>l.id===part.layerId)!,source=project.rigs.find(r=>r.id===layer.rigId),pose=frame.poses?.[layer.id];if(source&&pose){const rig=snapshot(source);rig.id=id();rig.frozenVertices=Array.from(pose.vertices);delete rig.characterVertices;project.rigs.push(rig);layer.rigId=rig.id;}}
  for(const c of scene.characters)c.parts=c.parts.filter(p=>!ids.includes(p.layerId));
}
