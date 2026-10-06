import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

let template;
export async function loadDetailedCharacter() {
  template = await new GLTFLoader().loadAsync('/models/cesium-man.glb');
  template.scene.updateMatrixWorld(true);
}
export function createDetailedCharacter(index = 0, player = false) {
  if (!template) return null;
  const group = new THREE.Group(), model = clone(template.scene);
  // Measure the animated skin, including its joint transforms, before normalizing.
  // The raw mesh positions are in bind space and underestimate standing height.
  const mixer = new THREE.AnimationMixer(model), action = mixer.clipAction(template.animations[0]); action.play(); mixer.setTime(0);
  model.updateMatrixWorld(true);
  model.traverse(o => { if (o.isSkinnedMesh) { o.skeleton.update(); o.computeBoundingBox(); } });
  const bounds = new THREE.Box3().setFromObject(model, true), scale = 1.78 / (bounds.max.y - bounds.min.y);
  const wrapper = new THREE.Group(); wrapper.scale.setScalar(scale); wrapper.position.y = -bounds.min.y * scale; wrapper.add(model);
  // The source's forward vector is +X; the game uses +Z.
  wrapper.rotation.y = -Math.PI / 2;
  const colors = ['#e5d1b2', '#86afaa', '#afc1d2', '#c9ae82', '#a89083'];
  model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material = o.material.clone(); o.material.color.set(player ? '#dfcdb5' : colors[index % colors.length]); o.material.roughness = .82; } });
  group.add(wrapper);
  group.userData.animate = (time, speed) => { mixer.setTime(speed > .1 ? time * Math.min(2.6, speed / 1.1) : 0); };
  group.userData.detailed = true;
  group.userData.height = 1.78;
  return group;
}
