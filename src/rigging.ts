import { type Mesh, type Bone } from './model';
export function autoWeights(mesh: Mesh, bones: Bone[]) {
  for (const bone of bones) bone.weights = Array(mesh.vertices.length / 2).fill(0);
  for (let i = 0; i < mesh.vertices.length / 2; i++) { const x = mesh.vertices[i * 2], y = mesh.vertices[i * 2 + 1]; const weights = bones.map(b => { const dx = b.end.x - b.start.x, dy = b.end.y - b.start.y, t = Math.max(0, Math.min(1, ((x - b.start.x) * dx + (y - b.start.y) * dy) / (dx * dx + dy * dy || 1))); return 1 / (Math.hypot(x - b.start.x - dx * t, y - b.start.y - dy * t) + 6) ** 2; }); const sum = weights.reduce((a, b) => a + b, 0); weights.forEach((w, j) => bones[j].weights[i] = w / (sum || 1)); }
  return bones;
}
export function bonePoses(bones: Bone[]) {
  const result = new Map<string, { start: { x: number; y: number }; angle: number }>();
  function pose(b: Bone, depth = 0): { start: { x: number; y: number }; angle: number } {
    if (result.has(b.id)) return result.get(b.id)!;
    if (depth > bones.length) return { start: b.start, angle: 0 };
    const parent = bones.find(p => p.id === b.parentId), pp = parent && pose(parent, depth + 1);
    const delta = Math.max(b.minAngle, Math.min(b.maxAngle, b.angle)) * Math.PI / 180;
    const start = pp ? { x: pp.start.x + Math.cos(pp.angle) * (b.start.x - parent!.start.x) - Math.sin(pp.angle) * (b.start.y - parent!.start.y), y: pp.start.y + Math.sin(pp.angle) * (b.start.x - parent!.start.x) + Math.cos(pp.angle) * (b.start.y - parent!.start.y) } : b.start;
    const p = { start, angle: (pp?.angle ?? 0) + delta }; result.set(b.id, p); return p;
  }
  for (const b of bones) pose(b);
  for (const child of bones) if (child.ikTarget && child.parentId) {
    const parent = bones.find(b => b.id === child.parentId); if (!parent) continue;
    const pp = result.get(parent.id)!, a = Math.hypot(parent.end.x - parent.start.x, parent.end.y - parent.start.y), b = Math.hypot(child.end.x - child.start.x, child.end.y - child.start.y), dx = child.ikTarget.x - pp.start.x, dy = child.ikTarget.y - pp.start.y, d = Math.max(.001, Math.min(a + b - .001, Math.max(Math.abs(a - b) + .001, Math.hypot(dx, dy))));
    const absolute = Math.atan2(dy, dx) - Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    const restAngle = Math.atan2(parent.end.y - parent.start.y, parent.end.x - parent.start.x), ancestor = bones.find(v => v.id === parent.parentId), ancestorAngle = ancestor ? result.get(ancestor.id)!.angle : 0;
    pp.angle = ancestorAngle + Math.max(parent.minAngle, Math.min(parent.maxAngle, (absolute - restAngle - ancestorAngle) * 180 / Math.PI)) * Math.PI / 180;
    const joint = { x: pp.start.x + Math.cos(restAngle + pp.angle) * a, y: pp.start.y + Math.sin(restAngle + pp.angle) * a };
    const desired = Math.atan2(child.ikTarget.y - joint.y, child.ikTarget.x - joint.x), childRest = Math.atan2(child.end.y - child.start.y, child.end.x - child.start.x);
    result.set(child.id, { start: joint, angle: pp.angle + Math.max(child.minAngle, Math.min(child.maxAngle, (desired - childRest - pp.angle) * 180 / Math.PI)) * Math.PI / 180 });
  }
  return result;
}
