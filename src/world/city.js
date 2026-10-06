import * as THREE from 'three';
import { WORLD } from '../config.js';
import { seededRandom } from '../game/math.js';
import { Batch, palmLeafGeometry } from './batch.js';
import { canvasTexture, createMaterials } from './materials.js';
import { Exterior } from './exterior.js';
import { Resort } from './resort.js';
import { Marine } from './marine.js';

export class City {
  constructor(scene) {
    this.scene = scene; this.random = seededRandom(WORLD.seed); this.materials = createMaterials();
    this.colliders = []; this.blocks = []; this.buildingCount = 0; this.palmCount = 0;
    this.batch = new Batch(scene); this.box = new THREE.BoxGeometry(1, 1, 1);
    this.cylinder = new THREE.CylinderGeometry(0.3, 0.5, 1, 9);
    this.leaf = palmLeafGeometry(); this.build(); this.resort = new Resort(this); this.exterior = new Exterior(this); this.marine = new Marine(this); this.batch.flush();
  }
  cube(mat, x, y, z, w, h, d, ry = 0) { this.batch.add(this.box, mat, x, y, z, w, h, d, ry); }
  solid(mat, x, y, z, w, h, d) {
    this.cube(mat, x, y, z, w, h, d);
    this.colliders.push({ x, y, z, w, h, d });
  }
  palm(x, z, height = 10) {
    this.batch.add(this.cylinder, this.materials.trunk, x, height / 2, z, 0.85, height, 0.85, this.random() * 6.28, 0.035);
    for (let i = 0; i < 8; i++) this.batch.add(this.leaf, this.materials.leaf, x + height * 0.03, height, z, 1.05, 1, 1.05, i * Math.PI / 4 + this.random() * 0.25);
    this.palmCount++;
  }
  lamp(x, z) {
    const m = this.materials;
    this.cube(m.dark, x, 3.6, z, 0.15, 7.2, 0.15);
    this.cube(m.dark, x + 0.65, 7.1, z, 1.45, 0.13, 0.13);
    this.cube(m.white, x + 1.25, 7.01, z, 0.7, 0.1, 0.35);
  }
  sign(text, x, y, z, width, color = '#edaa8d', rotation = 0) {
    const texture = canvasTexture(512, (c, s) => {
      c.fillStyle = '#213c42'; c.fillRect(0, 0, s, s);
      c.strokeStyle = color; c.lineWidth = 9; c.strokeRect(18, 95, s - 36, s - 190);
      c.fillStyle = color; c.font = `bold ${text.length > 12 ? 31 : 45}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      const parts = text.split('|'); parts.forEach((p, i) => c.fillText(p, s / 2, s / 2 + (i - (parts.length - 1) / 2) * 60));
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 }));
    mesh.position.set(x, y, z); mesh.rotation.y = rotation; this.scene.add(mesh);
  }
  build() {
    const m = this.materials, r = this.random, half = WORLD.road / 2;
    this.cube(m.asphalt, -240, -0.22, 0, 1930, 0.4, 3100);
    this.cube(m.sand, 702, -0.19, 0, 106, 0.35, 3100);
    this.cube(m.sidewalk, 638, -0.015, 0, 20, 0.12, 3000);
    // Continuous coastal avenue and a promenade facing the Atlantic.
    this.cube(m.asphalt, 610, -0.09, 0, 28, 0.16, 3000);
    for (let z = -1440; z <= 1440; z += 32) {
      this.cube(m.white, 610, 0.012, z, 0.16, 0.024, 9);
      if (z % 64 === 0) { this.palm(644, z, 9 + r() * 4); this.lamp(627, z); }
    }
    for (let x = WORLD.minX; x < 640; x += WORLD.cell) {
      for (let z = WORLD.minZ; z < WORLD.maxZ; z += WORLD.cell) {
        const cx = x + 80, cz = z + 80;
        this.blocks.push({ x: cx, z: cz });
        this.cube(m.sidewalk, cx, -0.01, cz, 134, 0.14, 134);
        const downtown = x >= -480 && x <= 0 && z >= -800 && z <= -160;
        const coastal = x === 480;
        const industrial = x < -640 && z > 480;
        if ((x === 480 || x === 320) && z === 0) {
          // Hand-authored resort and basketball courts replace these generic blocks.
        } else if (r() < 0.13 && !coastal) {
          this.cube(m.grass, cx, 0.09, cz, 121, 0.05, 121);
          this.cube(m.sidewalk, cx, 0.13, cz, 6, 0.08, 121);
          this.cube(m.sidewalk, cx, 0.13, cz, 121, 0.08, 6);
          for (let i = 0; i < 10; i++) this.palm(cx + (r() - 0.5) * 100, cz + (r() - 0.5) * 100, 7 + r() * 6);
          this.cube(m.aqua, cx + 25, 0.17, cz + 24, 21, 0.05, 16);
        } else {
          const count = downtown ? 3 : 4;
          for (let i = 0; i < count; i++) {
            const bx = cx + (i % 2 === 0 ? -32 : 32), bz = cz + (i < 2 ? -32 : 32);
            const w = (downtown ? 37 : 32) + r() * 15, d = 31 + r() * 17;
            const h = downtown ? 48 + r() * 112 : coastal ? 16 + r() * 34 : industrial ? 7 + r() * 9 : 7 + r() * 23;
            const palette = downtown ? m.modern : m.buildings;
            const material = palette[Math.floor(r() * palette.length)];
            this.solid(material, bx, h / 2, bz, w, h, d); this.buildingCount++;
            this.cube(downtown ? m.rail : m.white, bx, h + 0.55, bz, w + 1.1, 1.1, d + 1.1);
            this.cube(m.dark, bx + w * 0.15, h + 1.5, bz + 2, w * 0.33, 2, d * 0.25);
            if (downtown) {
              this.cube(material, bx, h + 6, bz, w * 0.7, 11, d * 0.7);
              for (let j = 0; j < 4; j++) this.cube(m.rail, bx + (j - 1.5) * w / 4, h / 2, bz + d / 2 + 0.07, 0.35, h, 0.18);
            } else {
              this.cube(r() > 0.5 ? m.coral : m.aqua, bx, 3.5, bz + d / 2 + 1.4, w - 2, 0.28, 3.3);
              if (coastal) for (let j = 1; j < Math.min(8, h / 4); j++) {
                this.cube(m.white, bx, j * 4, bz + d / 2 + 1.2, w + 0.4, 0.2, 2.5);
                this.cube(m.rail, bx, j * 4 + 0.8, bz + d / 2 + 2.3, w, 0.08, 0.09);
              }
            }
          }
        }
        // Crosswalks, lane paint, and intersection stop lines.
        for (let j = -4; j <= 4; j++) {
          this.cube(m.white, x + j * 2.4, 0.012, z + 18, 1.1, 0.024, 4);
          this.cube(m.white, x + 18, 0.012, z + j * 2.4, 4, 0.024, 1.1);
        }
        for (let k = 36; k < 150; k += 22) {
          this.cube(m.yellow, x - 0.35, 0.012, z + k, 0.12, 0.024, 8);
          this.cube(m.yellow, x + 0.35, 0.012, z + k, 0.12, 0.024, 8);
          this.cube(m.yellow, x + k, 0.012, z - 0.35, 8, 0.024, 0.12);
          this.cube(m.yellow, x + k, 0.012, z + 0.35, 8, 0.024, 0.12);
        }
        this.palm(x + 17, z + 41, 9 + r() * 4);
        this.palm(x + 17, z + 113, 10 + r() * 3);
        this.lamp(x - 16, z + 35);
        if (coastal) { this.palm(cx + 48, cz, 11 + r() * 4); this.palm(x - 17, z + 64, 10 + r() * 3); }
      }
    }
    // Beach furniture, lifeguard towers and marina piers.
    const umbrella = new THREE.ConeGeometry(2.7, 1.05, 10, 1, true);
    for (let z = -1200; z < 1200; z += 65) {
      const x = 688 + r() * 27;
      this.batch.add(umbrella, z % 130 === 0 ? m.coral : m.aqua, x, 3.3, z);
      this.cube(m.white, x, 1.65, z, 0.1, 3.3, 0.1);
      this.cube(m.white, x + 2.5, 0.4, z + 1, 0.8, 0.3, 2.1);
      this.cube(m.white, x - 2.5, 0.4, z + 1, 0.8, 0.3, 2.1);
    }
    for (const z of [-700, 130, 700]) {
      for (const dx of [-1.7, 1.7]) for (const dz of [-1.5, 1.5]) this.cube(m.white, 731 + dx, 1.4, z + dz, 0.16, 2.8, 0.16);
      this.cube(m.aqua, 731, 3.6, z, 5, 2, 4.5); this.cube(m.white, 731, 4.8, z, 6.3, 0.3, 5.5);
      this.cube(m.coral, 731, 2.9, z - 3.7, 5.5, 0.3, 3.3);
    }
    for (const z of [880, 1040, 1200]) {
      this.solid(m.white, 800, 0.45, z, 100, 0.9, 7);
      for (let x = 766; x < 848; x += 17) {
        this.cube(m.trunk, x, 0.8, z - 5, 0.3, 1.6, 0.3);
        this.cube(m.trunk, x, 0.8, z + 5, 0.3, 1.6, 0.3);
        this.boat(x, z + 13, m);
      }
    }
    // City perimeter remains traversable, with ocean recovery handled by gameplay.
    this.sign('COLONY|HOTEL', 526, 12, 93, 10, '#ecc4a0');
    this.sign('OCEAN|DRIVE', 591, 5, -77, 7, '#a9e2d6', Math.PI / 2);
    this.sign('VICE|HORIZON', -214, 33, -346, 18, '#efba9c');
    this.sign('PALM|SOCIAL CLUB', 542, 10, 252, 10, '#b7d6bd');
  }
  boat(x, z, m) {
    this.cube(m.white, x, 0.5, z, 4, 1.1, 10);
    this.cube(m.dark, x, 1.5, z - 1, 3, 1.3, 4);
    this.cube(m.white, x, 2.2, z - 1, 3.3, 0.2, 4.5);
    this.cube(m.rail, x, 7.5, z + 1, 0.09, 14, 0.09);
    const sail = new THREE.BufferGeometry();
    sail.setAttribute('position', new THREE.Float32BufferAttribute([0, 2, 0, 0, 14, 0, 0, 2, 5.5], 3)); sail.computeVertexNormals();
    this.batch.add(sail, new THREE.MeshStandardMaterial({ color: '#f0e9d7', side: THREE.DoubleSide }), x, 0, z + 1);
  }
}
