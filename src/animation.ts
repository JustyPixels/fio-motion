import { type AnimationTrack, type Ease, type Keyframe, type Point, type Project, type Scene, id, SMOOTH } from './model';
import { current, isDraft } from 'immer';
export function snapshot<T>(value:T):T { return structuredClone(isDraft(value) ? current(value as any) : value); }
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const cubic = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
export function easing(t: number, ease: Ease): number {
  if (t <= 0) return 0; if (t >= 1) return 1;
  if (ease.mode === 'hold') return 0; if (ease.mode === 'linear') return t;
  const [x1, y1, x2, y2] = ease.handles;
  let lo = 0, hi = 1;
  for (let i = 0; i < 28; i++) { const mid = (lo + hi) / 2; if (cubic(mid, clamp(x1), clamp(x2)) < t) lo = mid; else hi = mid; }
  return cubic((lo + hi) / 2, y1, y2);
}
export function interpolate(a: number | Point, b: number | Point, t: number): number | Point {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * t;
  if (typeof a === 'object' && typeof b === 'object') return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  return snapshot(t < .5 ? a : b);
}
export function sampleTrack(track: AnimationTrack, time: number): number | Point | undefined {
  const keys = track.keys;
  if (!keys.length || track.muted) return undefined;
  if (time <= keys[0].time) return snapshot(keys[0].value);
  if (time >= keys[keys.length - 1].time) return snapshot(keys[keys.length - 1].value);
  let lo = 0, hi = keys.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (keys[mid].time <= time) lo = mid; else hi = mid; }
  const a = keys[lo], b = keys[hi], t = easing((time - a.time) / (b.time - a.time), a.ease);
  if (typeof a.value === 'object' && typeof b.value === 'object' && (a.outSpatial || b.inSpatial)) {
    const p = a.value, q = b.value, c = { x: p.x + (a.outSpatial?.x ?? (q.x - p.x) / 3), y: p.y + (a.outSpatial?.y ?? (q.y - p.y) / 3) }, d = { x: q.x + (b.inSpatial?.x ?? (p.x - q.x) / 3), y: q.y + (b.inSpatial?.y ?? (p.y - q.y) / 3) }, u = 1 - t;
    return { x: u ** 3 * p.x + 3 * u * u * t * c.x + 3 * u * t * t * d.x + t ** 3 * q.x, y: u ** 3 * p.y + 3 * u * u * t * c.y + 3 * u * t * t * d.y + t ** 3 * q.y };
  }
  return interpolate(a.value, b.value, t);
}
export function getProperty(object: any, path: string): any { return path.split('/').reduce((o, k) => Array.isArray(o) ? o.find(v => v.id === k) : o?.[k], object); }
export function setProperty(object: any, path: string, value: any) { const keys = path.split('/'); let target = object; for (const k of keys.slice(0, -1)) { target = Array.isArray(target) ? target.find(v => v.id === k) : target?.[k]; if (!target) return; } if (target) target[keys[keys.length - 1]] = snapshot(value); }
export function addKey(scene: Scene, targetId: string, property: string, time: number, value: number | Point, fps: number): Keyframe {
  time = Math.round(time * fps) / fps;
  let track = scene.tracks.find(t => t.targetId === targetId && t.property === property);
  if (!track) { track = { id: id(), targetId, property, keys: [] }; scene.tracks.push(track); }
  let key = track.keys.find(k => Math.abs(k.time - time) < .25 / fps);
  if (key) key.value = snapshot(value); else { key = { id: id(), time, value: snapshot(value), ease: property === 'swapIndex' ? {mode:'hold',handles:[0,0,1,1]} : snapshot(SMOOTH) }; track.keys.push(key); track.keys.sort((a, b) => a.time - b.time); }
  return key;
}
export function evaluateControls(project: Project, source: Scene, time: number): { scene: Scene; rigs: Map<string, any> } {
  // Clone only the active scene controls; mesh topology and source assets are immutable here.
  const scene = { ...source, camera: snapshot(source.camera), layers: source.layers.map(l => snapshot(l)) };
  const rigs = new Map<string, any>();
  for (const layer of scene.layers) { const rig = project.rigs.find(r => r.id === layer.rigId); if (rig) rigs.set(layer.id, { ...rig, pins: snapshot(rig.pins), bones: rig.bones.map(b => ({ ...b, start: { ...b.start }, end: { ...b.end }, ikTarget: b.ikTarget && { ...b.ikTarget } })) }); }
  function target(targetId: string) { return targetId === scene.id ? scene : rigs.has(targetId) ? { ...scene.layers.find(l => l.id === targetId), rig: rigs.get(targetId) } : scene.layers.find(l => l.id === targetId); }
  const blends=new Map<string,{obj:any;targetId:string;property:string;base:number|Point|undefined;sum:number|Point;weight:number}>();
  for (const instance of scene.clips) {
    if (time < instance.start || time > instance.start + instance.duration) continue;
    const clip = project.clips.find(c => c.id === instance.clipId); if (!clip || clip.duration <= 0) continue;
    let local = (time - instance.start) * instance.speed;
    local = instance.loop ? ((local % clip.duration) + clip.duration) % clip.duration : clamp(local, 0, clip.duration);
    const weight = Math.min(instance.fadeIn > 0 ? clamp((time - instance.start) / instance.fadeIn) : 1, instance.fadeOut > 0 ? clamp((instance.start + instance.duration - time) / instance.fadeOut) : 1);
    const obj = target(instance.targetId); if (!obj) continue;
    const destRig = rigs.get(instance.targetId), srcRig = project.rigs.find(r => r.id === clip.sourceRigId);
    for (const track of clip.tracks) {
      let property = track.property;
      if (srcRig && destRig && srcRig.id !== destRig.id) {
        const segments = property.split('/');
        for (const kind of ['pins', 'bones'] as const) { const index = segments.indexOf(kind); if (index >= 0) { const control = srcRig[kind].find(c => c.id === segments[index + 1]); const replacement = destRig[kind].find((c: any) => c.name === control?.name); if (!replacement) { property = ''; break; } segments[index + 1] = replacement.id; } }
        property = property && segments.join('/');
      }
      if (!property) continue;
      let value = sampleTrack(track, local); if (value === undefined) continue;
      if(typeof value==='object'&&property.endsWith('/position')&&srcRig&&destRig&&srcRig.id!==destRig.id){const oldPin=srcRig.pins.find(p=>track.property.includes(p.id)),newPin=destRig.pins.find((p:any)=>property.includes(p.id));if(oldPin&&newPin)value={x:newPin.rest.x+(value.x-oldPin.rest.x)*destRig.mesh.width/srcRig.mesh.width,y:newPin.rest.y+(value.y-oldPin.rest.y)*destRig.mesh.height/srcRig.mesh.height};}
      if (instance.mirror) { if (typeof value === 'object' && property.endsWith('/position') && destRig) {const pin=destRig.pins.find((p:any)=>property.includes(p.id));value = { x: pin?2*pin.rest.x-value.x:destRig.mesh.width-value.x, y: value.y };} else if (typeof value === 'number' && (property.endsWith('/angle') || property.endsWith('/rotation'))) value = -value; }
      const key=`${instance.targetId}:${property}`,entry=blends.get(key)??{obj,targetId:instance.targetId,property,base:getProperty(obj,property),sum:typeof value==='number'?0:{x:0,y:0},weight:0};
      if(typeof value==='number'&&typeof entry.sum==='number')entry.sum+=value*weight;else if(typeof value==='object'&&typeof entry.sum==='object'){entry.sum.x+=value.x*weight;entry.sum.y+=value.y*weight;}entry.weight+=weight;blends.set(key,entry);
    }
  }
  for(const entry of blends.values()){
    if(entry.weight<=0)continue;const remaining=entry.base===undefined?0:Math.max(0,1-entry.weight),denominator=entry.base===undefined?entry.weight:Math.max(1,entry.weight);
    const value=typeof entry.sum==='number'?(entry.sum+(typeof entry.base==='number'?entry.base*remaining:0))/denominator:{x:(entry.sum.x+(typeof entry.base==='object'?entry.base.x*remaining:0))/denominator,y:(entry.sum.y+(typeof entry.base==='object'?entry.base.y*remaining:0))/denominator};
    setProperty(entry.obj,entry.property,value);const layer=scene.layers.find(l=>l.id===entry.targetId);if(layer&&!entry.property.startsWith('rig/'))setProperty(layer,entry.property,value);
  }
  for (const track of source.tracks) { const value = sampleTrack(track, time); if (value !== undefined) { if (track.property.startsWith('rig/')) setProperty({ rig: rigs.get(track.targetId) }, track.property, value); else setProperty(track.targetId === scene.id ? scene : scene.layers.find(l => l.id === track.targetId), track.property, value); } }
  return { scene, rigs };
}
export function sequenceDuration(project: Project) { return Math.max(1, ...project.sequence.shots.map(s => s.start + s.duration), ...project.sequence.audio.map(a => a.start + a.duration)); }
export function resolveShot(project: Project, time: number) { const shot = [...project.sequence.shots].reverse().find(s => time >= s.start && time < s.start + s.duration); return shot && { scene: project.scenes.find(s => s.id === shot.sceneId)!, time: shot.sourceIn + time - shot.start }; }
export function audioGain(clip: Project['sequence']['audio'][number], time: number) {
  const t = time - clip.start; if (t < 0 || t >= clip.duration) return 0;
  let volume = clip.volume;
  if (clip.volumeKeys.length) volume *= sampleTrack({ id: '', targetId: '', property: '', keys: clip.volumeKeys.map((k, i) => ({ id: `${i}`, time: k.time, value: k.value, ease: { mode: 'linear', handles: [0, 0, 1, 1] } })) }, t) as number;
  return volume * (clip.fadeIn > 0 ? clamp(t / clip.fadeIn) : 1) * (clip.fadeOut > 0 ? clamp((clip.duration - t) / clip.fadeOut) : 1);
}
