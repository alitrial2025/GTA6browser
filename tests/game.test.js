import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Missions } from '../src/game/missions.js';
import { DISTRICTS, ROUTES } from '../src/config.js';
import { seededRandom, districtAt } from '../src/game/math.js';
import { isLand, terrainHeight } from '../src/world/exterior.js';

test('chapter awards its reward once, advances, and preserves progress', () => {
  const m = new Missions(new THREE.Scene()); m.start(5);
  assert.equal(m.update(10, new THREE.Vector3(480, 1, 0)), null);
  const result = m.update(35, new THREE.Vector3(m.route.x, 1, m.route.z));
  assert.equal(result.route.id, 'coast'); assert.equal(result.duration, 30); assert.equal(m.cash, 2450); assert.equal(m.completed, 1);
  assert.equal(m.active, false); assert.equal(m.marker.visible, false);
  assert.equal(m.update(36, new THREE.Vector3(480, 1, -1120)), null); assert.equal(m.cash, 2450);
  const restored = new Missions(new THREE.Scene(), m.save()); assert.equal(restored.route.id, 'downtown'); assert.equal(restored.cash, 2450);
});
test('chapter sequence cycles through all four routes', () => {
  const m = new Missions(new THREE.Scene());
  for (let i = 0; i < 5; i++) { assert.equal(m.route.id, ROUTES[i % ROUTES.length].id); m.start(i); m.update(i + .5, new THREE.Vector3(m.route.x, 1, m.route.z)); }
  assert.equal(m.completed, 5);
});
test('all fast travel districts and mission targets are on traversable land', () => {
  for (const p of [...DISTRICTS, ...ROUTES]) assert.equal(isLand(p.x, p.z), true, p.name || p.title);
  assert.equal(isLand(950, 2100), false, 'open ocean'); assert.equal(isLand(610, 2290), true, 'bridge');
  assert.equal(isLand(-1800, 640), true, 'country road'); assert.equal(isLand(610, 5000), false, 'world boundary');
});
test('terrain transitions continuously from city to wooded hills', () => {
  assert.equal(terrainHeight(-1120, -640), 0); assert.equal(terrainHeight(-1240, -640), 0);
  assert.ok(terrainHeight(-1800, -640) > 0); assert.equal(terrainHeight(-1800, 640), 0);
});
test('district lookup follows the player into the Keys and wetlands', () => {
  assert.equal(districtAt(610, 2900, DISTRICTS).name, 'The Keys');
  assert.equal(districtAt(-1900, 700, DISTRICTS).name, 'Grassrivers');
});
test('procedural generation has a reproducible seed', () => {
  const a = seededRandom(6), b = seededRandom(6), c = seededRandom(7);
  const sequence = Array.from({ length: 50 }, () => a());
  assert.deepEqual(sequence, Array.from({ length: 50 }, () => b()));
  assert.notDeepEqual(sequence, Array.from({ length: 50 }, () => c()));
  assert.ok(sequence.every(x => x >= 0 && x < 1));
});
