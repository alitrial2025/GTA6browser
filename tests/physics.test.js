import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { VehiclePhysics, walkAgainstBuildings } from '../src/game/physics.js';
import { VEHICLE_SPECS } from '../src/config.js';

function car(colliders = []) {
  const model = { group: new THREE.Group(), wheels: Array.from({ length: 4 }, () => new THREE.Group()), brakeLights: { material: {} } };
  return new VehiclePhysics({ colliders }, model, VEHICLE_SPECS[0]);
}
function simulate(physics, seconds, throttle = 0, steer = 0, handbrake = false) {
  for (let i = 0; i < seconds * 60; i++) physics.update(1 / 60, { throttle, steer, handbrake }, true);
}

test('raycast suspension supports the chassis above the road', () => {
  const p = car(); simulate(p, 3);
  assert.ok(p.body.position.y > .5 && p.body.position.y < .8, 'chassis rests on suspension rather than scraping the road');
  assert.ok(p.vehicle.wheelInfos.every(w => w.suspensionForce > 1000));
  assert.ok(Math.abs(p.speed) < .05);
});
test('acceleration, braking and reverse change physical motion', () => {
  const p = car(); simulate(p, 2); const z = p.body.position.z;
  simulate(p, 4, 1); const speed = p.speed;
  assert.ok(speed > 15, 'accelerates in forward gear'); assert.ok(p.body.position.z < z - 30);
  simulate(p, 1, -1); assert.ok(Math.abs(p.speed) < speed * .4, 'reverse pedal initially brakes');
  simulate(p, 4, -1); assert.ok(p.speed < -3, 'then engages reverse');
});
test('steering turns the moving vehicle', () => {
  const p = car(); simulate(p, 2); simulate(p, 2, 1); const x = p.body.position.x;
  simulate(p, 2, 1, .7); assert.ok(Math.abs(p.body.position.x - x) > 2);
  assert.ok(Math.abs(p.body.angularVelocity.y) > .05);
});
test('a static wall blocks the vehicle and produces a collision', () => {
  const p = car([{ x: 480, y: 3, z: 45, w: 12, h: 6, d: 2 }]); let impacts = 0;
  p.onCollision = () => impacts++;
  simulate(p, 2); simulate(p, 6, 1);
  assert.ok(p.body.position.z > 47, 'car cannot pass through the wall'); assert.ok(impacts > 0);
});
test('recovery clears motion and updates collision bounds after teleport', () => {
  const p = car(); simulate(p, 2); simulate(p, 3, 1);
  p.reset({ x: -160, z: -320, y: 1.2, heading: 0 }); simulate(p, 2);
  assert.ok(Math.abs(p.body.position.x + 160) < .01); assert.ok(Math.abs(p.body.position.z + 320) < .01);
  assert.ok(p.body.position.y > .5); assert.ok(p.body.velocity.length() < .05);
});
test('walking collision preserves sliding along a building wall', () => {
  const p = new THREE.Vector3(-3, .06, 0), colliders = [{ x: 0, y: 3, z: 0, w: 4, h: 6, d: 4 }];
  const next = walkAgainstBuildings(p, 1, .4, colliders);
  assert.equal(next.x, p.x); assert.equal(next.z, .4);
});
