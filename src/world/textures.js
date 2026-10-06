import * as THREE from 'three';

export const textures = {};
export async function loadSurfaceTextures() {
  const loader = new THREE.TextureLoader();
  await Promise.all(Object.entries({ grass: ['grass.jpg', true], grassNormal: ['grass-normal.jpg', false], wood: ['wood.jpg', true], woodBump: ['wood-bump.jpg', false], waterNormal: ['water-normal.jpg', false] }).map(async ([key, [file, color]]) => {
    const map = await loader.loadAsync('/textures/' + file);
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8;
    if (color) map.colorSpace = THREE.SRGBColorSpace;
    textures[key] = map;
  }));
}
export function tiledTexture(key, x = 1, y = 1) { const t = textures[key]?.clone(); if (t) { t.repeat.set(x, y); t.needsUpdate = true; } return t; }
