import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { WORLD } from '../config.js';
import { clamp } from './math.js';

export class VehiclePhysics {
  constructor(city, model, spec) {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0) });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world); this.world.solver.iterations = 8;
    this.world.defaultContactMaterial.friction = .35;
    this.world.defaultContactMaterial.restitution = .05;
    const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0); ground.aabbNeedsUpdate = true;
    ground.userData = { kind: 'ground' }; this.world.addBody(ground);
    for (const c of city.colliders) {
      const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(c.w / 2, c.h / 2, c.d / 2)), position: new CANNON.Vec3(c.x, c.y, c.z) });
      if(c.rx||c.ry){body.quaternion.setFromEuler(c.rx||0,c.ry||0,0);body.aabbNeedsUpdate=true;}
      body.userData = { kind: 'building' }; this.world.addBody(body);
    }
    if (city.heightfield) {
      const h = city.heightfield, shape = new CANNON.Heightfield(h.heights, { elementSize: h.elementSize });
      const terrain = new CANNON.Body({ mass: 0, shape, position: new CANNON.Vec3(h.x, 0, h.z) });
      terrain.quaternion.setFromEuler(-Math.PI / 2, 0, 0); terrain.aabbNeedsUpdate = true; terrain.userData = { kind: 'ground' }; this.world.addBody(terrain);
    }
    this.body = new CANNON.Body({ mass: spec.mass, angularDamping: .45, linearDamping: .06 });
    this.body.addShape(new CANNON.Box(new CANNON.Vec3(.94, .32, 2.2)), new CANNON.Vec3(0, .04, 0));
    this.body.userData = { kind: 'player' };
    this.vehicle = new CANNON.RaycastVehicle({ chassisBody: this.body, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2 });
    const wheelOptions = {
      radius: .42, directionLocal: new CANNON.Vec3(0, -1, 0), axleLocal: new CANNON.Vec3(-1, 0, 0),
      suspensionStiffness: 36, suspensionRestLength: .34, frictionSlip: 3.2, dampingRelaxation: 2.3,
      dampingCompression: 4.4, maxSuspensionForce: 100000, rollInfluence: .035, maxSuspensionTravel: .26,
      customSlidingRotationalSpeed: -30, useCustomSlidingRotationalSpeed: true,
    };
    for (let i = 0; i < 4; i++) this.vehicle.addWheel({ ...wheelOptions, chassisConnectionPointLocal: new CANNON.Vec3(i % 2 === 0 ? -.96 : .96, .05, i < 2 ? 1.45 : -1.43) });
    this.vehicle.addToWorld(this.world);
    this.model = model; this.spec = spec; this.steering = 0; this.speed = 0; this.lastCollision = -10; this.clock = 0;
    this.forward = new CANNON.Vec3(); this.up = new CANNON.Vec3();
    this.reset();
    this.body.addEventListener('collide', e => {
      const impact = Math.abs(e.contact.getImpactVelocityAlongNormal());
      if (impact > 3 && this.clock - this.lastCollision > .6 && e.body.userData?.kind !== 'ground') {
        this.lastCollision = this.clock; this.onCollision?.(impact, e.body.userData?.kind);
      }
    });
  }
  reset(position = WORLD.spawn) {
    this.body.position.set(position.x, position.y ?? 1.1, position.z);
    this.body.quaternion.setFromEuler(0, position.heading ?? WORLD.spawn.heading, 0);
    this.body.velocity.setZero(); this.body.angularVelocity.setZero(); this.body.force.setZero(); this.body.torque.setZero();
    this.body.aabbNeedsUpdate = true;
    this.steering = 0; this.speed = 0; this.body.quaternion.vmult(new CANNON.Vec3(0,0,1),this.forward);
    this.vehicle.wheelInfos.forEach(w => { w.rotation = 0; w.deltaRotation = 0; });
    this.sync();
  }
  setSpec(spec) { this.spec = spec; this.body.mass = spec.mass; this.body.updateMassProperties(); }
  update(dt, input, occupied) {
    this.clock += dt; this.body.quaternion.vmult(new CANNON.Vec3(0, 0, 1), this.forward);
    this.speed = this.body.velocity.dot(this.forward);
    const throttle = occupied ? clamp(input.throttle, -1, 1) : 0;
    const braking = throttle < 0 && this.speed > 1 || throttle > 0 && this.speed < -1;
    const speedFactor = Math.max(.38, 1 - Math.abs(this.speed) / 90);
    this.steering += ((occupied ? input.steer * .48 * speedFactor * this.spec.handling : 0) - this.steering) * Math.min(1, dt * 7);
    const engine = braking || Math.abs(this.speed) > this.spec.topSpeed ? 0 : -throttle * this.spec.power * (throttle < 0 ? .45 : 1);
    for (let i = 0; i < 4; i++) {
      this.vehicle.setSteeringValue(i < 2 ? this.steering : 0, i);
      this.vehicle.applyEngineForce(i >= 2 ? engine : 0, i);
      this.vehicle.setBrake(!occupied ? 60 : braking ? 100 : input.handbrake && i >= 2 ? 100 : throttle === 0 ? 1.5 : 0, i);
      this.vehicle.wheelInfos[i].frictionSlip = input.handbrake && occupied && i >= 2 ? 1.0 : 3.2;
    }
    // Aerodynamic drag grows with speed; grounded suspension supplies stability.
    const drag = this.body.velocity.scale(-Math.abs(this.speed) * .33);
    this.body.applyForce(drag);
    this.world.step(1 / 60, Math.min(dt, .1), 8); this.sync();
  }
  sync() {
    this.model.group.position.copy(this.body.position); this.model.group.quaternion.copy(this.body.quaternion);
    for (let i = 0; i < 4; i++) {
      this.vehicle.updateWheelTransform(i);
      const t = this.vehicle.wheelInfos[i].worldTransform;
      this.model.wheels[i].position.copy(t.position); this.model.wheels[i].quaternion.copy(t.quaternion);
    }
    this.model.brakeLights.material.emissiveIntensity = this.vehicle.wheelInfos[2].brake > 5 ? 2.7 : .4;
  }
  get heading() { return Math.atan2(this.forward.x, this.forward.z); }
  get overturned() { this.body.quaternion.vmult(new CANNON.Vec3(0, 1, 0), this.up); return this.up.y < .35; }
}

export function walkAgainstBuildings(position, moveX, moveZ, colliders, radius = .4) {
  const next = new THREE.Vector3(position.x + moveX, position.y, position.z + moveZ);
  for (const c of colliders) {
    if (c.y + c.h / 2 < .5) continue;
    const minX = c.x - c.w / 2 - radius, maxX = c.x + c.w / 2 + radius;
    const minZ = c.z - c.d / 2 - radius, maxZ = c.z + c.d / 2 + radius;
    if (next.x > minX && next.x < maxX && next.z > minZ && next.z < maxZ) {
      if (position.x <= minX || position.x >= maxX) next.x = position.x;
      else if (position.z <= minZ || position.z >= maxZ) next.z = position.z;
      else { const sides = [Math.abs(next.x - minX), Math.abs(next.x - maxX), Math.abs(next.z - minZ), Math.abs(next.z - maxZ)];
        const side = sides.indexOf(Math.min(...sides)); if (side < 2) next.x = side === 0 ? minX : maxX; else next.z = side === 2 ? minZ : maxZ;
      }
    }
  }
  next.x = clamp(next.x, WORLD.terrainMinX + 5, 1700); next.z = clamp(next.z, WORLD.minZ - 40, WORLD.exploreMaxZ - 5);
  return next;
}
