import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const box = new THREE.BoxGeometry(1, 1, 1);
const matrix = new THREE.Matrix4();
const quat = new THREE.Quaternion();
function part(geometry, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
  quat.setFromEuler(new THREE.Euler(rx, ry, rz));
  matrix.compose(new THREE.Vector3(x, y, z), quat, new THREE.Vector3(sx, sy, sz));
  return geometry.clone().applyMatrix4(matrix);
}
function bodyGeometry() {
  // Hand-modeled coupe shell: sloped nose, sculpted fenders, tapered rear.
  const cross = [
    { z: -2.4, w: 0.79, bottom: -0.35, top: 0.06 },
    { z: -2.05, w: 0.98, bottom: -0.38, top: 0.3 },
    { z: -1.4, w: 1.02, bottom: -0.4, top: 0.32 },
    { z: 0.75, w: 1.01, bottom: -0.4, top: 0.28 },
    { z: 1.7, w: 1.0, bottom: -0.37, top: 0.22 },
    { z: 2.35, w: 0.83, bottom: -0.26, top: -0.02 },
  ];
  const p = [], indices = [];
  cross.forEach(s => p.push(-s.w, s.bottom, s.z, s.w, s.bottom, s.z, -s.w, s.top, s.z, s.w, s.top, s.z));
  for (let i = 0; i < cross.length - 1; i++) {
    const a = i * 4, b = a + 4;
    indices.push(a + 2, b + 2, a + 3, a + 3, b + 2, b + 3, a, b, a + 2, b, b + 2, a + 2, a + 1, a + 3, b + 1, a + 3, b + 3, b + 1, a, a + 1, b, a + 1, b + 1, b);
  }
  indices.push(0, 2, 1, 2, 3, 1, 20, 21, 22, 21, 23, 22);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(indices); g.computeVertexNormals(); return g;
}
function cabinGeometry() {
  const p = [-.83,.29,-1.35, .83,.29,-1.35, -.70,1.05,-.82, .70,1.05,-.82, -.69,1.03,.15, .69,1.03,.15, -.84,.28,.96, .84,.28,.96];
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  g.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,4,6,5,5,6,7,0,6,2,2,6,4,1,3,7,7,3,5]); g.computeVertexNormals(); return g;
}

export function createVehicle(color = '#e9a37b', police = false) {
  const group = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color, metalness: 0.58, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.17 });
  const dark = new THREE.MeshStandardMaterial({ color: '#152328', roughness: 0.65 });
  const metal = new THREE.MeshStandardMaterial({ color: '#bcc9ca', roughness: 0.28, metalness: 0.85 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#739ca8', metalness: 0.28, roughness: 0.12, clearcoat: 1 });
  const light = new THREE.MeshStandardMaterial({ color: '#fff2ce', emissive: '#fff2d5', emissiveIntensity: 1.4 });
  const rear = new THREE.MeshStandardMaterial({ color: '#dc493e', emissive: '#ef4138', emissiveIntensity: 0.4 });
  const add = (geo, mat) => { const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); return mesh; };
  add(bodyGeometry(), paint); add(cabinGeometry(), glass);
  add(mergeGeometries([
    part(box, 0, 1.07, -.35, 1.44, .09, 1.13),
    part(box, -.82, .66, -.8, .07, .84, .07, .55), part(box, .82, .66, -.8, .07, .84, .07, .55),
    part(box, -.81, .65, .53, .07, .99, .07, -.8), part(box, .81, .65, .53, .07, .99, .07, -.8),
    part(box, -.82, .66, -.26, .06, .74, .07), part(box, .82, .66, -.26, .06, .74, .07),
    part(box, -1.08, .39, .48, .27, .16, .29), part(box, 1.08, .39, .48, .27, .16, .29),
  ]), paint);
  add(mergeGeometries([
    part(box, 0, -.23, 2.26, 1.64, .2, .1), part(box, 0, -.26, -2.31, 1.62, .2, .14),
    part(box, 0, -.28, 2.32, .64, .14, .07), part(box, -.985, -.32, 0, .05, .15, 2.45), part(box, .985, -.32, 0, .05, .15, 2.45),
  ]), dark);
  add(mergeGeometries([
    part(box, -.93, .15, -.1, .02, .04, .24), part(box, .93, .15, -.1, .02, .04, .24),
    part(box, 0, -.15, -2.405, .55, .13, .03),
    part(new THREE.CylinderGeometry(.065, .065, .18, 10), -.64, -.31, -2.4, 1, 1, 1, Math.PI / 2),
    part(new THREE.CylinderGeometry(.065, .065, .18, 10), .64, -.31, -2.4, 1, 1, 1, Math.PI / 2),
  ]), metal);
  add(mergeGeometries([part(box, -.60, .015, 2.275, .47, .13, .04), part(box, .60, .015, 2.275, .47, .13, .04)]), light);
  const brakeLights = add(mergeGeometries([part(box, -.56, .01, -2.34, .49, .12, .03), part(box, .56, .01, -2.34, .49, .12, .03)]), rear);
  const wheels = [];
  for (let i = 0; i < 4; i++) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .29, 20), dark); tire.rotation.z = Math.PI / 2; wheel.add(tire);
    const rimGeo = [];
    for (const side of [-1, 1]) {
      rimGeo.push(part(new THREE.CylinderGeometry(.29, .29, .02, 16), side * .155, 0, 0, 1, 1, 1, 0, 0, Math.PI / 2));
      for (let j = 0; j < 5; j++) rimGeo.push(part(box, side * .175, Math.cos(j * Math.PI * 2 / 5) * .14, Math.sin(j * Math.PI * 2 / 5) * .14, .03, .29, .035, j * Math.PI * 2 / 5));
    }
    const rim = new THREE.Mesh(mergeGeometries(rimGeo), metal); wheel.add(rim); tire.castShadow = true;
    wheel.position.set(i % 2 === 0 ? -.99 : .99, -.34, i < 2 ? 1.45 : -1.43);
    wheels.push(wheel);
  }
  if (police) {
    add(part(box, 0, 1.17, -.3, 1.1, .09, .25), dark);
    const red = new THREE.MeshStandardMaterial({ color: '#f04a5e', emissive: '#ef2040', emissiveIntensity: 3 });
    const blue = new THREE.MeshStandardMaterial({ color: '#418ed4', emissive: '#2090ff', emissiveIntensity: 3 });
    group.userData.sirens = [add(part(box, -.35, 1.27, -.3, .4, .16, .24), red), add(part(box, .35, 1.27, -.3, .4, .16, .24), blue)];
  }
  group.userData.paint = paint; group.userData.brakeLights = brakeLights; group.userData.wheels = wheels;
  return { group, wheels, paint, brakeLights };
}
