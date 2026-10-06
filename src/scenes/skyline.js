import * as THREE from 'three';
import { palm, tree } from './landscape.js';

export function skyline(b, style) {
  const r = b.random, resort = style === 'resort';
  const rows = resort ? 4 : 3;
  for (let row = 0; row < rows; row++) for (let i = 0; i < 19; i++) {
    const x = -650 + i * 73 + (row % 2) * 32 + r() * 24, z = (resort ? -650 : -380) - row * 185 - r() * 50;
    const w = 19 + r() * 33, d = 20 + r() * 38, height = 38 + Math.pow(r(), 1.3) * (resort ? 155 : 135);
    if (resort && row === 0 && x > -60 && x < 200) continue;
    const facade = i%3===0?b.m.curtainFacades[i%3]:b.m.facades[i % 7]; b.cube([facade, facade, b.m.cream, b.m.cream, facade, facade], x, height / 2, z, w, height, d); b.stats.buildings++;
    b.cube(b.m.cream, x, height + .25, z, w + .5, .5, d + .5);
    if (i % 5 === 0) {
      for (let j = 0; j < 3; j++) b.cube(facade, x, height + 2.5 + j * 4, z, w * (.83 - j * .17), 5, d * (.8 - j * .15));
      b.cylinderPart(b.m.metal, x, height + 18, z, .1, 20);
    }
    if (i % 4 === 0) for (let px = x - w / 2; px <= x + w / 2; px += 2.5) b.cube(b.m.cream, px, height / 2, z + d / 2 + .04, .22, height, .06);
    if (row === 0) for (let j = 0; j < 3; j++) palm(b, x - w / 2 + j * w / 3, z + d / 2 + 10, 9 + r() * 7, 0, 1.1);
  }
  // Midground buildings are individually modeled so the skyline has depth.
  const positions = resort ? [[-175,-115,50,30,15],[-118,-125,34,37,18],[175,-135,33,35,31],[220,-87,46,28,23],[127,-190,35,28,13]] : [[-158,-75,31,37,19],[-117,-95,28,40,15],[167,-169,29,34,37],[207,-154,24,36,35],[275,-226,33,39,24],[355,-235,35,40,22]];
  for (const [x,z,w,d,floors] of positions) b.flatBuilding(x,z,w,d,floors,{floorHeight:3.6,balconies:!resort});
  if (!resort) {
    for (const x of [167,207]) for (let j = 0; j < 4; j++) b.cube(b.m.cream,x,134+j*2,-169,27-j*5,3,30-j*4);
    b.sign('VICE CITY', 277, 58, -205, 20, 4, '#a64040');
    // Left-hand terraced condominiums step down toward the bay.
    for (let i = 0; i < 7; i++) {
      const x=-182+i*12,z=4-i*7,floors=5+i;
      b.flatBuilding(x,z,13,35,floors,{floorHeight:3.5,balconies:true});
      b.cube(b.m.terracotta,x, floors*3.5+.3,z-9,11,.25,14);
    }
  }
  for (let i=0;i<45;i++) tree(b,-350+r()*740,(resort?-155:-210)-r()*160,9+r()*8,3+r()*3);
}
