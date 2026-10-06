import './game.css';
import * as THREE from 'three';
import { VehiclePhysics, walkAgainstBuildings } from '../game/physics.js';
import { Input } from '../game/input.js';
import { createDetailedVehicle } from '../world/detailed-vehicle.js';
import { createDetailedCharacter } from '../world/detailed-character.js';
import { createClassicCar } from '../scenes/classic-car.js';
import { SceneBuilder } from '../scenes/builder.js';
import { centerConsole } from '../scenes/harbor-party.js';
import { boat as patrolBoat } from '../scenes/water.js';
import { GAME_DISTRICTS, MISSIONS, SAVE_KEY } from './districts.js';
import { CampaignProgress, parseProgress } from './progress.js';
import { MarinePhysics } from './marine.js';
import { GameAudio } from './radio.js';
import { createGameUI, districtCards } from './ui.js';
import { drawMap } from './minimap.js';

const el=id=>document.getElementById(id),money=n=>'$'+Math.round(n).toLocaleString(),formatTime=n=>Math.floor(Math.max(0,n)/60)+':'+String(Math.floor(Math.max(0,n)%60)).padStart(2,'0');
const spec={mass:1200,power:4600,topSpeed:52,handling:1};
const gold=new THREE.MeshBasicMaterial({color:'#efc079'}),cyan=new THREE.MeshBasicMaterial({color:'#86e4dd'});
export class DistrictGame{
  constructor(studio){
    this.studio=studio;this.ui=createGameUI();document.body.classList.add('game-mode');this.input=new Input();this.audio=new GameAudio();
    let raw;try{raw=localStorage.getItem(SAVE_KEY);}catch{}this.campaign=new CampaignProgress(parseProgress(raw));const requested=GAME_DISTRICTS.findIndex(d=>d.id===new URLSearchParams(location.search).get('district'));if(requested>=0)this.campaign.progress.district=requested;
    this.started=false;this.paused=true;this.occupied=true;this.cameraMode=0;this.time=0;this.health=100;this.nitro=100;this.heat=0;this.style=0;this.hudTimer=0;this.saveTimer=0;this.jump=0;this.jumpVelocity=0;this.cameraOffset=0;
    this.model=createDetailedVehicle(this.campaign.progress.color);this.avatar=createDetailedCharacter(0,true);this.avatar.visible=false;
    const boatRoot=new THREE.Group(),b=new SceneBuilder(boatRoot,studio.materials,989);centerConsole(b,0,0,0,false);b.flush();this.boat=boatRoot;this.marine=new MarinePhysics(boatRoot);
    this.patrols=[0,1].map(i=>{const mesh=createClassicCar(i?'#182d3a':'#ece9dc',false);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(1.1,.13,.25),new THREE.MeshStandardMaterial({color:'#343d43'}));bar.position.set(0,1.94,-.1);mesh.add(bar);
      const beacons=[0,1].map(k=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.47,.13,.24),new THREE.MeshStandardMaterial({color:k?'#408bff':'#fa5263',emissive:k?'#0b55ef':'#ed1623',emissiveIntensity:3}));m.position.set((k-.5)*.54,2.06,-.1);mesh.add(m);return m;});
      const marineBuilder=new SceneBuilder(new THREE.Group(),studio.materials,111+i);const boat=patrolBoat(marineBuilder,0,0,0,false);boat.visible=false;beacons.forEach(light=>boat.add(light.clone()));mesh.visible=false;return{mesh,boat,beacons,heading:0};});
    this.marker=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(5,.1,8,64),gold);ring.rotation.x=Math.PI/2;this.marker.add(ring);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,6,32,1,true),new THREE.MeshBasicMaterial({color:'#f0c988',transparent:true,opacity:.09,side:THREE.DoubleSide,depthWrite:false}));beam.position.y=3;this.marker.add(beam);
    const pointer=new THREE.Mesh(new THREE.ConeGeometry(.8,1.7,4),gold);pointer.position.y=4;pointer.rotation.z=Math.PI;this.marker.add(pointer);
    this.bind();if(this.campaign.completed)el('begin-game').firstChild.textContent='CONTINUE YOUR STORY ';
    el('game-quality').value=studio.quality;this.studio.game=this;
    window.__VICE_GAME__={snapshot:()=>({ready:true,started:this.started,paused:this.paused,district:this.district?.id||null,occupied:this.occupied,marine:!!this.district?.marine,position:this.position?.toArray(),vehiclePosition:this.vehiclePosition?.toArray(),speed:this.physics?.speed||0,health:this.health,nitro:this.nitro,heat:this.heat,cash:this.campaign.progress.cash,xp:this.campaign.progress.xp,completed:this.campaign.completed,pickups:this.campaign.progress.pickups.length,upgrade:this.campaign.progress.upgrade,color:this.campaign.progress.color,mission:this.campaign.run?{id:this.campaign.run.mission.id,checkpoint:this.campaign.run.checkpoint,elapsed:this.campaign.run.elapsed}:null,cameraMode:this.cameraMode,quality:studio.quality,colliders:this.colliders?.length||0})};
  }
  bind(){
    el('begin-game').onclick=()=>{this.audio.start();this.started=true;el('game-start').classList.add('hidden');el('game-hud').classList.remove('hidden');this.travel(this.campaign.progress.district);this.startMission(MISSIONS.find(m=>m.district===this.index&&!this.campaign.progress.completed[m.id])?.id||MISSIONS[this.index*3].id);};
    el('open-map').onclick=()=>this.menu('map');el('open-garage').onclick=()=>this.menu('garage');el('game-pause').onclick=()=>this.menu('pause');el('close-menu').onclick=()=>this.resume();
    el('game-camera').onclick=()=>this.changeCamera();el('touch-interact').onclick=()=>this.interact();el('recover-game').onclick=()=>{this.recover();this.resume();};
    el('photo-game').onclick=()=>{location.href='?studio=1&scene='+this.studio.active.code+'&quality='+this.studio.quality;};
    el('game-sound').onclick=()=>{this.audio.enabled=!this.audio.enabled;this.audio.update(0,0,false);el('game-sound').textContent=this.audio.enabled?'SOUND ON':'SOUND OFF';};
    el('game-quality').onchange=e=>{this.studio.setQuality(e.target.value);el('quality').value=e.target.value;};
    el('music-enabled').onchange=e=>this.audio.music=e.target.checked;
    window.addEventListener('keydown',e=>{
      if(!document.body.classList.contains('game-mode')||e.target.matches('input,select,textarea'))return;
      if(!this.started)return;
      const actions={KeyE:()=>this.interact(),KeyR:()=>this.recover(),KeyM:()=>this.paused?this.resume():this.menu('map'),KeyG:()=>this.menu('garage'),KeyC:()=>this.changeCamera(),KeyQ:()=>this.horn(),KeyP:()=>this.menu('pause'),Escape:()=>this.paused?this.resume():this.menu('pause')};
      if(actions[e.code]){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)actions[e.code]();return;}
      if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ShiftRight','KeyB','Digit1','Digit2','Digit3','Digit4','Digit5','KeyH','KeyF'].includes(e.code)){
        e.preventDefault();e.stopImmediatePropagation();if(!this.paused){if(!e.repeat)this.input.pressed.add(e.code);this.input.keys.add(e.code);}
      }
    },true);
    window.addEventListener('keyup',e=>this.input.keys.delete(e.code),true);window.addEventListener('blur',()=>{if(this.started&&!this.paused)this.menu('pause');});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.started&&!this.paused)this.menu('pause');});
    el('game-hud').querySelectorAll('[data-drive]').forEach(button=>{
      const change=on=>{const action=button.dataset.drive;if(action==='boost')this.touchBoost=on;else if(action==='forward'||action==='reverse')this.input.touch.throttle=on?(action==='forward'?1:-1):0;else this.input.touch.steer=on?(action==='left'?1:-1):0;};
      button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);change(true);};button.onpointerup=button.onpointercancel=()=>change(false);
    });
    const canvas=this.studio.renderer.domElement;let drag;
    canvas.addEventListener('pointerdown',e=>{if(this.started&&!this.paused){drag={x:e.clientX,id:e.pointerId};canvas.setPointerCapture(e.pointerId);}});
    canvas.addEventListener('pointermove',e=>{if(drag&&!this.paused){this.cameraOffset-=(e.clientX-drag.x)*.007;drag.x=e.clientX;}});
    canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
  }
  travel(index){
    this.index=index;this.district=GAME_DISTRICTS[index];this.campaign.progress.district=index;this.campaign.run=null;this.heat=0;this.health=100;this.nitro=100;this.cameraOffset=0;this.occupied=true;
    this.studio.select(this.district.scene);this.studio.controls.enabled=false;this.studio.motion=false;const root=this.studio.active.root;root.add(this.model.group,this.avatar,this.boat,this.marker,...this.patrols.flatMap(p=>[p.mesh,p.boat]));
    this.model.wheels.forEach(w=>root.add(w));this.model.group.visible=!this.district.marine;this.model.wheels.forEach(w=>w.visible=!this.district.marine);this.boat.visible=!!this.district.marine;this.avatar.visible=false;this.marker.visible=false;
    this.colliders=this.studio.active.builder.colliders.filter(c=>c.y-c.h/2<=this.district.base+.8&&c.y+c.h/2>this.district.base+.5);
    if(index===1)this.colliders.push({x:-48,y:40,z:18,w:73,h:80,d:54},{x:33,y:45,z:-24,w:69,h:90,d:53});
    if(this.district.marine){this.physics=this.marine;this.marine.reset(this.district.spawn);}
    else{
      this.physics=new VehiclePhysics({colliders:this.colliders},this.model,{...spec,power:spec.power*(1+this.campaign.progress.upgrade*.18)});
      const ground=this.physics.world.bodies.find(b=>b.userData?.kind==='ground');ground.position.y=this.district.base;ground.aabbNeedsUpdate=true;
      this.physics.reset({...this.district.spawn,y:this.district.base+1.1});this.physics.onCollision=(impact)=>this.collision(impact);
    }
    this.patrols.forEach((p,i)=>{p.mesh.position.set(this.district.spawn.x-Math.sin(this.district.spawn.heading)*(18+i*10),this.district.base,this.district.spawn.z-Math.cos(this.district.spawn.heading)*(18+i*10));p.heading=this.district.spawn.heading;p.mesh.visible=false;p.boat.visible=false;});
    this.setupPickups();this.followCamera(1,true);this.studio.renderer.shadowMap.needsUpdate=true;this.studio.dirty=true;this.save();this.updateHud();
  }
  setupPickups(){
    if(this.pickupRoot){this.pickupRoot.removeFromParent();this.pickupRoot.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(o.material!==cyan)o.material.dispose();}});}
    this.pickupRoot=new THREE.Group();this.studio.active.root.add(this.pickupRoot);
    this.pickups=this.district.pickups.map(([x,z],i)=>{const group=new THREE.Group(),gem=new THREE.Mesh(new THREE.OctahedronGeometry(.5),cyan);gem.position.y=1.2;group.add(gem);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,.045,6,32),cyan);ring.rotation.x=Math.PI/2;ring.position.y=.08;group.add(ring);group.position.set(x,this.district.base,z);group.visible=!this.campaign.progress.pickups.includes(this.index+':'+i);this.pickupRoot.add(group);return group;});
  }
  startMission(id){
    const mission=MISSIONS.find(m=>m.id===id);if(!mission)return;if(mission.district!==this.index)this.travel(mission.district);this.recover(false);this.campaign.start(id);this.heat=mission.kind==='escape'?2:0;this.slowEscape=0;this.resume();this.banner(mission.title,mission.kind==='race'?'BEAT THE CLOCK':mission.kind==='escape'?'LOSE THE PATROL':'FOLLOW THE GOLD MARKERS');this.refreshMarker();this.updateHud();
  }
  refreshMarker(){const target=this.campaign.target;this.marker.visible=!!target;if(target)this.marker.position.set(target[0],this.district.base+.12,target[1]);}
  get vehiclePosition(){return this.district?.marine?this.marine.position:new THREE.Vector3(this.physics?.body.position.x||0,this.physics?.body.position.y||0,this.physics?.body.position.z||0);}
  get position(){return this.occupied?this.vehiclePosition:this.avatar.position;}
  get heading(){return this.occupied?this.physics.heading:this.avatar.rotation.y;}
  interact(){
    if(!this.started||this.paused)return;
    if(this.occupied){if(Math.abs(this.physics.speed)>6){this.toast('Slow down before exiting.');return;}this.occupied=false;this.avatar.visible=true;const p=this.vehiclePosition,h=this.physics.heading;this.avatar.position.set(p.x+Math.cos(h)*2.3,this.district.marine?-.65:this.district.base,p.z-Math.sin(h)*2.3);this.avatar.rotation.y=h;this.input.clear();this.toast(this.district.marine?'In the water · E near the boat to board':'On foot · E near your car to enter');}
    else if(this.avatar.position.distanceTo(this.vehiclePosition)<7){this.occupied=true;this.avatar.visible=false;this.input.clear();this.toast(this.district.marine?'Boat ready':'Engine ready');}
    else this.toast('Get closer to your vehicle.');this.updateHud();this.studio.dirty=true;
  }
  recover(announce=true){if(!this.started)return;this.physics.reset({...this.district.spawn,y:this.district.base+1.1});this.health=100;this.nitro=100;this.occupied=true;this.avatar.visible=false;this.jump=this.jumpVelocity=0;this.input.clear();this.followCamera(1,true);if(announce)this.toast('Vehicle recovered.');this.studio.dirty=true;}
  collision(impact){if(this.time-(this.lastHit||-10)<.6)return;this.lastHit=this.time;this.health=Math.max(0,this.health-impact*1.7);this.audio.collision();if(impact>8)this.toast('Impact · -'+Math.round(impact*1.7)+' integrity');if(this.health<=0){this.campaign.run=null;this.heat=0;this.refreshMarker();this.banner('WRECKED','YOUR RIDE HAS BEEN RECOVERED');this.recover(false);}}
  constrain(){
    const p=this.position,[minX,maxX,minZ,maxZ]=this.district.bounds,oldX=p.x,oldZ=p.z;p.x=THREE.MathUtils.clamp(p.x,minX,maxX);p.z=THREE.MathUtils.clamp(p.z,minZ,maxZ);
    if(this.district.ellipse){const [x,z,rx,rz]=this.district.ellipse,q=((p.x-x)/rx)**2+((p.z-z)/rz)**2;if(q>1){const s=1/Math.sqrt(q);p.x=x+(p.x-x)*s;p.z=z+(p.z-z)*s;}}
    if(this.occupied&&!this.district.marine){if(Math.abs(oldX-p.x)+Math.abs(oldZ-p.z)>.01){this.physics.body.position.x=p.x;this.physics.body.position.z=p.z;this.physics.body.aabbNeedsUpdate=true;if(Math.abs(this.physics.speed)>8)this.collision(4);this.physics.body.velocity.x*=.3;this.physics.body.velocity.z*=.3;this.physics.sync();}}
    else if(this.occupied&&(oldX!==p.x||oldZ!==p.z)){this.marine.speed*=.3;this.marine.sync();}
  }
  update(dt){
    if(!this.started)return;if(this.paused){this.audio.update(0,0,false);return;}
    this.time+=dt;const boost=this.occupied&&(this.input.down('ShiftLeft','ShiftRight')||this.touchBoost)&&this.nitro>0&&this.input.throttle>0;
    if(boost){this.nitro=Math.max(0,this.nitro-dt*24);if(this.district.marine)this.marine.speed=Math.min(36,this.marine.speed+dt*13);else{const h=this.physics.heading;this.physics.body.velocity.x+=Math.sin(h)*dt*11;this.physics.body.velocity.z+=Math.cos(h)*dt*11;}}
    else this.nitro=Math.min(100,this.nitro+dt*8);
    if(this.district.marine)this.marine.topSpeed=boost?36:28;
    this.physics.update(dt,this.input,this.occupied);
    if(!this.occupied){
      const fw=this.input.throttle,side=-this.input.steer,speed=this.input.down('ShiftLeft','ShiftRight')?6:3.2,yaw=this.lastCameraHeading??this.physics.heading;
      const dx=(Math.sin(yaw)*fw+Math.cos(yaw)*side)*speed*dt,dz=(Math.cos(yaw)*fw-Math.sin(yaw)*side)*speed*dt;
      const next=walkAgainstBuildings(this.avatar.position,dx,dz,this.district.marine?[]:this.colliders,.38);this.avatar.position.x=next.x;this.avatar.position.z=next.z;
      if(dx||dz)this.avatar.rotation.y=Math.atan2(dx,dz);this.avatar.userData.animate(this.time,dx||dz?speed:0);
      if(!this.district.marine){if(this.input.take('Space')&&this.jump===0)this.jumpVelocity=4.5;this.jumpVelocity-=9.8*dt;this.jump=Math.max(0,this.jump+this.jumpVelocity*dt);if(this.jump===0)this.jumpVelocity=0;this.avatar.position.y=this.district.base+this.jump;}
    }
    this.constrain();if(this.physics.overturned)this.toast('Overturned · press R to recover');
    if(this.occupied&&this.input.handbrake&&Math.abs(this.physics.speed)>7&&Math.abs(this.input.steer)>.1)this.style+=Math.abs(this.physics.speed)*dt*5;
    this.updatePatrols(dt);
    const outcome=this.campaign.update(dt,this.position);if(outcome?.status==='checkpoint'){this.audio.checkpoint();this.refreshMarker();}
    if(outcome?.status==='completed'){this.heat=0;this.refreshMarker();this.audio.chime();this.save();this.banner(this.campaign.completed===15?'LEONIDA LEGEND':'MISSION COMPLETE',outcome.first?money(outcome.reward)+' · +500 XP':'PERSONAL BEST: '+formatTime(this.campaign.progress.completed[outcome.mission.id]));this.toast('M opens your next job. Free roam is active.');}
    if(outcome?.status==='failed'){this.heat=0;this.refreshMarker();this.banner('TIME EXPIRED','OPEN MAP TO RETRY THE JOB');}
    this.pickups.forEach((group,i)=>{if(!group.visible)return;group.children[0].rotation.y=this.time;group.children[0].position.y=1.2+Math.sin(this.time*2+i)*.15;if(group.position.distanceTo(new THREE.Vector3(this.position.x,this.district.base,this.position.z))<2.7&&this.campaign.collect(this.index,i)){group.visible=false;this.audio.checkpoint();this.toast('Hidden stash · +$400 · +75 XP');this.save();}});
    this.marker.children[2].rotation.y=this.time*.6;this.followCamera(dt,false,boost);this.audio.update(this.physics.speed,this.input.throttle,this.occupied);
    this.studio.active.sea.update(this.time);this.studio.active.builder.animations.forEach(fn=>fn(this.time));this.studio.time=this.time;
    this.hudTimer+=dt;this.saveTimer+=dt;if(this.hudTimer>.12){this.hudTimer=0;this.updateHud();}if(this.saveTimer>4){this.saveTimer=0;this.save();this.studio.renderer.shadowMap.needsUpdate=true;}
    this.studio.dirty=true;
  }
  updatePatrols(dt){
    const escaping=this.campaign.run?.mission.kind==='escape';this.speeding=(Math.abs(this.physics.speed)>25?this.speeding||0:0)+dt;
    if(this.speeding>8&&this.occupied&&!this.district.marine&&this.heat===0){this.heat=1;this.toast('Patrol alerted · stay ahead');}
    const p=this.position;this.patrols.forEach((patrol,i)=>{patrol.mesh.visible=this.heat>0&&!this.district.marine;patrol.boat.visible=this.heat>0&&!!this.district.marine;if(this.heat===0)return;const pos=patrol.mesh.position,dx=p.x-pos.x,dz=p.z-pos.z,distance=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),turn=THREE.MathUtils.euclideanModulo(angle-patrol.heading+Math.PI,Math.PI*2)-Math.PI;
      patrol.heading+=THREE.MathUtils.clamp(turn,-dt*1.8,dt*1.8);const step=Math.min(distance,dt*(escaping?13+i*1.5:11));const nx=pos.x+Math.sin(patrol.heading)*step,nz=pos.z+Math.cos(patrol.heading)*step;
      const blocked=this.colliders.some(c=>nx>c.x-c.w/2-1.2&&nx<c.x+c.w/2+1.2&&nz>c.z-c.d/2-1.2&&nz<c.z+c.d/2+1.2);
      if(!blocked){pos.x=nx;pos.z=nz;}else patrol.heading+=dt*(i?1:-1)*3;pos.y=this.district.base;patrol.mesh.rotation.y=patrol.heading;patrol.boat.position.copy(pos);patrol.boat.position.y=.1;patrol.boat.rotation.y=patrol.heading;patrol.beacons.forEach((light,k)=>light.material.emissiveIntensity=Math.sin(this.time*13+k*Math.PI)>0?6:.15);
      if(distance<3.1){this.collision(5);if(this.occupied&&!this.district.marine)this.physics.body.velocity.scale(.97,this.physics.body.velocity);}
    });
    if(this.heat>0&&!escaping){const far=this.patrols.every(o=>o.mesh.position.distanceTo(p)>55);this.cooldown=far?(this.cooldown||0)+dt:0;if(this.cooldown>9){this.heat=0;this.cooldown=0;this.toast('Patrol lost · heat cleared');}}
    if(escaping&&this.district.marine){this.slowEscape=Math.abs(this.physics.speed)<3?(this.slowEscape||0)+dt:0;if(this.slowEscape>15){this.campaign.run=null;this.heat=0;this.refreshMarker();this.banner('INTERCEPTED','KEEP THE BOAT MOVING — M TO RETRY');}}
  }
  followCamera(dt,snap=false,boost=false){
    const p=this.position;if(!p)return;const h=this.heading+this.cameraOffset+(this.input.down('KeyB')?Math.PI:0);this.lastCameraHeading=h;
    const distance=this.cameraMode===2?16:this.cameraMode===1?1.5:this.occupied?(this.district.marine?16:9):5.5,height=this.cameraMode===1?1.3:this.occupied?(this.district.marine?6:3.6):2.4;
    const desired=new THREE.Vector3(p.x-Math.sin(h)*distance,p.y+height,p.z-Math.cos(h)*distance);const target=new THREE.Vector3(p.x+Math.sin(h)*4,p.y+(this.occupied?.65:1.25),p.z+Math.cos(h)*4);
    this.studio.camera.position.lerp(desired,snap?1:1-Math.exp(-dt*6));this.studio.controls.target.copy(target);this.studio.camera.lookAt(target);this.studio.camera.fov=boost?76:65;this.studio.camera.updateProjectionMatrix();
  }
  changeCamera(){this.cameraMode=(this.cameraMode+1)%3;this.cameraOffset=0;this.toast(['Chase camera','Close camera','Wide chase camera'][this.cameraMode]);this.studio.dirty=true;}
  horn(){this.audio.tone(196,.38,.06,'sawtooth');this.audio.tone(246.94,.38,.045,'triangle');}
  menu(kind='map'){
    if(!this.started)return;this.paused=true;this.input.blocked=true;this.input.clear();this.touchBoost=false;this.audio.update(0,0,false);el('game-menu').classList.remove('hidden');el('menu-title').textContent=kind==='garage'?'MAKE IT YOURS':kind==='pause'?'TAKE A BREATH':'THE CITY IS YOURS';
    const p=this.campaign.progress;
    if(kind==='garage'){
      el('menu-content').innerHTML='<div class="garage-grid"><div><span class="game-kicker">SUNRISE GT · SPORT COUPE</span><h3>Fresh paint. More power.</h3><p>A detailed licensed concept car with physical suspension, acceleration, braking and collision response. Your boat is ready in the Keys.</p><div class="paint-swatches">'+['#267dab','#ba5545','#e8c77e','#35433e','#d6ddd2'].map(color=>'<button data-paint="'+color+'" style="--paint:'+color+'" aria-label="Paint '+color+'"></button>').join('')+'</div></div><div><h3>Engine stage '+p.upgrade+' / 3</h3><p>Each stage adds 18% engine power.<br>Balance: '+money(p.cash)+'</p><button id="upgrade-engine">'+(p.upgrade===3?'ENGINE MAXED':'UPGRADE · '+money(2000*(p.upgrade+1)))+'</button><p>Collect hidden stashes and finish missions to earn cash. Repair and nitro refill are free.</p><button id="repair-car">REPAIR & REFILL</button></div></div>';
      el('menu-content').querySelectorAll('[data-paint]').forEach(b=>b.onclick=()=>{p.color=b.dataset.paint;this.model.paint.color.set(p.color);this.save();this.studio.dirty=true;this.toast('Paint saved.');});
      el('upgrade-engine').onclick=()=>{if(this.campaign.upgrade()){if(!this.district.marine)this.physics.spec.power=spec.power*(1+p.upgrade*.18);this.save();this.menu('garage');this.toast('Engine upgraded.');}else this.toast(p.upgrade>=3?'Engine already maxed.':'Earn more cash through missions and stashes.');};
      el('repair-car').onclick=()=>{this.health=this.nitro=100;this.toast('Vehicle repaired. Nitro refilled.');this.updateHud();};
    }else{
      const jobs=MISSIONS.filter(m=>m.district===this.index);el('menu-content').innerHTML=districtCards(this.index)+'<div class="menu-stats"><span>CAMPAIGN '+this.campaign.completed+' / 15</span><span>STASHES '+p.pickups.length+' / 15 · '+money(p.cash)+'</span></div><div class="mission-list">'+jobs.map(m=>'<button class="mission-option" data-mission="'+m.id+'"><span>'+m.kind.toUpperCase()+' · '+money(m.reward)+'</span><b>'+m.title+'</b><small>'+m.description+'<br>'+(p.completed[m.id]?'BEST '+formatTime(p.completed[m.id]):'READY TO START')+'</small></button>').join('')+'</div><p class="controls-copy">WASD / arrows: drive or move · E: enter / exit · Shift: nitro / run · Space: brake / jump<br>R: recover · C: camera · Q: horn · drag: look around · M: map · G: garage · Escape: pause<br>District travel loads separate playable environments. The campaign and garage save on this browser.</p>';
      el('menu-content').querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>{this.travel(Number(b.dataset.travel));this.menu('map');});
      el('menu-content').querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>this.startMission(b.dataset.mission));
    }
    this.save();el('close-menu').focus();
  }
  resume(){this.paused=false;this.input.blocked=false;this.input.clear();el('game-menu').classList.add('hidden');this.audio.start();this.studio.dirty=true;}
  updateHud(){
    if(!this.district)return;const run=this.campaign.run,target=this.campaign.target,p=this.campaign.progress;
    el('district-name').textContent=this.district.name;el('cash').textContent=money(p.cash);el('xp').textContent=p.xp+' XP';el('heat').textContent=this.heat?'★'.repeat(this.heat)+'☆'.repeat(3-this.heat):'';
    el('mission-kind').textContent=run?run.mission.kind.toUpperCase()+' · '+money(run.mission.reward):'FREE ROAM · '+this.campaign.completed+' / 15 MISSIONS';
    el('mission-title').textContent=run?run.mission.title:'MAKE YOUR OWN WAY';el('mission-detail').textContent=run?run.mission.description:'Explore, find hidden stashes, and open M for your next job.';
    el('mission-counter').textContent=run?(run.checkpoint+1)+' / '+run.mission.route.length+' · '+Math.round(Math.hypot(this.position.x-target[0],this.position.z-target[1]))+' M':'STASHES '+p.pickups.length+' / 15';
    el('mission-time').textContent=run?formatTime(run.mission.limit-run.elapsed):'';el('speed').textContent=Math.round(Math.abs(this.occupied?this.physics.speed:0)*3.6);el('vehicle-label').textContent=!this.occupied?(this.district.marine?'SWIMMING':'ON FOOT'):this.district.marine?'TIDE RUNNER · CENTER CONSOLE':'SUNRISE GT · STAGE '+p.upgrade;
    el('interaction-hint').textContent=this.occupied?'E — EXIT '+(this.district.marine?'BOAT':'CAR'):'E — BOARD NEAR YOUR '+(this.district.marine?'BOAT':'CAR');el('integrity').value=this.health;el('nitro').value=this.nitro;
    el('map-caption').textContent=this.style>100?'DRIFT STYLE '+Math.floor(this.style):this.district.tag;
    drawMap(el('mini-map'),this.district,this.colliders,{x:this.position.x,z:this.position.z,heading:this.heading},target,run?.mission.route,this.heat?this.patrols.map(p=>p.mesh.position):[],this.district.pickups.filter((_,i)=>this.pickups[i].visible));
  }
  save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(this.campaign.progress));}catch{if(!this.saveWarning){this.saveWarning=true;this.toast('Browser storage unavailable. Progress will last for this session.');}}}
  toast(message){el('game-toast').textContent=message;el('game-toast').classList.remove('hidden');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>el('game-toast').classList.add('hidden'),3200);}
  banner(title,subtitle){el('game-banner').replaceChildren();const text=document.createTextNode(title),small=document.createElement('small');small.textContent=subtitle;el('game-banner').append(text,small);el('game-banner').classList.remove('hidden');clearTimeout(this.bannerTimer);this.bannerTimer=setTimeout(()=>el('game-banner').classList.add('hidden'),3300);}
}
