import * as THREE from 'three';
import { ROUTES } from '../config.js';
import { routeDistance } from './math.js';

export class Missions {
  constructor(scene, saved = {}) {
    this.routeIndex = saved.routeIndex ?? 0; this.cash = saved.cash ?? 1250; this.completed = saved.completed ?? 0;
    this.active = false; this.startTime = 0;
    this.marker = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: '#f2ba91', transparent: true, opacity: .7, depthWrite: false });
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(9, .14, 8, 64), material); this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = .15; this.marker.add(this.ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 55, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#f5c3a0', transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 27.5; this.marker.add(beam);
    this.arrow = new THREE.Mesh(new THREE.OctahedronGeometry(1.2), new THREE.MeshStandardMaterial({ color: '#ffe2b8', emissive: '#e0a078', emissiveIntensity: 1 })); this.arrow.position.y = 5; this.marker.add(this.arrow);
    scene.add(this.marker); this.marker.visible = false;
  }
  get route() { return ROUTES[this.routeIndex % ROUTES.length]; }
  start(time) { this.active = true; this.startTime = time; this.marker.position.set(this.route.x, 0, this.route.z); this.marker.visible = true; }
  update(time, position) {
    if (!this.active) return null;
    this.arrow.rotation.y = time; this.arrow.position.y = 5 + Math.sin(time * 2) * .4;
    this.ring.scale.setScalar(1 + Math.sin(time * 2) * .025);
    if (routeDistance(position, this.route) < 13) {
      const route = this.route; this.cash += route.reward; this.completed++; this.routeIndex++; this.active = false; this.marker.visible = false;
      return { route, duration: time - this.startTime };
    }
    return null;
  }
  save() { return { cash: this.cash, completed: this.completed, routeIndex: this.routeIndex }; }
}
