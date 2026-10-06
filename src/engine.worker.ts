import { type Asset, type ImportReport, type Mesh, type Pin, type Rig, type Bone, id, makeLayer } from './model';
import { autoWeights, bonePoses } from './rigging';
import { readPsd, getLayerImageData, getLayerMaskImageData, initializeCanvas } from 'ag-psd';
initializeCanvas((width, height) => new OffscreenCanvas(width, height) as any, (width, height) => new ImageData(width, height));
let wasmPromise: Promise<any> | undefined;
async function engine() {
  wasmPromise ??= fetch(new URL(/* @vite-ignore */ '../engine/puppet_engine.wasm', import.meta.url)).then(async r => { if (!r.ok) throw new Error('The deformation engine is missing. Run the engine build before starting the editor.'); const module = await WebAssembly.instantiate(await r.arrayBuffer(), {}); return module.instance.exports; });
  return wasmPromise;
}
function input(wasm: any, data: ArrayLike<number>): number { const pointer = wasm.alloc(data.length); new Float64Array(wasm.memory.buffer, pointer, data.length).set(Array.from(data)); return pointer; }
function result(wasm: any) { return Array.from(new Float64Array(wasm.memory.buffer, wasm.output_ptr(), wasm.output_len())); }
async function canvasAsset(canvas: OffscreenCanvas, name: string): Promise<Asset> { const blob = await canvas.convertToBlob({ type: 'image/png' }); const bytes = new Uint8Array(await blob.arrayBuffer()); let raw = ''; for (let i = 0; i < bytes.length; i += 8192) raw += String.fromCharCode(...bytes.subarray(i, i + 8192)); return { id: id(), name, type: 'image', mime: 'image/png', width: canvas.width, height: canvas.height, data: `data:image/png;base64,${btoa(raw)}` }; }
async function imageMesh(asset: Asset, density: number, expansion: number, pins: Pin[]): Promise<Mesh> {
  const bitmap = await createImageBitmap(await (await fetch(asset.data)).blob());
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height), ctx = canvas.getContext('2d', { willReadFrequently: true })!; ctx.drawImage(bitmap, 0, 0); bitmap.close();
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const step = Math.max(2, Math.ceil(Math.max(canvas.width, canvas.height) / 512)), cols = Math.ceil(canvas.width / step), rows = Math.ceil(canvas.height / step), original = new Float64Array(cols * rows);
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (pixels[(y * canvas.width + x) * 4 + 3] > 12) original[Math.floor(y / step) * cols + Math.floor(x / step)] = 1;
  const mask = original.slice(), radius = Math.ceil(expansion / step);
  if (radius) for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!original[y * cols + x]) { search: for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) if (dx * dx + dy * dy <= radius * radius && x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows && original[(y + dy) * cols + x + dx]) { mask[y * cols + x] = 1; break search; } }
  const wasm = await engine(), maskPtr = input(wasm, mask), pinData = pins.flatMap(p => [p.rest.x, p.rest.y]), pinPtr = input(wasm, pinData);
  try { wasm.mesh(maskPtr, cols, rows, step, density, canvas.width, canvas.height, pinPtr, pins.length); const output = result(wasm), n = output[0], vertices = output.slice(2, 2 + n * 2), triangles = output.slice(2 + n * 2); if (!triangles.length) throw new Error('This layer has no visible pixels to rig.'); return { vertices, triangles, width: canvas.width, height: canvas.height, revision: Date.now() }; }
  finally { wasm.free(maskPtr, mask.length); wasm.free(pinPtr, pinData.length); }
}
async function solveRig(rig: Rig) {
  const rest = rig.mesh.vertices, n = rest.length / 2, targets = Float64Array.from(rig.characterVertices??rig.frozenVertices??rest), strengths = new Float64Array(n).fill((rig.characterVertices||rig.frozenVertices)?1.5:.00001), rigidity = new Float64Array(n), depths = new Float32Array(n), poses = bonePoses(rig.bones);
  for (let i = 0; i < n; i++) {
    const x = rest[i * 2], y = rest[i * 2 + 1];
    if (rig.bones.length) { let tx = 0, ty = 0, total = 0; for (const bone of rig.bones) { const w = bone.weights[i] || 0, p = poses.get(bone.id)!; const dx = x - bone.start.x, dy = y - bone.start.y; tx += w * (p.start.x + Math.cos(p.angle) * dx - Math.sin(p.angle) * dy); ty += w * (p.start.y + Math.sin(p.angle) * dx + Math.cos(p.angle) * dy); total += w; } if (total > 0) { targets[i * 2] = tx / total; targets[i * 2 + 1] = ty / total; strengths[i] = 1.5; } }
    for (const pin of rig.pins) { const d = Math.hypot(x - pin.rest.x, y - pin.rest.y), w = Math.max(0, 1 - d / Math.max(1, pin.radius)) ** 2 * pin.strength;
      if (pin.kind === 'stiff') rigidity[i] += w;
      if (pin.kind === 'overlap') depths[i] += w * pin.depth / 100;
      if (pin.kind === 'transform' && w > 0) { const angle = pin.angle * Math.PI / 180, dx = x - pin.rest.x, dy = y - pin.rest.y, px = pin.position.x + pin.scale * (Math.cos(angle) * dx - Math.sin(angle) * dy), py = pin.position.y + pin.scale * (Math.sin(angle) * dx + Math.cos(angle) * dy), sum = strengths[i] + w * 5; targets[i * 2] = (targets[i * 2] * strengths[i] + px * w * 5) / sum; targets[i * 2 + 1] = (targets[i * 2 + 1] * strengths[i] + py * w * 5) / sum; strengths[i] = sum; }
    }
  }
  // Fixed anchors win when multiple pins occupy the same mesh vertex.
  for (const pin of [...rig.pins].sort((a, b) => Number(a.kind === 'fixed') - Number(b.kind === 'fixed'))) if (['move', 'fixed', 'transform'].includes(pin.kind)) {
    let index = 0, distance = Infinity;
    for (let i = 0; i < n; i++) { const d = (rest[i * 2] - pin.rest.x) ** 2 + (rest[i * 2 + 1] - pin.rest.y) ** 2; if (d < distance) { distance = d; index = i; } }
    const p = pin.kind === 'fixed' ? pin.rest : pin.position; targets[index * 2] = p.x + rest[index * 2] - pin.rest.x; targets[index * 2 + 1] = p.y + rest[index * 2 + 1] - pin.rest.y; strengths[index] = 100000;
  }
  if (!rig.bones.length && !rig.pins.some(p => ['move','fixed','transform'].includes(p.kind))&&!rig.characterVertices) return { vertices: Float32Array.from(rig.frozenVertices??rest), depths };
  const wasm = await engine(), arrays = [rest, rig.mesh.triangles, targets, strengths, rigidity], pointers = arrays.map(a => input(wasm, a));
  try { wasm.solve(pointers[0], n, pointers[1], rig.mesh.triangles.length, pointers[2], pointers[3], pointers[4]); return { vertices: Float32Array.from(result(wasm)), depths }; }
  finally { pointers.forEach((p, i) => wasm.free(p, arrays[i].length)); }
}
async function importPsd(buffer: ArrayBuffer, name: string): Promise<ImportReport> {
  const doc = readPsd(buffer, { useRawData: true, useRawThumbnail: true, skipLinkedFilesData: true });
  if (doc.bitsPerChannel !== 8 || doc.colorMode !== 3 || doc.width > 8192 || doc.height > 8192) throw new Error('Please save this PSD as 8-bit RGB, with dimensions no larger than 8192 pixels. PSB is not supported.');
  const report: ImportReport = { layers: [], assets: [], issues: [], width: doc.width, height: doc.height }; let budget = 0, count = 0;
  async function visit(children: any[], parentId?: string) {
    for (const source of children) {
      if (++count > 600) throw new Error('This PSD exceeds the 600-layer import limit. Split the artwork into character files.');
      const layer = makeLayer(source.name || 'Unnamed layer'); layer.parentId = parentId; layer.visible = !source.hidden; layer.opacity = source.opacity ?? 1; layer.clipping = !!source.clipping;
      const supported = ['normal','multiply','screen','overlay','darken','lighten','pass through'];
      if (supported.includes(source.blendMode || 'normal')) layer.blend = source.blendMode === 'pass through' ? 'normal' : source.blendMode || 'normal'; else report.issues.push({ layer: layer.name, severity: 'warning', message: `The ${source.blendMode} blend mode is unavailable. Rasterize its appearance in Photoshop or choose a supported blend.` });
      if (source.effects || source.adjustment || source.vectorMask || source.vectorStroke || source.filterEffects) report.issues.push({ layer: layer.name, severity: 'warning', message: 'Photoshop effects, adjustments, vector masks, and smart filters need rasterizing in Photoshop. Stored layer pixels are imported where available.' });
      if (source.children) { layer.passThrough = source.blendMode === 'pass through'; if(source.mask && !source.mask.disabled) report.issues.push({layer:layer.name,severity:'warning',message:'Folder masks need applying to the artwork layers in Photoshop before import.'}); report.layers.push(layer); await visit(source.children, layer.id); continue; }
      const width = (source.right ?? 0) - (source.left ?? 0), height = (source.bottom ?? 0) - (source.top ?? 0);
      if (width < 1 || height < 1) { report.layers.push(layer); report.issues.push({ layer: layer.name, severity: 'warning', message: 'This layer has no raster pixels. It is retained as an empty layer.' }); continue; }
      if (width > 8192 || height > 8192 || (budget += width * height * 4) > 512 * 1024 * 1024) throw new Error('Decoded artwork exceeds the 512 MB import budget. Crop or split this PSD.');
      const pixels = getLayerImageData(source); if (!pixels) { report.layers.push(layer); report.issues.push({ layer: layer.name, severity: 'warning', message: 'Raster appearance is missing. Rasterize and save this layer in Photoshop.' }); continue; }
      const canvas = new OffscreenCanvas(width, height), ctx = canvas.getContext('2d')!; ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels.data), width, height), 0, 0);
      const asset = await canvasAsset(canvas, layer.name); asset.sourceLayerId = source.id?.toString(); report.assets.push(asset); layer.kind = 'image'; layer.assetId = asset.id; layer.transform.position = { x: source.left ?? 0, y: source.top ?? 0 };
      if (source.mask && !source.mask.disabled) {
        const mask = getLayerMaskImageData(source); if (mask && mask.width > 0 && mask.height > 0) { const mc = new OffscreenCanvas(mask.width, mask.height), mctx = mc.getContext('2d')!, rgba = new Uint8ClampedArray(mask.width * mask.height * 4); for (let i = 0; i < mask.width * mask.height; i++) { rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = 255; rgba[i * 4 + 3] = mask.data.length === mask.width * mask.height ? mask.data[i] : mask.data[i * 4]; } mctx.putImageData(new ImageData(rgba, mask.width, mask.height), 0, 0); const ma = await canvasAsset(mc, `${layer.name} mask`); report.assets.push(ma); layer.mask = { ...layer.mask, enabled: true, assetId: ma.id, outside: (source.mask.defaultColor ?? 255) / 255, offset: { x: (source.mask.left ?? 0) - (source.mask.positionRelativeToLayer ? 0 : source.left ?? 0), y: (source.mask.top ?? 0) - (source.mask.positionRelativeToLayer ? 0 : source.top ?? 0) }, size: { x: mask.width, y: mask.height }, position: { x: 0, y: 0 } }; }
      }
      report.layers.push(layer);
    }
  }
  await visit(doc.children || []);
  report.issues.push({ layer: name, severity: 'warning', message: 'Embedded color profiles are not converted. For predictable color, convert the PSD to sRGB in Photoshop before importing.' });
  return report;
}
self.onmessage = async (event: MessageEvent) => {
  const { requestId, kind, payload } = event.data;
  try { let output: any; if (kind === 'mesh') output = await imageMesh(payload.asset, payload.density, payload.expansion, payload.pins); else if (kind === 'solve') { output = []; for (const rig of payload.rigs) output.push(await solveRig(rig)); } else if (kind === 'psd') output = await importPsd(payload.buffer, payload.name); else if (kind === 'weights') output = autoWeights(payload.mesh, payload.bones); else if (kind === 'ready') { await engine(); output = true; } else throw new Error('Unknown engine operation.'); const transfers: Transferable[] = kind === 'solve' ? output.flatMap((o: any) => [o.vertices.buffer, o.depths.buffer]) : []; (self as any).postMessage({ requestId, output }, transfers); }
  catch (error) { (self as any).postMessage({ requestId, error: error instanceof Error ? error.message : String(error) }); }
};
