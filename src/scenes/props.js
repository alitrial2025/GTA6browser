import * as THREE from 'three';
import { createDetailedCharacter } from '../world/detailed-character.js';
import { createDetailedVehicle } from '../world/detailed-vehicle.js';
import { createClassicCar } from './classic-car.js';
import { planter } from './landscape.js';

const canopy = new THREE.ConeGeometry(1, .35, 12, 1, true), ring = new THREE.TorusGeometry(.24, .023, 6, 16);
const vehicleTemplates = new Map();
export function umbrella(b, x, z, base = 0, size = 2.5, material = b.m.blue, open = true) {
  b.cylinderPart(b.m.metal, x, base + 1.65, z, .036, 3.3);
  if (open) {
    b.batch.add(canopy, material, x, base + 3.2, z, size, size, size);
    for (let i = 0; i < 8; i++) { const angle = i * Math.PI / 4; b.beam(b.m.metal, [x, base + 3.45, z], [x + Math.cos(angle) * size, base + 2.85, z + Math.sin(angle) * size], .022); }
  } else b.cylinderPart(material, x, base + 2.7, z, .16, 1.7);
}

export function lounger(b, x, z, base = 0, angle = 0, material = b.m.terracotta) {
  const point = (dx, dz) => [x + Math.cos(angle) * dx + Math.sin(angle) * dz, z - Math.sin(angle) * dx + Math.cos(angle) * dz];
  b.cube(material, x, base + .45, z, .75, .14, 1.7, angle);
  const [px, pz] = point(0, -.96); b.cube(material, px, base + .7, pz, .75, .13, .8, angle, 0, .48);
  for (const dx of [-.4, .4]) { const [xx, zz] = point(dx, 0); b.cube(b.m.metal, xx, base + .39, zz, .034, .08, 1.85, angle); }
  for (const dx of [-.32, .32]) for (const dz of [-.65, .6]) { const [xx, zz] = point(dx, dz); b.cube(b.m.metal, xx, base + .21, zz, .04, .4, .04); }
}

export function fence(b, x, z, length, height = 4, angle = 0, base = 0) {
  const dx = Math.cos(angle), dz = Math.sin(angle), p = t => [x + dx * t, z + dz * t];
  for (let t = -length / 2; t <= length / 2 + .1; t += 5) { const [px, pz] = p(t); b.cylinderPart(b.m.dark, px, base + height / 2, pz, .05, height); }
  for (const y of [.15, height * .5, height]) { const [ax, az] = p(-length / 2), [bx, bz] = p(length / 2); b.beam(b.m.dark, [ax, base + y, az], [bx, base + y, bz], .055); }
  // Actual diagonal wire geometry catches light from oblique camera angles.
  for (let t = -length / 2; t < length / 2; t += .6) for (const slope of [-1, 1]) {
    const end = Math.min(length / 2, t + height * .45), [ax, az] = p(t), [bx, bz] = p(end);
    b.beam(b.m.metal, [ax, base + (slope === 1 ? 0 : height), az], [bx, base + (slope === 1 ? height : 0), bz], .012);
  }
}

export function lamp(b, x, z, height = 8, direction = 0, base = 0) {
  b.cylinderPart(b.m.metal, x, base + height / 2, z, .065, height);
  const dx = Math.sin(direction) * 1.4, dz = Math.cos(direction) * 1.4;
  b.beam(b.m.metal, [x, base + height, z], [x + dx, base + height + .35, z + dz], .055);
  b.cube(b.m.cream, x + dx, base + height + .31, z + dz, .35, .15, .85, direction);
}

export function bench(b, x, z, base = 0, angle = 0) {
  b.cube(b.m.foliage[1], x, base + .5, z, 2.4, .18, .6, angle);
  b.cube(b.m.foliage[1], x - Math.sin(angle) * .26, base + .9, z - Math.cos(angle) * .26, 2.4, .6, .07, angle);
  for (const side of [-1, 1]) b.cube(b.m.dark, x + Math.cos(angle) * side * .9, base + .25, z - Math.sin(angle) * side * .9, .09, .5, .5, angle);
}

export function person(b, x, z, base = 0, angle = 0, walking = false) {
  const human = createDetailedCharacter(b.stats.people);
  if (!human) return;
  human.position.set(x, base, z); human.rotation.y = angle; b.root.add(human); b.stats.people++;
  // Freeze a different phase for each person; walking animations run only if enabled.
  const phase = b.random() * 3; human.userData.animate(phase, .7); human.updateMatrixWorld(true);
  if (walking) b.animations.push(time => human.userData.animate(time * .65 + phase, .7));
  return human;
}

export function car(b, x, z, angle = Math.PI / 2, color = '#b8c8c4', detailed = false, base = 0) {
  b.colliders.push({x,y:base+.8,z,w:Math.abs(Math.cos(angle))*2.12+Math.abs(Math.sin(angle))*5.35,h:1.6,d:Math.abs(Math.sin(angle))*2.12+Math.abs(Math.cos(angle))*5.35});
  if (!detailed) {
    if (!vehicleTemplates.has(color)) vehicleTemplates.set(color,createClassicCar(color,false));
    const group = vehicleTemplates.get(color); group.position.set(x, base, z); group.rotation.y = angle; group.updateMatrixWorld(true);
    group.traverse(o => { if (o.isMesh) b.batch.addMatrix(o.geometry, o.material, o.matrixWorld); });
    b.stats.vehicles++;b.stats.realisticCars++;return null;
  }
  const vehicle = createDetailedVehicle(color);
  for (const wheel of vehicle.wheels) vehicle.group.add(wheel);
  vehicle.group.position.set(x, base + .66, z); vehicle.group.rotation.y = angle; b.root.add(vehicle.group); b.stats.vehicles++;b.stats.realisticCars++;return vehicle.group;
}

export function classicCar(b,x,z,angle=0,color='#328ab3',base=0) {
  b.colliders.push({x,y:base+.8,z,w:Math.abs(Math.cos(angle))*2.12+Math.abs(Math.sin(angle))*5.35,h:1.6,d:Math.abs(Math.sin(angle))*2.12+Math.abs(Math.cos(angle))*5.35});
  const group=createClassicCar(color,true);group.position.set(x,base,z);group.rotation.y=angle;b.root.add(group);b.stats.vehicles++;b.stats.realisticCars++;return group;
}

export function bus(b, x, z, angle = Math.PI / 2) {
  const group = new THREE.Group(), m = b.m;
  const add = (mat, px, py, pz, w, h, d) => { const mesh = new THREE.Mesh(b.box, mat); mesh.position.set(px, py, pz); mesh.scale.set(w, h, d); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh); };
  add(m.white, 0, 1.8, 0, 2.7, 2.5, 12.2); add(m.blue, 0, .78, 0, 2.74, .45, 12.2); add(m.red, 0, 1.08, 0, 2.75, .15, 12.2);
  add(m.cream, 0, 3.12, 0, 2.5, .18, 11.5); add(m.blue, 0, 3.22, 0, 2.05, .12, 8.3);
  for (const side of [-1, 1]) for (let pz = -5.2; pz < 5.3; pz += 1.28) {
    add(m.glassDark, side * 1.37, 2.22, pz, .04, 1.25, 1.14);
    add(m.frame, side * 1.4, 2.22, pz + .59, .04, 1.34, .055);
  }
  add(m.glassDark, 0, 2.16, 6.13, 2.42, 1.6, .03); add(m.dark, 0, .73, 6.15, 2.45, .27, .1);
  for (const side of [-1, 1]) {
    add(m.yellow, side * .94, 1.1, 6.15, .43, .25, .035);
    for (const pz of [-3.85, 3.9]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.58, .58, .3, 20), m.black); wheel.rotation.z = Math.PI / 2; wheel.position.set(side * 1.3, .62, pz); group.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .32, 16), m.metal); hub.rotation.z = Math.PI / 2; hub.position.copy(wheel.position); group.add(hub);
    }
  }
  group.position.set(x, 0, z); group.rotation.y = angle; b.root.add(group); b.stats.vehicles++; return group;
}

export function basketballCourt(b, x, z, base = 0, width = 29, length = 16, surface = b.m.courtBlue) {
  b.cube(b.m.courtGreen, x, base - .1, z, width + 8, .2, length + 8);
  b.cube(surface, x, base + .015, z, width, .03, length);
  const white = b.m.white;
  for (const side of [-1, 1]) { b.cube(white, x, base + .04, z + side * length / 2, width, .02, .055); b.cube(white, x + side * width / 2, base + .04, z, .055, .02, length); }
  b.cube(white, x, base + .04, z, .055, .02, length);
  const arc = (cx, cz, radius, a0, a1) => {
    const points = Array.from({ length: 49 }, (_, i) => new THREE.Vector3(cx + Math.cos(a0 + (a1 - a0) * i / 48) * radius, base + .055, cz + Math.sin(a0 + (a1 - a0) * i / 48) * radius));
    const mesh = b.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, .026, 4, false), white); mesh.castShadow = false;
  };
  arc(x, z, 1.9, 0, Math.PI * 2);
  for (const side of [-1, 1]) {
    const hx = x + side * (width / 2 - 1.2);
    b.cube(b.m.dark, hx + side * 1.4, base + 1.8, z, .11, 3.6, .11);
    b.cube(white, hx + side * .45, base + 3.35, z, .08, 1.05, 1.8);
    b.cube(b.m.red, hx + side * .4, base + 3.31, z, .021, .47, .63);
    b.batch.add(ring, b.m.terracotta, hx, base + 3.07, z, 1, 1, 1, 0, 0, Math.PI / 2);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; b.beam(white, [hx + Math.cos(a) * .24, base + 3.06, z + Math.sin(a) * .24], [hx + Math.cos(a + .25) * .14, base + 2.68, z + Math.sin(a + .25) * .14], .012); }
    b.cube(white, x + side * (width / 2 - 3), base + .05, z - 2.4, 6, .02, .055);
    b.cube(white, x + side * (width / 2 - 3), base + .05, z + 2.4, 6, .02, .055);
    b.cube(white, x + side * (width / 2 - 6), base + .05, z, .055, .02, 4.8);
    arc(x + side * (width / 2 - 6), z, 1.8, -Math.PI / 2, Math.PI / 2);
    arc(hx, z, 6.7, side === -1 ? -Math.PI / 2 : Math.PI / 2, side === -1 ? Math.PI / 2 : Math.PI * 1.5);
  }
  fence(b, x, z - length / 2 - 3, width + 6, 4.5, 0, base);
  fence(b, x + width / 2 + 3, z, length + 6, 4.5, Math.PI / 2, base);
}

export function terrace(b, x, z, width, depth, base, umbrellas = true) {
  b.cube(b.m.cream, x, base, z, width, .18, depth);
  for (let px = x - width / 2 + 2.3; px < x + width / 2 - 1; px += 3.6) {
    lounger(b, px, z + depth * .18, base + .12, 0); lounger(b, px, z - depth * .18, base + .12, Math.PI);
    if (umbrellas && Math.round(px) % 2 === 0) umbrella(b, px, z, base + .12, 2.1);
  }
  for (const side of [-1, 1]) { planter(b, x + side * (width / 2 - 1), z - depth / 2 + 1, base); planter(b, x + side * (width / 2 - 1), z + depth / 2 - 1, base); }
}
