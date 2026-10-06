import * as THREE from 'three';
import { Batch } from '../world/batch.js';
import { seededRandom } from '../game/math.js';
import { paintedTexture } from './palette.js';

export class SceneBuilder {
  constructor(root, materials, seed) {
    this.root = root; this.m = materials; this.random = seededRandom(seed); this.batch = new Batch(root);
    this.box = new THREE.BoxGeometry(1, 1, 1); this.cylinder = new THREE.CylinderGeometry(1, 1, 1, 10);
    this.sphere = new THREE.SphereGeometry(1, 10, 8); this.stats = { buildings: 0, palms: 0, people: 0, vehicles: 0, realisticCars:0, boats:0, floors: 0 };
    this.colliders=[]; this.animations = []; this.resources = [];
  }
  cube(material, x, y, z, w = 1, h = 1, d = 1, ry = 0, rz = 0, rx = 0) { this.batch.add(this.box, material, x, y, z, w, h, d, ry, rz, rx); if(w>=4&&d>=3&&h>=2)this.colliders.push({x,y,z,w,h,d,ry}); }
  cylinderPart(material, x, y, z, radius, height, ry = 0, rz = 0, rx = 0) { this.batch.add(this.cylinder, material, x, y, z, radius, height, radius, ry, rz, rx); }
  mesh(geometry, material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; this.root.add(mesh); return mesh;
  }
  beam(material, start, end, thickness = .06) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end), center = a.clone().add(b).multiplyScalar(.5), delta = b.sub(a);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    this.cube(material, center.x, center.y, center.z, thickness, delta.length(), thickness, euler.y, euler.z, euler.x);
  }
  sign(text, x, y, z, w, h, color = '#5d4f3c', background = null) {
    const map = paintedTexture(1024, Math.max(128, Math.round(1024 * h / w)), (ctx, width, height) => {
      ctx.clearRect(0, 0, width, height); if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 ${Math.min(height * .6, width / (text.length * .6))}px Arial`; ctx.fillText(text, width / 2, height / 2);
    });
    const material = new THREE.MeshStandardMaterial({ map, transparent: true, roughness: .8, side: THREE.DoubleSide, depthWrite: false });
    const mesh = this.mesh(new THREE.PlaneGeometry(w, h), material, x, y, z); mesh.castShadow = false; return mesh;
  }
  flatBuilding(x, z, w, d, floors, { base = 0, floorHeight = 3.2, material = this.m.white, balconies = false, roof = true, windows = true } = {}) {
    const height = floors * floorHeight;
    this.cube(material, x, base + height / 2, z, w, height, d); this.stats.buildings++;
    if (windows) for (let floor = 0; floor < floors; floor++) {
      const y = base + floor * floorHeight + floorHeight * .53;
      for (let dx = -w / 2 + 1.8; dx < w / 2 - .6; dx += 3.3) {
        for (const side of [-1, 1]) {
          this.cube(this.m.glass, x + dx, y, z + side * (d / 2 + .025), 1.7, floorHeight * .69, .05);
          this.cube(this.m.white, x + dx, y, z + side * (d / 2 + .07), .065, floorHeight * .72, .06);
          this.cube(this.m.cream, x + dx, y - floorHeight * .35, z + side * (d / 2 + .13), 1.95, .1, .24);
        }
      }
      for (let dz = -d / 2 + 1.6; dz < d / 2 - .8; dz += 3.5) for (const side of [-1, 1]) this.cube(this.m.glass, x + side * (w / 2 + .03), y, z + dz, .06, floorHeight * .69, 1.7);
      if (balconies) for (const side of [-1, 1]) {
        this.cube(this.m.white, x, base + floor * floorHeight + .2, z + side * (d / 2 + .9), w + .4, .24, 2);
        this.cube(this.m.glassRail, x, base + floor * floorHeight + .85, z + side * (d / 2 + 1.9), w, 1.05, .035);
        this.cube(this.m.metal, x, base + floor * floorHeight + 1.4, z + side * (d / 2 + 1.9), w, .04, .04);
      }
    }
    if (roof) {
      this.cube(this.m.concrete, x, base + height + .07, z, w + .35, .2, d + .35);
      for (const side of [-1, 1]) { this.cube(material, x, base + height + .6, z + side * d / 2, w, 1.2, .28); this.cube(material, x + side * w / 2, base + height + .6, z, .28, 1.2, d); }
      for (let i = 0; i < Math.min(5, Math.floor(w / 8)); i++) { const px = x - w / 3 + i * 5; this.cube(this.m.cream, px, base + height + .65, z - 2, 1.7, 1.1, 1.5); this.cylinderPart(this.m.metal, px, base + height + 1.25, z - 2, .45, .08); }
    }
    return base + height;
  }
  flush() { this.batch.flush(); }
  section(build,x=0,y=0,z=0) {
    const root=new THREE.Group(),child=new SceneBuilder(root,this.m,Math.floor(this.random()*100000));build(child);child.flush();root.position.set(x,y,z);this.root.add(root);
    Object.keys(this.stats).forEach(key=>this.stats[key]+=child.stats[key]);this.animations.push(...child.animations);this.colliders.push(...child.colliders.map(c=>({...c,x:c.x+x,y:c.y+y,z:c.z+z})));return root;
  }
}
