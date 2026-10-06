export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, speed, dt) => lerp(a, b, 1 - Math.exp(-speed * dt));
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function districtAt(x, z, districts) {
  return districts.reduce((a, b) => Math.hypot(x - a.x, z - a.z) < Math.hypot(x - b.x, z - b.z) ? a : b);
}
export function formatMoney(value) { return '$' + Math.round(value).toLocaleString('en-US'); }
export function routeDistance(position, target) { return Math.hypot(position.x - target.x, position.z - target.z); }
