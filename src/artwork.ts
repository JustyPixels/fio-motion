import { type Project, type Layer, type ImportReport } from './model';

export function replacePsdArtwork(project:Project,sceneId:string,report:ImportReport):number {
  const scene=project.scenes.find(s=>s.id===sceneId);if(!scene)throw new Error('The selected shot no longer exists.');
  function paths(layers:Layer[]){const byId=new Map(layers.map(l=>[l.id,l])),cache=new Map<string,string>();const path=(l:Layer):string=>{if(cache.has(l.id))return cache.get(l.id)!;const siblings=layers.filter(v=>v.parentId===l.parentId&&v.name===l.name),part=`${encodeURIComponent(l.name)}:${siblings.findIndex(v=>v.id===l.id)}`,parent=byId.get(l.parentId??''),result=parent?`${path(parent)}/${part}`:part;cache.set(l.id,result);return result;};return new Map(layers.map(l=>[l.id,path(l)]));}
  const oldPaths=paths(scene.layers),newPaths=paths(report.layers),updates:{old:Layer;fresh:Layer}[]=[];
  for(const fresh of report.layers.filter(l=>l.kind==='image')){
    const incoming=report.assets.find(a=>a.id===fresh.assetId)!;
    const candidates=scene.layers.filter(l=>l.kind==='image'&&oldPaths.get(l.id)===newPaths.get(fresh.id));
    const old=candidates[0];if(!old)throw new Error(`PSD replacement cannot map “${fresh.name}”. Keep the same folders, names, and duplicate-layer order.`);
    const current=project.assets.find(a=>a.id===old.assetId);if(!current||current.width!==incoming.width||current.height!==incoming.height)throw new Error(`“${fresh.name}” changed dimensions. Restore its original raster bounds to preserve the rig.`);
    updates.push({old,fresh});
  }
  if(!updates.length)throw new Error('This PSD has no compatible raster artwork to replace.');
  // Validate every mapping before changing any source artwork.
  for(const {old,fresh} of updates){const incoming=report.assets.find(a=>a.id===fresh.assetId)!,current=project.assets.find(a=>a.id===old.assetId)!;Object.assign(current,{data:incoming.data,mime:incoming.mime,name:incoming.name,sourceLayerId:incoming.sourceLayerId});if(fresh.mask.assetId){const mask=report.assets.find(a=>a.id===fresh.mask.assetId)!;project.assets.push(structuredClone(mask));old.mask=structuredClone(fresh.mask);}}
  return updates.length;
}
