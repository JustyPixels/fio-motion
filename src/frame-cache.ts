import {evaluateControls} from './animation';
import type {Project,Scene} from './model';
// Rendering has no simulation state. Equal evaluated controls in a frozen
// export snapshot produce equal pixels. Motion blur also depends on neighboring
// timestamps, so those frames deliberately bypass this cache.
export function frameCacheKey(project:Project,source:Scene,time:number){
  const {scene,rigs}=evaluateControls(project,source,time);if(scene.layers.some(l=>l.effects.motionBlur))return undefined;
  return JSON.stringify([source.id,scene.background,scene.camera,scene.layers,[...rigs].map(([id,rig])=>[id,rig.id,rig.revision,rig.pins,rig.bones])]);
}
