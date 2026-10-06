import * as THREE from 'three';
import { WORLD } from '../config.js';
import { seededRandom, clamp } from '../game/math.js';
import { leafyCanopy } from './vegetation.js';
import { Waterfront } from './waterfront.js';
import { tiledTexture } from './textures.js';

const islands = [{ x: 610, z: 1930, rx: 265, rz: 240 }, { x: 610, z: 2690, rx: 340, rz: 330 }, { x: 610, z: 3360, rx: 290, rz: 205 }];
const spans=[[1430,1710],[2150,2390],[2990,3170]];
export function bridgeHeight(z) { const span=spans.find(([a,b])=>z>=a&&z<=b);return span?Math.sin((z-span[0])/(span[1]-span[0])*Math.PI)**2*8+.12:.24; }
export function isLand(x, z) {
  if (x >= WORLD.terrainMinX && x <= WORLD.oceanX && z >= WORLD.minZ - 60 && z <= WORLD.maxZ + 65) return true;
  if (Math.abs(x - 610) < 14 && z >= 1420 && z <= 3590) return true;
  return islands.some(i => Math.pow((x - i.x) / i.rx, 2) + Math.pow((z - i.z) / i.rz, 2) < 1);
}
export function terrainHeight(x, z) {
  if (x >= -1240 || x < WORLD.terrainMinX || z < -1500 || z > 1500) return 0;
  const west = clamp((-x - 1240) / 1150, 0, 1);
  // Hills rise in the northwest; southern wetlands stay flat and traversable.
  const north = clamp((-z + 220) / 1000, 0, 1);
  return Math.max(0, west * north * (45 + Math.sin(x * .006) * Math.cos(z * .004) * 27 + Math.sin(x * .012 + z * .008) * 11));
}

export class Exterior {
  constructor(city) {
    this.city = city; this.scene = city.scene; this.r = seededRandom(6112); this.canopy=leafyCanopy();this.buildIslands(); this.buildWetlands();this.waterfront=new Waterfront(city);
  }
  buildIslands() {
    const c = this.city, m = c.materials, r = this.r;
    for (const island of islands) {
      this.islandSurface(island);
      for (let i = 0; i < 45; i++) {
        const angle = r() * Math.PI * 2, distance = Math.sqrt(r()) * .82;
        const x = island.x + Math.cos(angle) * island.rx * distance, z = island.z + Math.sin(angle) * island.rz * distance;
        if (Math.abs(x - 610) > 20) c.palm(x, z, 8 + r() * 7);
      }
      for(let i=0;i<115;i++){
        const a=r()*Math.PI*2,d=Math.sqrt(r())*.78,x=island.x+Math.cos(a)*island.rx*d,z=island.z+Math.sin(a)*island.rz*d;
        if(Math.abs(x-610)<22||island.z===2690&&x>688&&z>2630&&z<2750)continue;
        const h=5+r()*8;c.batch.add(c.cylinder,m.trunk,x,h*.48,z,1.6,h*.95,1.6);
        c.batch.add(this.canopy.geometry,this.canopy.materials[i%3],x,h,z,6+r()*5,3+r()*3,6+r()*5,r()*6.28);
      }
      c.cube(m.sidewalk, 610, .12, island.z, 33, .17, island.rz * 1.8);
      c.cube(m.asphalt, 610, .23, island.z, 22, .1, island.rz * 2);
      for (let z = island.z - island.rz + 25; z < island.z + island.rz; z += 35) c.cube(m.yellow, 610, .286, z, .15, .012, 11);
      for (let i = 0; i < 9; i++) {
        const x = 610 + (i % 2 ? -1 : 1) * (40 + r() * 110), z = island.z + (r() - .5) * island.rz * 1.2;
        if(island.z===2690&&x>688&&z>2630&&z<2750)continue;
        const h = 4 + r() * 4, w = 12 + r() * 10;
        c.solid(m.buildings[i % m.buildings.length], x, h / 2 + .3, z, w, h, 12); c.buildingCount++;
        const roof = new THREE.ConeGeometry(1, 1, 4); c.batch.add(roof, m.coral, x, h + 2, z, w * .77, 3.4, 10, Math.PI / 4);
        c.cube(m.white, x, 1, z + 8, w, .15, 4);
      }
    }
    for (const [start, end] of spans) {
      for(let z=start;z<end;z+=10){
        const h=bridgeHeight(z+5),rx=-Math.atan2(bridgeHeight(Math.min(z+10,end))-bridgeHeight(z),10);
        c.batch.add(c.box,m.sidewalk,610,h-.15,z+5,18,.28,10.3,0,0,rx);c.colliders.push({x:610,y:h-.15,z:z+5,w:18,h:.28,d:10.3,rx});
        c.batch.add(c.box,m.asphalt,610,h+.012,z+5,14,.04,10.2,0,0,rx);
        c.batch.add(c.box,m.yellow,610,h+.045,z+5,.14,.012,5.2,0,0,rx);
        for(const side of[-1,1]){c.batch.add(c.box,m.rail,610+side*8.5,h+.6,z+5,.23,1.3,10.3,0,0,rx);c.colliders.push({x:610+side*8.5,y:h+.6,z:z+5,w:.23,h:1.3,d:10.3,rx});}
        if((z-start)%30===0){for(const side of[-1,1])c.cube(m.sidewalk,610+side*5,h/2-1,z+5,1.6,h+2,2);}
      }
    }
    c.sign('THE KEYS|TAKE IT SLOW', 590, 5, 1670, 8);
  }
  islandSurface(island){
    const p=[],colors=[],uv=[],indices=[],rings=[0,.42,.76,.84,.94,1.03,1.11],segments=96;
    for(let j=0;j<rings.length;j++)for(let i=0;i<=segments;i++){
      const a=i/segments*Math.PI*2,r=rings[j],shape=1+Math.sin(a*3)*.06+Math.cos(a*5)*.035+Math.sin(a*9)*.02;
      const x=island.x+Math.cos(a)*island.rx*r*shape,z=island.z+Math.sin(a)*island.rz*r*shape;
      const y=j>4?-.3-(r-1)*7:.14-Math.max(0,r-.8)*1.1;
      p.push(x,y,z);uv.push((x-island.x)/13,(z-island.z)/13);
      const color=new THREE.Color(j<3?'#84976f':j<5?'#d5cca9':'#98b7ab');colors.push(color.r,color.g,color.b);
      if(j<rings.length-1&&i<segments){const n=j*(segments+1)+i,b=n+segments+1;indices.push(n,b,n+1,n+1,b,b+1);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    const mat=new THREE.MeshStandardMaterial({map:tiledTexture('grass'),vertexColors:true,roughness:1,side:THREE.DoubleSide});const mesh=new THREE.Mesh(geo,mat);mesh.receiveShadow=true;this.scene.add(mesh);
  }
  buildWetlands() {
    const c = this.city, m = c.materials, r = this.r;
    const width = 1475, depth = 3000, segmentsX = 59, segmentsZ = 120;
    const terrain = new THREE.PlaneGeometry(width, depth, segmentsX, segmentsZ); terrain.rotateX(-Math.PI / 2); terrain.translate(-1862.5, 0, 0);
    const position = terrain.attributes.position;
    for (let i = 0; i < position.count; i++) position.setY(i, terrainHeight(position.getX(i), position.getZ(i)) + .025);
    terrain.computeVertexNormals();
    const ground = new THREE.Mesh(terrain, m.grass); ground.receiveShadow = true; this.scene.add(ground);
    const heights = [];
    for (let i = 0; i <= segmentsX; i++) { const row = []; for (let j = 0; j <= segmentsZ; j++) row.push(terrainHeight(-2600 + i * width / segmentsX, 1500 - j * depth / segmentsZ)); heights.push(row); }
    c.heightfield = { heights, elementSize: width / segmentsX, x: -2600, z: 1500 };
    const crown = this.canopy.geometry, treeColors = this.canopy.materials;
    for (let i = 0; i < 550; i++) {
      const x = -2550 + r() * 1280, z = -1420 + r() * 2810;
      if (Math.abs(x + 1280) < 22 || Math.abs(z - 640) < 19) continue;
      const y = terrainHeight(x, z), h = 6 + r() * 13;
      c.batch.add(c.cylinder, m.trunk, x, y + h / 2, z, 1.5, h, 1.5);
      for (let j = 0; j < 3; j++) c.batch.add(crown, treeColors[i % 3], x + (r() - .5) * 4, y + h - j, z + (r() - .5) * 4, 4 + r() * 4, 3 + r() * 3, 4 + r() * 4);
    }
    // A connected east-west country road and north-south access road.
    c.cube(m.sidewalk, -1535, .02, 640, 860, .12, 23); c.cube(m.asphalt, -1535, .095, 640, 860, .04, 17);
    c.cube(m.sidewalk, -1280, .02, 0, 24, .12, 2920); c.cube(m.asphalt, -1280, .095, 0, 17, .04, 2920);
    for (let x = -1920; x < -1100; x += 32) c.cube(m.yellow, x, .124, 640, 11, .014, .12);
    for (let i = 0; i < 15; i++) {
      const x = -1350 - r() * 500, z = 690 + r() * 160, w = 10 + r() * 13;
      c.solid(m.buildings[i % m.buildings.length], x, 3.3, z, w, 6.5, 12); c.buildingCount++;
      c.cube(m.trunk, x, 6.6, z, w + 2, .25, 15); c.cube(m.white, x, .8, z - 10, w, .2, 8);
    }
    c.sign('GRASSRIVERS|COUNTRY ROAD', -1193, 5, 653, 7, '#b5d0a2', Math.PI / 2);
    c.sign('STARLITE|MOTEL', -1490, 9, 710, 10, '#f3c484');
    this.buildLandmarks();
  }
  buildLandmarks() {
    const c = this.city, m = c.materials;
    // Sculptural glass towers inspired by the flowing waterfront silhouettes.
    const curved = new THREE.CylinderGeometry(17, 21, 1, 22);
    for (const x of [225, 281]) {
      c.batch.add(curved, m.modern[1][0], x, 59, -450, 1, 118, .78);
      c.colliders.push({ x, y: 59, z: -450, w: 39, h: 118, d: 32 }); c.buildingCount++;
      for (let y = 5; y < 120; y += 4) c.batch.add(new THREE.CylinderGeometry(18, 18.2, .23, 22), m.white, x, y, -450, 1 + Math.sin(y * .032) * .11, 1, .78);
    }
    // Illuminated waterfront wheel: a visible orientation point beside the marina.
    const wheel = new THREE.Group(), metal = m.rail;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(28, .32, 7, 64), metal); wheel.add(ring);
    const glow = new THREE.MeshBasicMaterial({ color: '#ecc19b' });
    const rimLight = new THREE.Mesh(new THREE.TorusGeometry(28.4, .075, 4, 64), glow); wheel.add(rimLight);
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6, x = Math.cos(angle) * 28, y = Math.sin(angle) * 28;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(.1, 28, .1), metal); spoke.position.set(x / 2, y / 2, 0); spoke.rotation.z = angle - Math.PI / 2; wheel.add(spoke);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(3, 3.4, 3), i % 2 ? m.aqua : m.coral); cabin.position.set(x, y - 1.5, 0); wheel.add(cabin);
    }
    wheel.position.set(700, 32, 1080); wheel.rotation.y = Math.PI / 2; this.scene.add(wheel);
    c.solid(m.dark, 700, 14, 1080, 3, 28, 3);
    c.cube(m.sidewalk, 698, .08, 1080, 73, .12, 50);
  }
}
