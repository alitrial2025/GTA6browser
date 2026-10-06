import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { WORLD, DISTRICTS, VEHICLE_SPECS } from './config.js';
import { City } from './world/city.js';
import { Sky } from './world/sky.js';
import { Water } from './world/water.js';
import { Weather } from './world/weather.js';
import { isLand, terrainHeight, bridgeHeight } from './world/exterior.js';
import { createVehicle } from './world/vehicle-model.js';
import { loadDetailedVehicle, createDetailedVehicle } from './world/detailed-vehicle.js';
import { createCharacter } from './world/character-model.js';
import { loadDetailedCharacter, createDetailedCharacter } from './world/detailed-character.js';
import { loadSurfaceTextures } from './world/textures.js';
import { Input } from './game/input.js';
import { EngineAudio } from './game/audio.js';
import { VehiclePhysics, walkAgainstBuildings } from './game/physics.js';
import { Population } from './game/population.js';
import { Missions } from './game/missions.js';
import { GameCamera } from './game/camera.js';
import { districtAt, clamp } from './game/math.js';
import { loadSave, saveGame } from './game/storage.js';
import { Interface } from './ui/interface.js';
import { GaragePreview } from './ui/garage-preview.js';

class Game {
  async initialize() {
    const saved = loadSave(); this.settings = saved.settings; this.time = 0; this.playing = false; this.paused = false; this.photoMode = false;
    this.driving = true; this.vehicleIndex = 0; this.health = 100; this.wanted = 0; this.wantedUntil = 0; this.walkSpeed = 0; this.walkHeading = Math.PI;
    this.swimming=false;this.diveDepth=.55;
    this.input = new Input(); this.audio = new EngineAudio(); this.position = new THREE.Vector3(WORLD.spawn.x, 1, WORLD.spawn.z); this.heading = WORLD.spawn.heading;
    this.ui = new Interface({
      play: () => this.start(), route: () => { this.start(); this.startMission(); },
      pause: value => { this.paused = value; this.redraw = true; this.input.blocked = value || !this.playing || this.photoMode; this.input.clear(); },
      menu: () => { this.playing = false; this.input.blocked = true; this.audio.update(0, 0, false); },
      settings: () => { this.applySettings(); this.save(); },
      vehicle: index => this.selectVehicle(index), getVehicle: () => this.vehicleIndex,
      paint: color => { this.car.paint.color.set(color); this.redraw = true; if (this.preview) this.preview.car.paint.color.set(color); },
      preview: canvas => { this.disposePreview(); this.preview = new GaragePreview(canvas, this.car.paint.color.getHex()); },
      disposePreview: () => this.disposePreview(),
      scene: index => {this.cameraController.sceneIndex=index;this.cameraController.ready=false;this.redraw=true;},
      travel: district => { this.start(); this.physics.reset({ ...district, y: 1.1, heading: Math.PI }); this.driving = true; this.player.visible = false; this.ui.toast('WELCOME TO ' + district.name.toUpperCase(), district.description); this.cameraController.ready = false; },
      camera: () => this.cycleCamera(), reset: () => this.recover(), enter: () => this.toggleVehicle(),
      fullscreen: () => this.fullscreen(), photo: () => this.togglePhoto(), capture: () => this.capturePhoto(),
      touch: (action, active) => {
        if (this.input.blocked) return;
        if (action === 'gas') this.input.touch.throttle = active ? 1 : 0;
        if (action === 'brake') this.input.touch.throttle = active ? -1 : 0;
        if (action === 'left') this.input.touch.steer = active ? 1 : 0;
        if (action === 'right') this.input.touch.steer = active ? -1 : 0;
      },
    }, this.settings);
    await new Promise(requestAnimationFrame);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(innerWidth, innerHeight); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.info.autoReset = false;
    this.renderer.domElement.setAttribute('aria-label', 'Vice Horizon interactive 3D world');
    document.querySelector('#world').append(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .15, 5500);
    this.cameraController = new GameCamera(this.camera);
    const pmrem = new THREE.PMREMGenerator(this.renderer), room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, .04); this.scene.environment = this.environment.texture; this.scene.environmentIntensity = .5;
    room.dispose(); pmrem.dispose();
    const environmentReady = this.loadEnvironmentMaps();
    const surfacesReady = loadSurfaceTextures();
    const charactersReady = loadDetailedCharacter();
    this.sky = new Sky(this.scene); this.water = new Water(this.scene); this.weather = new Weather(this.scene);
    const detailedAsset = loadDetailedVehicle().catch(error => { console.warn('Using locally modeled fallback vehicle:', error.message); return null; });
    document.querySelector('#loading-status').textContent = 'Raising the skyline…';
    await new Promise(requestAnimationFrame);
    await Promise.all([surfacesReady, charactersReady, environmentReady]);
    this.water.prepareReflection();
    this.city = new City(this.scene);
    document.querySelector('#loading-status').textContent = 'Preparing your ride…';
    await detailedAsset;
    this.car = createDetailedVehicle(VEHICLE_SPECS[0].color) || createVehicle(VEHICLE_SPECS[0].color); this.scene.add(this.car.group); this.car.wheels.forEach(w => this.scene.add(w));
    this.physics = new VehiclePhysics(this.city, this.car, VEHICLE_SPECS[0]);
    for (let i = 0; i < 90; i++) this.physics.update(1 / 60, this.input, false);
    this.position.copy(this.car.group.position);
    this.physics.onCollision = (impact, kind) => {
      if (!this.playing || !this.driving) return;
      this.health = clamp(this.health - Math.max(1, impact - 2) * 1.2, 0, 100);
      if (kind === 'traffic' || kind === 'police') { this.wanted = clamp(this.wanted + 1, 0, 3); this.wantedUntil = this.time + 30; this.ui.toast('WATCH THE TRAFFIC', 'Attention level increased. Drive clean to cool down.', 3); }
      if (this.health < 15) this.ui.toast('YOUR RIDE NEEDS A BREAK', 'Press R to recover and repair your vehicle.');
    };
    this.player = createDetailedCharacter(1, true) || createCharacter(1, true); this.player.visible = false; this.scene.add(this.player);
    this.population = new Population(this.scene, this.physics);
    this.missions = new Missions(this.scene, saved.missions); this.district = DISTRICTS[0];
    this.composer = new EffectComposer(this.renderer); this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .17, .35, 1.2); this.composer.addPass(this.bloom); this.composer.addPass(new OutputPass());
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); this.orbit.enabled = false; this.orbit.enableDamping = true; this.orbit.minDistance = 2; this.orbit.maxDistance = 100; this.orbit.maxPolarAngle = Math.PI * .49;
    this.applySettings();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('keydown', e => {
      if (e.target.matches('input, select, textarea')) return;
      if (e.code === 'Escape') { if (this.photoMode) this.togglePhoto(); else if (this.ui.panel) this.ui.close(); else if (this.playing) this.ui.open('pause'); }
      if (e.code === 'KeyP' && this.photoMode) { e.preventDefault(); this.togglePhoto(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.playing && !this.ui.panel && !this.photoMode) this.ui.open('pause'); });
    window.addEventListener('beforeunload', () => this.save());
    this.renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); this.paused = true; this.ui.toast('GRAPHICS CONTEXT INTERRUPTED', 'Reload the page to restore the world.', 60); });
    this.clock = new THREE.Clock(); this.uiElapsed = 0;
    this.cameraController.update(1, this.position, this.heading, true, true, 0);
    this.sky.update(0, this.position); this.render(); this.ui.ready();
    document.querySelector('#teaser-title').textContent = this.missions.route.title.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    window.__VICE_HORIZON__ = {
      snapshot: () => ({ ready: true, playing: this.playing, paused: this.paused, driving: this.driving, position: { x: this.position.x, y: this.position.y, z: this.position.z }, speed: this.physics.speed, health: this.health, wanted: this.wanted, mission: this.missions.active ? this.missions.route.id : null, cash: this.missions.cash, completed: this.missions.completed, buildings: this.city.buildingCount, palms: this.city.palmCount, traffic: this.population.cars.length, pedestrians: this.population.people.length, vehicle: this.vehicleIndex, detailedCar: !!this.car.detailed, drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, settings: { ...this.settings } }),
    };
    this.renderer.setAnimationLoop(() => this.frame());
  }
  start() {
    this.playing = true; this.ui.start(); this.paused = false; this.input.blocked = false; this.audio.start();
    this.ui.toast('WELCOME TO VICE HORIZON', 'WASD to drive · E to walk · J to start a chapter', 5);
  }
  async loadEnvironmentMaps() {
    const loader = new RGBELoader(), pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environments = {};
    for (const [key, file] of [['day', 'daylight.hdr'], ['sunset', 'sunset.hdr']]) {
      const hdr = await loader.loadAsync('/environments/' + file); hdr.mapping = THREE.EquirectangularReflectionMapping;
      this.environments[key] = { background: hdr, reflection: pmrem.fromEquirectangular(hdr) };
    }
    pmrem.dispose();
  }
  startMission() {
    if (this.missions.active) { this.ui.toast('CHAPTER IN PROGRESS', 'Follow the route on your minimap.'); return; }
    this.missions.start(this.time); this.ui.toast(this.missions.route.title, this.missions.route.subtitle); this.audio.chime();
  }
  selectVehicle(index) {
    if (!VEHICLE_SPECS[index]) return;
    this.vehicleIndex = index; this.car.paint.color.set(VEHICLE_SPECS[index].color); this.physics.setSpec(VEHICLE_SPECS[index]); this.health = 100;
    if (Math.abs(this.physics.speed) > .5) this.physics.body.velocity.setZero();
  }
  disposePreview() { this.preview?.dispose(); this.preview = null; }
  applySettings() {
    if (!this.renderer) return;
    this.redraw = true;
    this.sky.setTime(this.settings.time); this.population.enabled = this.settings.traffic;
    this.water.setQuality(this.settings.quality);
    const environment = this.environments[this.settings.time === 'noon' ? 'day' : 'sunset'];
    this.scene.background = environment.background; this.scene.environment = environment.reflection.texture;
    this.scene.backgroundIntensity = this.settings.time === 'night' ? .035 : this.settings.time === 'golden' ? .9 : 1;
    this.scene.backgroundRotation.y = this.settings.time === 'noon' ? .6 : 1.5;
    this.scene.environmentIntensity = this.settings.time === 'night' ? .25 : .7;
    this.sky.dome.visible = false;
    this.audio.volume = this.settings.volume; this.cameraController.mode = this.settings.camera;
    const high = this.settings.quality === 'high', low = this.settings.quality === 'low';
    this.renderer.setPixelRatio(low ? Math.min(devicePixelRatio, .75) : Math.min(devicePixelRatio, high ? 1.5 : 1.25));
    this.camera.far=low?2800:5500;
    this.renderer.shadowMap.enabled = !low;
    const size = high ? 2048 : 1024;
    if (this.sky.sun.shadow.mapSize.x !== size) { this.sky.sun.shadow.map?.dispose(); this.sky.sun.shadow.map = null; this.sky.sun.shadow.mapSize.set(size, size); }
    this.bloom.enabled = high; this.renderer.toneMappingExposure = this.settings.time === 'night' ? 1.35 : 1.0;
    this.resize();
    if(this.underwater)this.updateUnderwaterLook(true);
  }
  resize() {
    this.redraw = true;
    this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight); this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(innerWidth, innerHeight);
  }
  cycleCamera() {
    const modes = ['chase', 'hood', 'orbit']; this.cameraController.mode = modes[(modes.indexOf(this.cameraController.mode) + 1) % modes.length];
    this.settings.camera = this.cameraController.mode; this.save(); this.ui.toast(this.cameraController.mode.toUpperCase() + ' CAMERA', 'Press C to switch views.', 2);
  }
  toggleVehicle() {
    if (!this.playing) return;
    if (this.driving) {
      if (Math.abs(this.physics.speed) > 4) { this.ui.toast('SLOW DOWN FIRST', 'Bring your car to a stop before stepping out.', 2); return; }
      this.driving = false; this.walkHeading = this.physics.heading;
      const side = new THREE.Vector3(2.3, 0, 0).applyQuaternion(this.car.group.quaternion);
      this.player.position.copy(this.car.group.position).add(side); this.player.position.y = .06;
      this.player.position.copy(walkAgainstBuildings(this.player.position, 0, 0, this.city.colliders)); this.player.visible = true;
    } else {
      if (this.player.position.distanceTo(this.car.group.position) > 5) { this.ui.toast('YOUR CAR IS BACK THERE', 'Move close to your car and press E.', 2); return; }
      this.driving = true; this.player.visible = false;
    }
    this.cameraController.mode = this.settings.camera; this.input.clear();
  }
  recover() {
    if (!this.playing) return;
    const p = this.car.group.position;
    const keys = p.z > 1480, country = p.x < WORLD.minX;
    const x = keys ? 610 : country ? -1280 : clamp(Math.round(p.x / 160) * 160, WORLD.minX, 640);
    const z = clamp(p.z, WORLD.minZ + 30, keys ? 3520 : WORLD.maxZ - 30);
    this.physics.reset({ x, z, y: keys?bridgeHeight(z)+1.2:terrainHeight(x,z)+1.2, heading: this.physics.heading }); this.health = 100;
    if (!this.driving) { this.player.position.set(x + 3, .06, z); }
    this.ui.toast('BACK ON THE ROAD', 'Your vehicle has been recovered and repaired.', 2);
  }
  togglePhoto() {
    if (!this.playing || this.ui.panel) return;
    this.photoMode = !this.photoMode; this.ui.photo(this.photoMode); this.input.blocked = this.photoMode; this.input.clear();
    this.orbit.enabled = this.photoMode;
    if (this.photoMode) { this.orbit.target.copy(this.position).add(new THREE.Vector3(0, 1, 0)); this.orbit.update(); }
    else this.cameraController.ready = false;
  }
  capturePhoto() {
    this.render(); this.renderer.domElement.toBlob(blob => {
      if (!blob) { this.ui.toast('PHOTO COULD NOT BE SAVED', 'Try again after the next frame.'); return; }
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'vice-horizon-photo.png'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.ui.toast('MOMENT CAPTURED', 'Your city. Your perspective.', 3);
    }, 'image/png');
  }
  async fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { this.ui.toast('FULLSCREEN UNAVAILABLE', 'Use your browser’s fullscreen shortcut.'); }
  }
  save() { if (this.missions) saveGame(this.settings, this.missions); }
  frame() {
    const dt = Math.min(this.clock.getDelta(), .1);
    const active = this.playing && !this.paused && !this.photoMode;
    if (!this.paused && !this.photoMode) this.time += dt;
    if (active) {
      if (this.input.take('KeyE')) this.toggleVehicle();
      if (this.input.take('KeyR')) this.recover();
      if (this.input.take('KeyC')) this.cycleCamera();
      if (this.input.take('KeyJ')) this.startMission();
      if (this.input.take('KeyM')) this.ui.open('map');
      if (this.input.take('KeyP')) this.togglePhoto();
      this.population.update(dt, this.time, this.position, this.wanted);
      this.physics.update(dt, this.input, this.driving);
      if (!this.driving) {
        const turn = this.input.steer; this.walkHeading += turn * dt * 2.2;
        this.walkSpeed = this.input.throttle * (this.input.handbrake ? 5.4 : 2.6);
        const move = this.walkSpeed * dt;
        this.player.position.copy(walkAgainstBuildings(this.player.position, Math.sin(this.walkHeading) * move, Math.cos(this.walkHeading) * move, this.city.colliders));
        this.swimming=!isLand(this.player.position.x,this.player.position.z);
        if(this.swimming){
          if(this.input.down('KeyQ'))this.diveDepth=clamp(this.diveDepth+dt*2.6,.55,10);
          else if(this.input.handbrake)this.diveDepth=clamp(this.diveDepth-dt*3,.55,10);
          this.player.position.y=-this.diveDepth;this.player.rotation.x=-Math.PI*.27;
        }else{this.diveDepth=.55;this.player.position.y=terrainHeight(this.player.position.x,this.player.position.z)+.06;this.player.rotation.x=0;}
        this.player.rotation.y = this.walkHeading; this.player.userData.animate(this.time, Math.abs(this.walkSpeed));
      }
      this.position.copy(this.driving ? this.car.group.position : this.player.position); this.heading = this.driving ? this.physics.heading : this.walkHeading;
      if (!isLand(this.car.group.position.x, this.car.group.position.z) || this.car.group.position.y < -10) this.recover();
      const completed = this.missions.update(this.time, this.position);
      if (completed) { this.ui.toast('CHAPTER COMPLETE', `+${completed.route.reward.toLocaleString()} · ${Math.round(completed.duration)} seconds · Press J for your next chapter`, 7); this.audio.chime(); this.save(); }
      if (this.wanted && this.time > this.wantedUntil) { this.wanted--; this.wantedUntil = this.time + 15; if (!this.wanted) this.ui.toast('CLEAR SKIES', 'The heat is off. Keep cruising.', 3); }
      this.district = districtAt(this.position.x, this.position.z, DISTRICTS);
    } else if (!this.playing && !this.paused) {
      this.physics.update(dt, this.input, false); this.position.copy(this.car.group.position); this.population.update(dt, this.time, this.position);
    }
    this.audio.update(this.physics.speed, this.input.throttle, active && this.driving);
    if (this.photoMode) this.orbit.update();
    else this.cameraController.update(dt, this.position, this.heading, this.driving, !this.playing, this.time);
    const underwater=this.camera.position.y<-.15;
    this.city.marine.reef.visible=underwater;
    if(underwater!==this.underwater){this.underwater=underwater;this.updateUnderwaterLook(underwater);}
    this.sky.update(this.time, this.playing?this.position:this.cameraController.previewTarget); this.water.update(this.time, this.settings.time === 'night',underwater);
    this.city.resort.update(this.time);
    this.city.exterior.waterfront.update(this.time);
    this.city.marine.update(this.time);
    this.weather.update(this.time, this.position, this.settings.weather === 'rain');
    this.uiElapsed += dt;
    if (this.uiElapsed > .08) { this.ui.update(this.uiElapsed, this); this.uiElapsed = 0; }
    this.preview?.update(dt);
    if (!this.paused || this.redraw || this.photoMode) this.render();
  }
  render() { this.renderer.info.reset(); if (this.settings.quality === 'high') this.composer.render(); else this.renderer.render(this.scene, this.camera); this.redraw = false; }
  updateUnderwaterLook(underwater){
    if(underwater){this.scene.fog=new THREE.FogExp2('#136474',.04);this.scene.background=new THREE.Color('#136474');this.scene.environmentIntensity=.4;}
    else{this.sky.setTime(this.settings.time);this.scene.background=this.environments[this.settings.time==='noon'?'day':'sunset'].background;this.scene.environmentIntensity=this.settings.time==='night'?.25:.7;}
    this.redraw=true;
  }
}

const game = new Game();
game.initialize().catch(error => {
  console.error('World initialization failed:', error);
  const loading = document.querySelector('#loading');
  if (loading) loading.innerHTML = `<div class="brand">VICE HORIZON</div><h2>We couldn’t start the 3D world.</h2><p>This game needs WebGL 2. Enable hardware acceleration in your browser, then reload.</p><button class="primary-button" onclick="location.reload()">TRY AGAIN →</button>`;
});
