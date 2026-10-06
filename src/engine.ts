import { worldMatrices } from './connections';
import { type Asset, type Bone, type EvaluatedScene, type Mesh, type Pin, type Project, type Scene, type Rig, type ImportReport } from './model';
import { evaluateControls } from './animation';
import { skinCharacter } from './characters';
export class Engine {
  private worker = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });
  private next = 0; private pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();
  constructor() { this.worker.onmessage = e => { const p = this.pending.get(e.data.requestId); if (!p) return; this.pending.delete(e.data.requestId); e.data.error ? p.reject(new Error(e.data.error)) : p.resolve(e.data.output); }; this.worker.onerror = () => { for (const p of this.pending.values()) p.reject(new Error('The animation worker stopped unexpectedly. Please reopen the project.')); this.pending.clear(); }; }
  private call<T>(kind: string, payload: any = {}, transfers: Transferable[] = []): Promise<T> { const requestId = ++this.next; return new Promise((resolve, reject) => { this.pending.set(requestId, { resolve, reject }); this.worker.postMessage({ requestId, kind, payload }, transfers); }); }
  ready() { return this.call('ready'); }
  mesh(asset: Asset, density: number, expansion: number, pins: Pin[]) { return this.call<Mesh>('mesh', { asset, density, expansion, pins }); }
  weights(mesh: Mesh, bones: Bone[]) { return this.call<Bone[]>('weights', { mesh, bones }); }
  psd(buffer: ArrayBuffer, name: string) { return this.call<ImportReport>('psd', { buffer, name }, [buffer]); }
  async evaluate(project: Project, source: Scene, time: number): Promise<EvaluatedScene> {
    const { scene, rigs } = evaluateControls(project, source, time);
    for (const instance of scene.characters??[]) { const definition=project.characterDefinitions.find(d=>d.id===instance.definitionId),skeleton=rigs.get(instance.rootLayerId);if(!definition||!skeleton)continue;for(const part of instance.parts){const rig=rigs.get(part.layerId),layer=scene.layers.find(l=>l.id===part.layerId),root=scene.layers.find(l=>l.id===instance.rootLayerId);if(rig)skinCharacter(rig,definition,part,skeleton);if(layer&&root){layer.visible&&=root.visible;layer.locked||=root.locked;layer.solo||=root.solo;let parent=layer.parentId,underRoot=false;while(parent){if(parent===root.id){underRoot=true;break;}parent=scene.layers.find(l=>l.id===parent)?.parentId;}if(!underRoot)layer.opacity*=root.opacity;}} }
    for (const layer of scene.layers) if (layer.swapAssetIds?.length) layer.assetId = layer.swapAssetIds[Math.max(0, Math.min(layer.swapAssetIds.length - 1, Math.round(layer.swapIndex ?? 0)))];
    const visible = scene.layers.filter(l => l.kind === 'image' && l.visible && project.assets.some(a => a.id === l.assetId));
    const anySolo = scene.layers.some(l => l.solo), byId = new Map(scene.layers.map(l => [l.id, l]));
    const participating = visible.filter(l => { let parent = l.parentId; const seen = new Set([l.id]); let solo = l.solo; while (parent) { const p = byId.get(parent); if (!p || !p.visible || seen.has(parent)) return false; seen.add(parent); solo ||= p.solo; parent = p.parentId; } return !anySolo || solo; });
    const needed=new Set(participating.map(l=>l.id));let expanded=true;while(expanded){expanded=false;for(const id of [...needed]){const layer=byId.get(id);for(const parent of [layer?.parentId,layer?.attachment?.layerId])if(parent&&!needed.has(parent)){needed.add(parent);expanded=true;}}}
    const toSolve = scene.layers.filter(l => needed.has(l.id)&&rigs.has(l.id)&&!rigs.get(l.id)?.controlOnly), solved = await this.call<{ vertices: Float32Array; depths: Float32Array }[]>('solve', { rigs: toSolve.map(l => rigs.get(l.id)) });
    const solutions = new Map(toSolve.map((l, i) => [l.id, solved[i]]));
    const worlds=worldMatrices(scene,rigs,solutions);
    const layers = participating.map(l => { let locked=l.locked,parent=byId.get(l.parentId||'');while(parent){locked||=parent.locked;parent=byId.get(parent.parentId||'');}const asset=project.assets.find(a=>a.id===l.assetId)!, rig=rigs.get(l.id) as Rig|undefined, solution=solutions.get(l.id); return { ...l, locked, asset, rig, vertices: solution?.vertices ?? new Float32Array([0,0,asset.width,0,asset.width,asset.height,0,asset.height]), depths: solution?.depths ?? new Float32Array(4), world: worlds.get(l.id)! }; });
    return { scene, layers, time, worlds:Object.fromEntries(worlds),rigs:Object.fromEntries(rigs),poses:Object.fromEntries(solutions) };
  }
  dispose() { this.worker.terminate(); }
}
