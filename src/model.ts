export type Point = { x: number; y: number };
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten';
export type Ease = { mode: 'bezier' | 'linear' | 'hold'; handles: [number, number, number, number] };
export const SMOOTH: Ease = { mode: 'bezier', handles: [.42, 0, .58, 1] };
export type Keyframe = { id: string; time: number; value: number | Point; ease: Ease; inSpatial?: Point; outSpatial?: Point };
export type AnimationTrack = { id: string; targetId: string; property: string; keys: Keyframe[]; muted?: boolean };
export type PinKind = 'move' | 'fixed' | 'stiff' | 'transform' | 'overlap';
export type Pin = { id: string; name: string; kind: PinKind; rest: Point; position: Point; radius: number; strength: number; angle: number; scale: number; depth: number };
export type Bone = { id: string; name: string; parentId?: string; start: Point; end: Point; angle: number; minAngle: number; maxAngle: number; ikTarget?: Point; ikEnabled?: boolean; weights: number[] };
export type Mesh = { vertices: number[]; triangles: number[]; width: number; height: number; revision: number };
export type Rig = { id: string; revision: number; mesh: Mesh; pins: Pin[]; bones: Bone[]; density: number; expansion: number; controlOnly?: boolean; characterVertices?: number[]; frozenVertices?: number[] };
export type CharacterDefinition = { id: string; name: string; rigId: string; parts: { slot: string; role: string; boneIds: string[]; weights: number[][]; meshRevision?: number }[] };
export type CharacterInstance = { id: string; definitionId: string; rootLayerId: string; parts: { slot: string; layerId: string; rest: number[] }[] };
export type Transform = { position: Point; scale: Point; rotation: number };
export type Effects = { blur: number; tint: string; tintAmount: number; shadow: number; motionBlur: boolean };
export type Mask = { enabled: boolean; position: Point; size: Point; feather: number; invert: boolean; assetId?: string; offset?: Point; outside?: number };
export type LayerAttachment = { layerId: string; kind: 'layer' | 'pin' | 'bone'; controlId?: string };
export type Layer = { attachment?: LayerAttachment; rigPlacement?: number[]; id: string; name: string; kind: 'image' | 'group'; passThrough?: boolean; assetId?: string; rigId?: string; parentId?: string; visible: boolean; locked: boolean; solo: boolean; collapsed: boolean; opacity: number; blend: BlendMode; clipping: boolean; transform: Transform; effects: Effects; mask: Mask; swapAssetIds?: string[]; swapIndex?: number };
export type Asset = { id: string; name: string; type: 'image' | 'audio'; mime: string; width: number; height: number; data: string; sourceLayerId?: string; waveform?: number[]; duration?: number; path?: string };
export type Camera = { position: Point; zoom: number; rotation: number };
export type Marker = { id: string; time: number; label: string };
export type ClipInstance = { id: string; clipId: string; targetId: string; start: number; duration: number; speed: number; loop: boolean; mirror: boolean; fadeIn: number; fadeOut: number };
export type MotionClip = { id: string; name: string; duration: number; tracks: AnimationTrack[]; sourceRigId?: string };
export type Scene = { id: string; name: string; duration: number; background: string; camera: Camera; layers: Layer[]; tracks: AnimationTrack[]; clips: ClipInstance[]; markers: Marker[]; characters: CharacterInstance[] };
export type Shot = { id: string; sceneId: string; start: number; duration: number; sourceIn: number };
export type AudioClip = { id: string; assetId: string; start: number; sourceIn: number; duration: number; volume: number; fadeIn: number; fadeOut: number; volumeKeys: { time: number; value: number }[] };
export type Sequence = { shots: Shot[]; audio: AudioClip[] };
export type Project = { version: 3; id: string; name: string; width: number; height: number; fps: { numerator: number; denominator: number }; assets: Asset[]; rigs: Rig[]; scenes: Scene[]; clips: MotionClip[]; sequence: Sequence; updatedAt: string; characterDefinitions: CharacterDefinition[] };
export type ImportIssue = { layer: string; message: string; severity: 'warning' | 'error' };
export type ImportReport = { layers: Layer[]; assets: Asset[]; issues: ImportIssue[]; width: number; height: number };
export type ExportJob = { id: string; name: string; status: 'queued' | 'rendering' | 'done' | 'cancelled' | 'failed'; format: 'mp4' | 'png'; width: number; height: number; start: number; end: number; sequence: boolean; transparent: boolean; progress: number; error?: string; output?: string };
export type EvaluatedLayer = Layer & { asset: Asset; rig?: Rig; vertices: Float32Array; depths: Float32Array; world: number[] };
export type EvaluatedScene = { worlds?: Record<string,number[]>; rigs?: Record<string,Rig>; poses?: Record<string,{vertices:Float32Array;depths:Float32Array}>; scene: Scene; layers: EvaluatedLayer[]; time: number };
export const id = () => crypto.randomUUID();
export const transform = (): Transform => ({ position: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, rotation: 0 });
export function makeLayer(name: string, assetId?: string): Layer {
  return { id: id(), name, kind: assetId ? 'image' : 'group', assetId, visible: true, locked: false, solo: false, collapsed: false, opacity: 1, blend: 'normal', clipping: false, transform: transform(), effects: { blur: 0, tint: '#8b7bff', tintAmount: 0, shadow: 0, motionBlur: false }, mask: { enabled: false, position: { x: 0, y: 0 }, size: { x: 200, y: 200 }, feather: 0, invert: false } };
}
export function makeScene(name = 'Untitled shot'): Scene {
  return { id: id(), name, duration: 8, background: '#dce6e0', camera: { position: { x: 0, y: 0 }, zoom: 1, rotation: 0 }, layers: [], tracks: [], clips: [], markers: [], characters: [] };
}
export function makeProject(): Project {
  const scene = makeScene('01 · A little hello');
  return { version: 3, id: id(), name: 'Untitled project', width: 1920, height: 1080, fps: { numerator: 24, denominator: 1 }, assets: [], rigs: [], scenes: [scene], clips: [], sequence: { shots: [{ id: id(), sceneId: scene.id, start: 0, duration: 8, sourceIn: 0 }], audio: [] }, updatedAt: new Date().toISOString(), characterDefinitions: [] };
}
export function validateProject(value: unknown): Project {
  if (!value || typeof value !== 'object') throw new Error('This is not a Puppet Studio project.');
  const originalVersion=(value as any).version;
  const p = ([1,2].includes(originalVersion)?{...value,version:3,characterDefinitions:[],scenes:(value as any).scenes?.map((s:any)=>({...s,characters:[]}))}:value) as Project;
  if (p.version !== 3) throw new Error(`Project version ${p.version} is not supported. Your file has not been changed.`);
  if (!Array.isArray(p.characterDefinitions)||!Array.isArray(p.scenes)||p.scenes.some(s=>!Array.isArray(s.characters))) throw new Error('Invalid character definitions.');
  if (!Array.isArray(p.scenes) || !p.scenes.length || !Array.isArray(p.assets) || !Array.isArray(p.rigs) || !Array.isArray(p.clips) || !p.sequence || !Array.isArray(p.sequence.shots) || !Array.isArray(p.sequence.audio)) throw new Error('The project is missing required data.');
  if (!Number.isInteger(p.width) || !Number.isInteger(p.height) || p.width < 1 || p.height < 1 || p.width > 8192 || p.height > 8192 || !Number.isFinite(p.fps?.numerator) || p.fps.numerator <= 0 || !Number.isFinite(p.fps.denominator) || p.fps.denominator <= 0) throw new Error('Invalid project dimensions or frame rate.');
  if (p.fps.numerator/p.fps.denominator > 120 || p.scenes.length > 600 || p.assets.length > 2000 || p.rigs.length > 1000) throw new Error('This project exceeds the editor limits.');
  const point = (v: any) => v && Number.isFinite(v.x) && Number.isFinite(v.y);
  const unique=(items:{id:string}[],label:string)=>{if(items.some(v=>typeof v.id!=='string'||!v.id)||new Set(items.map(v=>v.id)).size!==items.length)throw new Error(`Invalid or duplicate ${label} identifiers.`);};
  unique(p.assets,'asset');unique(p.scenes,'shot');unique(p.rigs,'rig');unique(p.clips,'motion clip');
  for(const asset of p.assets)if(typeof asset.name!=='string'||!['image','audio'].includes(asset.type)||typeof asset.mime!=='string'||!Number.isFinite(asset.width)||!Number.isFinite(asset.height)||asset.data&&!/^data:(image\/(png|jpeg|webp)|audio\/[a-z0-9.+-]+);base64,/i.test(asset.data))throw new Error('Invalid managed asset.');
  let keyCount=0;
  const validateTrack=(t:AnimationTrack)=>{if(typeof t.property!=='string'||t.property.split('/').some(v=>['__proto__','prototype','constructor'].includes(v))||!Array.isArray(t.keys))throw new Error('Invalid animation track.');let previous=-Infinity;for(const k of t.keys){if(!Number.isFinite(k.time)||k.time<previous||(typeof k.value==='number'?!Number.isFinite(k.value):!point(k.value))||!k.ease||!['bezier','hold','linear'].includes(k.ease.mode)||!Array.isArray(k.ease.handles)||k.ease.handles.length!==4||!k.ease.handles.every(Number.isFinite)||k.inSpatial&&!point(k.inSpatial)||k.outSpatial&&!point(k.outSpatial))throw new Error('Invalid animation keyframe.');previous=k.time;if(++keyCount>1000000)throw new Error('The project exceeds the one-million-keyframe limit.');}};
  for(const clip of p.clips){if(!Number.isFinite(clip.duration)||clip.duration<=0||!Array.isArray(clip.tracks))throw new Error('Invalid motion clip.');for(const t of clip.tracks)validateTrack(t);}

  for (const r of p.rigs) {
    if (!r.mesh || !Array.isArray(r.mesh.vertices) || !Array.isArray(r.mesh.triangles) || !Array.isArray(r.pins) || !Array.isArray(r.bones) || r.mesh.vertices.length % 2 || r.mesh.vertices.length > 200000 || !r.mesh.vertices.every(Number.isFinite)) throw new Error('Invalid puppet mesh.');
    const n=r.mesh.vertices.length/2;
    if(r.frozenVertices&&(!Array.isArray(r.frozenVertices)||r.frozenVertices.length!==r.mesh.vertices.length||!r.frozenVertices.every(Number.isFinite)))throw new Error('Invalid character part.');
    if (r.mesh.triangles.length % 3 || !r.mesh.triangles.every(i=>Number.isInteger(i)&&i>=0&&i<n)) throw new Error('Invalid mesh triangle indices.');
    for (const pin of r.pins) if (!point(pin.rest) || !point(pin.position) || !Number.isFinite(pin.radius) || pin.radius <= 0 || !Number.isFinite(pin.strength) || !Number.isFinite(pin.angle) || !Number.isFinite(pin.scale) || !Number.isFinite(pin.depth)) throw new Error('Invalid puppet control.');
    const bones=new Map(r.bones.map(b=>[b.id,b]));
    for (const b of r.bones) { if(!point(b.start)||!point(b.end)||!Array.isArray(b.weights)||b.weights.length!==n||!b.weights.every(v=>Number.isFinite(v)&&v>=0)||!Number.isFinite(b.angle)||!Number.isFinite(b.minAngle)||!Number.isFinite(b.maxAngle)||b.ikTarget&&!point(b.ikTarget))throw new Error('Invalid bone rig.'); const seen=new Set([b.id]);let parent=b.parentId;while(parent){if(seen.has(parent))throw new Error('The rig contains a bone parenting cycle.');seen.add(parent);parent=bones.get(parent)?.parentId;} }
  }
  for (const s of p.scenes) {
    if (!s.id || !Number.isFinite(s.duration) || s.duration <= 0 || !Array.isArray(s.layers) || !Array.isArray(s.tracks) || !s.camera || !Array.isArray(s.clips) || !Array.isArray(s.markers)) throw new Error('Invalid scene data.');
    unique(s.layers,'layer');unique(s.tracks,'track');for(const t of s.tracks)validateTrack(t);
    if(!point(s.camera.position)||!Number.isFinite(s.camera.zoom)||s.camera.zoom<=0||!Number.isFinite(s.camera.rotation))throw new Error('Invalid camera.');
    for(const layer of s.layers)if(!point(layer.transform?.position)||!point(layer.transform?.scale)||!Number.isFinite(layer.transform?.rotation)||!Number.isFinite(layer.opacity))throw new Error('Invalid layer transform.');
    const byId = new Map(s.layers.map(l => [l.id, l]));
    for (const l of s.layers) {
      if(l.rigPlacement&&(!Array.isArray(l.rigPlacement)||l.rigPlacement.length!==6||!l.rigPlacement.every(Number.isFinite)))throw new Error('Invalid rig connection placement.');
      if(l.attachment){const target=byId.get(l.attachment.layerId),rig=p.rigs.find(r=>r.id===target?.rigId),a=l.attachment;if(!target||!['layer','pin','bone'].includes(a.kind)||a.kind==='pin'&&!rig?.pins.some(c=>c.id===a.controlId)||a.kind==='bone'&&!rig?.bones.some(c=>c.id===a.controlId))throw new Error('A connected piece refers to a missing layer or rig control.');}
    }
    const visiting=new Set<string>(),visited=new Set<string>();
    function visit(l:Layer){if(visiting.has(l.id))throw new Error('The project contains a parenting or rig connection cycle.');if(visited.has(l.id))return;visiting.add(l.id);for(const parentId of [l.parentId,l.attachment?.layerId]){const parent=parentId&&byId.get(parentId);if(parent)visit(parent);}visiting.delete(l.id);visited.add(l.id);}
    for(const l of s.layers)visit(l);
  }
  unique(p.characterDefinitions,'character');
  for(const d of p.characterDefinitions){const rig=p.rigs.find(r=>r.id===d.rigId);if(!rig?.controlOnly||!Array.isArray(d.parts))throw new Error('Invalid character skeleton.');for(const part of d.parts)if(!Array.isArray(part.boneIds)||!Array.isArray(part.weights)||part.boneIds.length!==part.weights.length||part.boneIds.some(id=>!rig.bones.some(b=>b.id===id))||part.weights.some(w=>!Array.isArray(w)||!w.every(v=>Number.isFinite(v)&&v>=0)))throw new Error('Invalid character weights.');}
  for(const s of p.scenes){unique(s.characters,'character instance');const members=new Set<string>();for(const c of s.characters){const d=p.characterDefinitions.find(d=>d.id===c.definitionId),root=s.layers.find(l=>l.id===c.rootLayerId);if(!d||!root||root.rigId!==d.rigId||!Array.isArray(c.parts))throw new Error('Missing character skeleton.');for(const part of c.parts){const layer=s.layers.find(l=>l.id===part.layerId),binding=d.parts.find(v=>v.slot===part.slot),rig=p.rigs.find(r=>r.id===layer?.rigId);if(!layer||!rig||!binding||members.has(layer.id)||!Array.isArray(part.rest)||part.rest.length!==6||!part.rest.every(Number.isFinite)||Math.abs(part.rest[0]*part.rest[3]-part.rest[1]*part.rest[2])<1e-10||binding.weights.some(w=>w.length!==rig.mesh.vertices.length/2))throw new Error('Invalid character part.');members.add(layer.id);}}}
  return p;
}
export const features = { fourK: true, motionLibrary: true, batchRender: true, betaUnlocked: true } as const;
export function hasFeature(feature: 'fourK'|'motionLibrary'|'batchRender') { return features.betaUnlocked || features[feature]; }
