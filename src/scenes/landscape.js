import * as THREE from 'three';
import { palmLeafGeometry } from '../world/batch.js';
import { leafyCanopy } from '../world/vegetation.js';

const frond = palmLeafGeometry(), crown = new THREE.IcosahedronGeometry(1, 1);
let leaves;
export function palm(b, x, z, height = 12, base = 0, size = 1) {
  const r = b.random, lean = (r() - .5) * .13, direction = r() * Math.PI * 2, angle = r() * Math.PI * 2;
  const tx = Math.sin(direction) * height * lean, tz = Math.cos(direction) * height * lean;
  for (let i = 0; i < 7; i++) {
    const t = (i + .5) / 7, px = x + tx * t * t, pz = z + tz * t * t;
    b.cylinderPart(b.m.trunk, px, base + height * t, pz, (.19 + (1 - t) * .12) * size, height / 7 + .05, 0, -lean * Math.sin(direction) * 2 * t, lean * Math.cos(direction) * 2 * t);
    for (let j = 0; j < 3; j++) b.cylinderPart(b.m.concrete, px, base + height * (i / 7) + j * height / 21, pz, (.194 + (1 - t) * .12) * size, .025);
  }
  b.batch.add(crown, b.m.leaf[1], x + tx, base + height, z + tz, .5 * size, .68 * size, .5 * size);
  for (let i = 0; i < 19; i++) {
    const a = angle + i * Math.PI * 2 / 19, scale = (.98 + r() * .38) * size;
    b.batch.add(frond, b.m.leaf[i % 4], x + tx, base + height, z + tz, scale, scale, scale, a, .07 + r() * .26, -.22 + r() * .31);
  }
  // The upright new fronds create the feathered silhouette at the top of the crown.
  for (let i = 0; i < 4; i++) b.batch.add(frond, b.m.leaf[2], x + tx, base + height, z + tz, .4 * size, .56 * size, .4 * size, angle + i * 1.7, 0, -.95);
  b.stats.palms++;
}

export function tree(b, x, z, height = 9, radius = 4, base = 0) {
  if(!leaves){leaves=leafyCanopy(480,.55);leaves.materials.forEach(m=>m.color.set('#6c8446'));}
  b.cylinderPart(b.m.trunk, x, base + height * .4, z, .24, height * .8);
  for (let i = 0; i < 6; i++) {
    const angle = i * 2.4, rr = i ? radius * .45 : 0, px = x + Math.sin(angle) * rr, pz = z + Math.cos(angle) * rr, y = base + height - radius * .35 + (i % 2) * radius * .4;
    b.beam(b.m.trunk, [x, base + height * .55, z], [px, y, pz], .14);
    b.batch.add(leaves.geometry, leaves.materials[i % 3], px, y, pz, radius * .88, radius * .77, radius * .88, angle);
  }
}

export function shrub(b, x, z, radius = 1, base = 0) { b.batch.add(crown, b.m.foliage[2], x, base + radius * .55, z, radius, radius * .7, radius); }
export function planter(b, x, z, base = 0, radius = .65) {
  b.cylinderPart(b.m.terracotta, x, base + .42, z, radius, .85); shrub(b, x, z, radius * .85, base + .55);
}
