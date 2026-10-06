import * as THREE from 'three';
import { SCENES } from '../config.js';

export class GameCamera {
  constructor(camera) { this.camera = camera; this.mode = 'chase'; this.target = new THREE.Vector3(); this.ready = false; this.heading = Math.PI; this.sceneIndex=0;this.previewTarget=new THREE.Vector3(); }
  update(dt, position, heading, driving, menu, time) {
    const offset = new THREE.Vector3(), look = position.clone();
    if (menu) {
      const scene=SCENES[this.sceneIndex];look.fromArray(scene.target);offset.fromArray(scene.camera);offset.x+=Math.sin(time*.025)*(this.sceneIndex===0?7:.6);
      this.previewTarget.copy(look);this.previewUnderwater=!!scene.underwater;
    } else {
      const difference = Math.atan2(Math.sin(heading - this.heading), Math.cos(heading - this.heading)); this.heading += difference * Math.min(1, dt * 5);
      if (this.mode === 'hood' && driving) { offset.set(0, 1.26, 1.75); look.add(new THREE.Vector3(Math.sin(heading) * 30, 1.1, Math.cos(heading) * 30)); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), heading); }
      else if (this.mode === 'orbit') { offset.set(Math.sin(time * .13) * 14, 6.5, Math.cos(time * .13) * 14); look.y += 1; }
      else {
        offset.set(Math.sin(this.heading) * (driving ? -9 : -5.3), driving ? 3.7 : 2.8, Math.cos(this.heading) * (driving ? -9 : -5.3));
        look.add(new THREE.Vector3(Math.sin(this.heading) * (driving ? 7 : 3), 1.0, Math.cos(this.heading) * (driving ? 7 : 3)));
      }
    }
    const desired = menu ? offset : position.clone().add(offset);
    if (!this.ready || this.mode === 'hood' && !menu) { this.camera.position.copy(desired); this.target.copy(look); this.ready = true; }
    else { this.camera.position.lerp(desired, 1 - Math.exp(-dt * (menu ? 1.5 : 6))); this.target.lerp(look, 1 - Math.exp(-dt * 7)); }
    if(!this.previewUnderwater||!menu) this.camera.position.y = Math.max(this.camera.position.y,position.y<-.5?position.y+.6:.65);
    this.camera.lookAt(this.target);
  }
}
