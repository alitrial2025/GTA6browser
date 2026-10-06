import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

let template;
export async function loadDetailedVehicle() {
  const gltf = await new GLTFLoader().loadAsync('/models/car-concept.glb');
  gltf.scene.updateMatrixWorld(true);
  const wheels = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'];
  const groups = Array.from({ length: 5 }, () => new Map());
  const centers = wheels.map(name => gltf.scene.getObjectByName(name).getWorldPosition(new THREE.Vector3()));
  const offset = new THREE.Matrix4().makeTranslation(0, -.56, -.22);
  gltf.scene.traverse(node => {
    if (!node.isMesh) return;
    if (node.name.startsWith('Interior') || node.name === 'Engine' || node.name === 'Axles') return;
    let root = node, slot = 0;
    while (root) { const index = wheels.indexOf(root.name); if (index >= 0) { slot = index + 1; break; } root = root.parent; }
    const material = node.material;
    // Transparent transmission buffers are unnecessary for tinted game windows.
    if (material.transmission) { material.transmission = 0; material.color.set('#66808a'); material.roughness = .15; }
    const geometry = node.geometry.clone();
    geometry.deleteAttribute('tangent'); geometry.deleteAttribute('color'); geometry.deleteAttribute('uv1');
    if (!geometry.attributes.uv) geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
    const transform = slot === 0 ? offset.clone().multiply(node.matrixWorld) : new THREE.Matrix4().makeTranslation(-centers[slot - 1].x, -centers[slot - 1].y, -centers[slot - 1].z).multiply(node.matrixWorld);
    geometry.applyMatrix4(transform);
    if (!groups[slot].has(material.uuid)) groups[slot].set(material.uuid, { material, geometries: [] });
    groups[slot].get(material.uuid).geometries.push(geometry);
  });
  template = groups.map(map => [...map.values()].map(({ material, geometries }) => {
    const geometry = mergeGeometries(geometries); geometries.forEach(g => g.dispose());
    return { geometry, material };
  }));
  return createDetailedVehicle;
}

export function createDetailedVehicle(color) {
  if (!template) return null;
  const group = new THREE.Group(), wheels = [], paints = [], brakes = [];
  const materials = new Map();
  template.forEach((parts, index) => {
    const root = index === 0 ? group : new THREE.Group();
    for (const part of parts) {
      if (!materials.has(part.material.uuid)) materials.set(part.material.uuid, part.material.clone());
      const material = materials.get(part.material.uuid);
      if (material.name.startsWith('Paint 1')) { material.color.set(color); material.metalness = .65; material.roughness = .22; paints.push(material); }
      if (material.name === 'Brakelight') { material.emissiveIntensity = .6; brakes.push(material); }
      const mesh = new THREE.Mesh(part.geometry, material); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
    }
    if (index > 0) { root.position.set(index % 2 === 1 ? -.99 : .99, -.2, index < 3 ? 1.45 : -1.43); wheels.push(root); }
  });
  const paint = paints[0], brakeLights = { material: brakes[0] };
  // GLB paint panels share one cloned material, so a color change updates every panel.
  return { group, wheels, paint, brakeLights, detailed: true };
}
