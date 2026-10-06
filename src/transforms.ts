import type { Point, Transform } from './model';
export const identity = (): number[] => [1, 0, 0, 1, 0, 0];
export function multiply(a: number[], b: number[]) {
  return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
}
export function applyMatrix(m: number[], p: Point) { return {x:m[0]*p.x+m[2]*p.y+m[4], y:m[1]*p.x+m[3]*p.y+m[5]}; }
export function inverseMatrix(m: number[]) {
  const d=m[0]*m[3]-m[1]*m[2];
  if (Math.abs(d)<1e-10) return identity();
  return [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d,(m[2]*m[5]-m[3]*m[4])/d,(m[1]*m[4]-m[0]*m[5])/d];
}
export function layerMatrix(t: Transform) {
  const angle=t.rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  return [c*t.scale.x,s*t.scale.x,-s*t.scale.y,c*t.scale.y,t.position.x,t.position.y];
}
