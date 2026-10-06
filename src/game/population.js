import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { WORLD } from '../config.js';
import { seededRandom } from './math.js';
import { createVehicle } from '../world/vehicle-model.js';
import { createCharacter } from '../world/character-model.js';
import { createDetailedCharacter } from '../world/detailed-character.js';
import { createDetailedVehicle } from '../world/detailed-vehicle.js';
import { bridgeHeight } from '../world/exterior.js';

export class Population {
  constructor(scene, physics) {
    this.scene = scene; this.physics = physics; this.cars = []; this.people = []; this.enabled = true;
    const r = seededRandom(12687), colors = ['#afc2be', '#e0d1b7', '#8b9da8', '#c38873', '#53676c', '#b5b090'];
    for (let i = 0; i < 28; i++) {
      const x = -960 + Math.floor(r() * 8) * 160, z = -1280 + Math.floor(r() * 15) * 160;
      const overseas=i>=2&&i<6;
      const points = overseas ? [new THREE.Vector3(604,.8,1540),new THREE.Vector3(604,.8,3330),new THREE.Vector3(616,.8,3330),new THREE.Vector3(616,.8,1540)] : [new THREE.Vector3(x + 6, .8, z + 6), new THREE.Vector3(x + 6, .8, z + 326), new THREE.Vector3(x + 326, .8, z + 326), new THREE.Vector3(x + 326, .8, z + 6)];
      const police = i < 2;
      const model = createVehicle(police ? '#e0e4dd' : colors[i % colors.length], police);
      model.wheels.forEach(w => model.group.add(w)); scene.add(model.group);
      const lowParts=[...model.group.children];const detail=police?null:createDetailedVehicle(colors[i%colors.length]);
      if(detail){detail.wheels.forEach(w=>detail.group.add(w));detail.group.position.y=-.14;detail.group.visible=false;model.group.add(detail.group);}
      const body = new CANNON.Body({ type: CANNON.Body.KINEMATIC, mass: 0, shape: new CANNON.Box(new CANNON.Vec3(1, .5, 2.3)) });
      body.userData = { kind: police ? 'police' : 'traffic' };
      body.position.set(points[0].x, .78, points[0].z); physics.world.addBody(body);
      this.cars.push({ model, body, points, segment: i % 4, distance: r() * (overseas?1200:200), speed: overseas?15:8+r()*6, police, angle: 0, detail, lowParts, overseas });
    }
    // Place a lively population in the starting neighborhood; additional locals in every district.
    for (let i = 0; i < 90; i++) {
      const near = i < 32;
      const overseas=i>=72;
      const x = overseas ? 632 + r()*24 : near ? (i % 2 === 0 ? 496.7 : 463.3) : -960 + Math.floor(r() * 11) * 160 + 16.5;
      const z = overseas ? 2620 + r()*130 : near ? -260 + r() * 590 : -1280 + r() * 2560;
      const model = createDetailedCharacter(i) || createCharacter(i); scene.add(model);
      this.people.push({ model, x, z, origin: z, direction: r() > .5 ? 1 : -1, speed: .75 + r() * .7, phase: r() * 6 });
    }
  }
  update(dt, time, focus, wanted = 0) {
    for (const car of this.cars) {
      car.model.group.visible = this.enabled && car.body.position.distanceTo(new CANNON.Vec3(focus.x, .8, focus.z)) < 420;
      if (!this.enabled) { car.body.collisionResponse = false; car.body.velocity.setZero(); continue; }
      car.body.collisionResponse = true;
      let a = car.points[car.segment], b = car.points[(car.segment + 1) % 4];
      const length = a.distanceTo(b), dir = b.clone().sub(a).normalize();
      const current = a.clone().addScaledVector(dir, car.distance);
      const toPlayer = new THREE.Vector3(focus.x - current.x, 0, focus.z - current.z);
      const inFront = toPlayer.dot(dir) > 0 && toPlayer.dot(dir) < 18 && Math.abs(toPlayer.x * dir.z - toPlayer.z * dir.x) < 3;
      const intersection = car.distance > length - 14;
      const red = intersection && (Math.floor(time / 9) + car.segment) % 2 === 0;
      const moving = !inFront && !red;
      car.distance += (moving ? car.speed : 0) * dt;
      if (car.distance >= length) { car.distance -= length; car.segment = (car.segment + 1) % 4; a = car.points[car.segment]; b = car.points[(car.segment + 1) % 4]; }
      const d = b.clone().sub(a).normalize(); const p = a.clone().addScaledVector(d, car.distance);
      car.angle = Math.atan2(d.x, d.z);
      car.body.position.set(p.x, (car.overseas?bridgeHeight(p.z):0)+.78, p.z); car.body.quaternion.setFromEuler(0, car.angle, 0);
      car.body.velocity.set(d.x * (moving ? car.speed : 0), 0, d.z * (moving ? car.speed : 0));
      car.body.aabbNeedsUpdate = true;
      car.model.group.position.copy(car.body.position); car.model.group.quaternion.copy(car.body.quaternion);
      if(car.detail){const near=car.body.position.distanceTo(new CANNON.Vec3(focus.x,.8,focus.z))<85;car.detail.group.visible=near;car.lowParts.forEach(p=>p.visible=!near);car.detail.wheels.forEach(w=>w.rotation.x+=(moving?car.speed:0)*dt/.42);}
      car.model.wheels.forEach(w => { w.rotation.x += (moving ? car.speed : 0) * dt / .42; });
      if (car.police) car.model.group.userData.sirens.forEach((s, i) => s.material.emissiveIntensity = wanted > 0 ? (Math.sin(time * 14 + i * Math.PI) > 0 ? 6 : .2) : .15);
    }
    for (const person of this.people) {
      person.z += person.direction * person.speed * dt;
      if (Math.abs(person.z - person.origin) > 58) person.direction *= -1;
      const distance = Math.hypot(person.x - focus.x, person.z - focus.z);
      person.model.visible = distance < 155;
      if (!person.model.visible) continue;
      const flee = distance < 5 && Math.abs(this.physics.speed) > 4;
      person.model.position.set(person.x + (flee ? (person.x > focus.x ? 2 : -2) : 0), .06, person.z);
      person.model.rotation.y = person.direction > 0 ? 0 : Math.PI;
      person.model.userData.animate(time + person.phase, flee ? 4 : person.speed);
    }
  }
}
