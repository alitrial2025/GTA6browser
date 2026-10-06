import * as THREE from 'three';
import { seededRandom } from '../game/math.js';
import { tiledTexture } from './textures.js';

export function canvasTexture(size, paint) {
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  paint(canvas.getContext('2d'), size);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function createMaterials() {
  const rng = seededRandom(912);
  const asphalt = canvasTexture(256, (c, s) => {
    c.fillStyle = '#454c50'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 16000; i++) {
      const v = Math.floor(45 + rng() * 65); c.fillStyle = `rgba(${v},${v + 4},${v + 6},0.45)`;
      c.fillRect(rng() * s, rng() * s, 1, 1);
    }
  });
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping; asphalt.repeat.set(90, 130);
  const sand = canvasTexture(256, (c, s) => {
    c.fillStyle = '#e6d4ad'; c.fillRect(0, 0, s, s);
    for (let i = 0; i < 18000; i++) { c.fillStyle = rng() > 0.5 ? '#eeddbe' : '#cbb991'; c.globalAlpha = 0.2; c.fillRect(rng() * s, rng() * s, 1.5, 1.5); }
  });
  sand.wrapS = sand.wrapT = THREE.RepeatWrapping; sand.repeat.set(18, 90);
  const facade = (base, modern = false) => canvasTexture(256, (c, s) => {
    c.fillStyle = base; c.fillRect(0, 0, s, s);
    const columns = modern ? 8 : 4, rows = modern ? 12 : 7;
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const w = s / columns, h = s / rows;
      const mx = modern ? 2 : w * 0.22, my = modern ? 2 : h * 0.19;
      c.fillStyle = '#77949a'; c.fillRect(x * w + mx - 1, y * h + my - 1, w - mx * 2 + 2, h - my * 2 + 2);
      const g = c.createLinearGradient(0, y * h, 0, (y + 1) * h);
      g.addColorStop(0, modern ? '#417481' : '#365961'); g.addColorStop(0.45, '#79a4aa'); g.addColorStop(1, '#364e56');
      c.fillStyle = g; c.fillRect(x * w + mx, y * h + my, w - mx * 2, h - my * 2);
      c.fillStyle = 'rgba(218,236,229,0.4)'; c.fillRect(x * w + mx + 1, y * h + my + 1, 1.5, h - my * 2);
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x * w + mx - 2, y * h + h - my, w - mx * 2 + 4, 2);
      if (rng() < 0.15) { c.fillStyle = 'rgba(243,212,153,0.6)'; c.fillRect(x * w + mx + 1, y * h + my + 2, w - mx * 2 - 2, h - my * 2 - 3); }
    }
    if (!modern) { c.fillStyle = 'rgba(250,247,225,0.65)'; for (let y = 0; y < rows; y++) c.fillRect(0, y * s / rows, s, 2); }
  });
  const pastels = ['#e5b3a0', '#a4c5bd', '#ddd3b3', '#e5d5bf', '#acbed0', '#e4bebe', '#c4c3a5', '#e4e5df'];
  const buildings = pastels.map(color => {
    const wall = new THREE.MeshStandardMaterial({ map: facade(color), roughness: 0.83 });
    const roof = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    return [wall, wall, roof, roof, wall, wall];
  });
  const modern = ['#517784', '#749399', '#9badb0'].map(color => {
    const glass = new THREE.MeshStandardMaterial({ map: facade(color, true), metalness: 0.35, roughness: 0.28 });
    const roof = new THREE.MeshStandardMaterial({ color: '#829291', roughness: 0.6 });
    return [glass, glass, roof, roof, glass, glass];
  });
  return {
    asphalt: new THREE.MeshStandardMaterial({ map: asphalt, bumpMap: asphalt, bumpScale: .065, roughness: .98 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: '#d4cbb7', roughness: 1 }),
    sand: new THREE.MeshStandardMaterial({ map: sand, bumpMap: sand, bumpScale: .025, roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ color: '#a1ad91', map: tiledTexture('grass', 48, 72), normalMap: tiledTexture('grassNormal', 48, 72), normalScale: new THREE.Vector2(.32, .32), roughness: 1 }),
    timber: new THREE.MeshStandardMaterial({ color: '#a99b79', map: tiledTexture('wood', 3, 1), bumpMap: tiledTexture('woodBump', 3, 1), bumpScale: .035, roughness: .86 }),
    greenWood: new THREE.MeshStandardMaterial({ color: '#5d8e78', map: tiledTexture('wood', 2, 2), bumpMap: tiledTexture('woodBump', 2, 2), bumpScale: .045, roughness: .8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#506f77', roughness: .17, metalness: .3, clearcoat: .8 }),
    stucco: new THREE.MeshStandardMaterial({ color: '#e4e2d2', roughness: .9, bumpMap: sand, bumpScale: .025 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#487f55', roughness: 0.8, side: THREE.DoubleSide }),
    trunk: new THREE.MeshStandardMaterial({ color: '#9c8b6c', roughness: 1 }),
    white: new THREE.MeshStandardMaterial({ color: '#eee7cb', roughness: 0.7 }),
    yellow: new THREE.MeshStandardMaterial({ color: '#d9ba6e', roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: '#283c40', roughness: 0.75 }),
    rail: new THREE.MeshStandardMaterial({ color: '#acb9b5', metalness: 0.6, roughness: 0.4 }),
    coral: new THREE.MeshStandardMaterial({ color: '#d48c7a', roughness: 0.9 }),
    aqua: new THREE.MeshStandardMaterial({ color: '#75c5c1', roughness: 0.8 }),
    buildings, modern,
  };
}
