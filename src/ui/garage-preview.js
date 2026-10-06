import * as THREE from 'three';
import { createVehicle } from '../world/vehicle-model.js';
import { createDetailedVehicle } from '../world/detailed-vehicle.js';

export class GaragePreview {
  constructor(canvas, color) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); this.renderer.setClearColor('#10282f', 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.5;
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    this.camera.position.set(5.8, 3.4, 7.4); this.camera.lookAt(0, .5, 0);
    this.scene.add(new THREE.HemisphereLight('#d3e6ea', '#c7a589', 3));
    const key = new THREE.DirectionalLight('#ffe6c0', 4); key.position.set(-5, 6, 4); this.scene.add(key);
    this.car = createDetailedVehicle(color) || createVehicle(color); this.car.wheels.forEach(w => this.car.group.add(w)); this.car.group.position.y = .8; this.scene.add(this.car.group);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshStandardMaterial({ color: '#304548', roughness: .8 })); floor.rotation.x = -Math.PI / 2; floor.position.y = .01; this.scene.add(floor);
  }
  update(dt) {
    const r = this.canvas.getBoundingClientRect(); if (!r.width) return;
    this.renderer.setSize(r.width, r.height, false); this.camera.aspect = r.width / r.height; this.camera.updateProjectionMatrix();
    this.car.group.rotation.y += dt * .23; this.renderer.render(this.scene, this.camera);
  }
  dispose() { this.scene.traverse(o => { if (!this.car.detailed) o.geometry?.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); }); this.renderer.dispose(); }
}
