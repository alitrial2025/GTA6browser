import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CampaignProgress, parseProgress, freshProgress } from '../src/campaign/progress.js';
import { MISSIONS, GAME_DISTRICTS } from '../src/campaign/districts.js';
import { MarinePhysics } from '../src/campaign/marine.js';

test('all 15 missions finish through their ordered checkpoints and reward once',()=>{
  const campaign=new CampaignProgress();let total=1500;
  for(const m of MISSIONS){campaign.start(m.id);m.route.forEach(([x,z])=>campaign.update(1,{x,z}));assert.equal(campaign.lastOutcome.status,'completed');total+=m.reward;}
  assert.equal(campaign.completed,15);assert.equal(campaign.progress.cash,total);assert.equal(campaign.progress.xp,7500);
  const m=MISSIONS[0];campaign.start(m.id);m.route.forEach(([x,z])=>campaign.update(.5,{x,z}));assert.equal(campaign.lastOutcome.reward,0);assert.equal(campaign.progress.cash,total);assert.equal(campaign.progress.completed[m.id],1.5);
});
test('an out-of-order gate cannot skip campaign checkpoints',()=>{
  const c=new CampaignProgress();c.start(MISSIONS[1].id);const end=MISSIONS[1].route.at(-1);c.update(1,{x:end[0],z:end[1]});assert.equal(c.run.checkpoint,0);assert.equal(c.completed,0);
});
test('mission timeout gives no money and stops the run',()=>{
  const c=new CampaignProgress();c.start(MISSIONS[2].id);const outcome=c.update(146,{x:999,z:999});assert.equal(outcome.status,'failed');assert.equal(c.run,null);assert.equal(c.progress.cash,1500);
});
test('stashes reward once and purchases preserve the cash balance',()=>{
  const c=new CampaignProgress();assert.equal(c.collect(0,0),true);assert.equal(c.collect(0,0),false);assert.equal(c.progress.cash,1900);assert.equal(c.upgrade(),false);c.collect(0,1);assert.equal(c.upgrade(),true);assert.equal(c.progress.cash,300);assert.equal(c.progress.upgrade,1);
});
test('saved campaign restores valid results and discards malformed fields',()=>{
  const p=freshProgress();p.completed[MISSIONS[0].id]=31;p.pickups=['0:1'];p.color='#ba5545';p.upgrade=2;p.district=3;
  assert.deepEqual(parseProgress(JSON.stringify(p)),p);assert.deepEqual(parseProgress('{broken'),freshProgress());
  const bad=parseProgress(JSON.stringify({version:1,cash:-100,color:'bad',district:999,upgrade:99,completed:{bad:20},pickups:['bad','0:1','0:1']}));assert.equal(bad.cash,0);assert.equal(bad.district,0);assert.equal(bad.upgrade,3);assert.deepEqual(bad.completed,{});assert.deepEqual(bad.pickups,['0:1']);
});
test('all mission gates lie inside the playable district boundaries',()=>{
  for(const m of MISSIONS){const d=GAME_DISTRICTS[m.district],[a,b,c,e]=d.bounds;for(const [x,z]of m.route){assert.ok(x>=a&&x<=b&&z>=c&&z<=e,m.id);if(d.ellipse){const [cx,cz,rx,rz]=d.ellipse;assert.ok(((x-cx)/rx)**2+((z-cz)/rz)**2<=1,m.id);}}}
});
test('boat acceleration, drag, steering and recovery change motion',()=>{
  const group=new THREE.Group(),boat=new MarinePhysics(group);boat.reset({x:0,z:0,heading:0});
  for(let i=0;i<120;i++)boat.update(1/60,{throttle:1,steer:0,handbrake:false},true);
  assert.ok(boat.position.z>10&&boat.speed>10);const speed=boat.speed;
  for(let i=0;i<120;i++)boat.update(1/60,{throttle:0,steer:1,handbrake:false},true);
  assert.ok(boat.speed<speed&&boat.heading>1&&boat.position.x>5);boat.reset({x:20,z:30,heading:1});assert.equal(boat.speed,0);assert.equal(group.position.x,20);assert.equal(group.position.z,30);
});
