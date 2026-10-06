import { icon, logo } from './icons.js';
import { DISTRICTS, VEHICLE_SPECS, SCENES } from '../config.js';
import { formatMoney, routeDistance } from '../game/math.js';
import { WorldMap } from './minimap.js';

export class Interface {
  constructor(callbacks, settings) {
    this.callbacks = callbacks; this.settings = settings; this.panel = null; this.playing = false; this.toastTimer = 0;
    document.querySelector('#app').innerHTML = `
      <div id="loading" class="loading-screen"><div class="brand">${logo}</div><div class="loading-line"><span></span></div><p>BUILDING YOUR WORLD<span id="loading-status">Preparing the coastline…</span></p></div>
      <div class="cinematic-vignette"></div>
      <section id="landing" class="landing">
        <header class="main-header"><a class="brand" href="#" aria-label="Vice Horizon home">${logo}</a>
          <nav aria-label="Main navigation"><button class="nav-button active" data-action="home">THE EXPERIENCE</button><button class="nav-button" data-action="map">${icon('map')} WORLD MAP</button><button class="nav-button" data-action="garage">${icon('car')} GARAGE</button></nav>
          <div class="header-right"><span class="world-live"><i></i> LIVE WORLD</span><button class="icon-button" data-action="settings" aria-label="Settings">${icon('settings')}</button></div>
        </header>
        <main class="hero"><div class="eyebrow"><span class="tiny-line"></span> OPEN WORLD. OPEN POSSIBILITIES.</div>
          <h1>THE CITY<br>IS <span>YOURS.</span></h1>
          <p class="hero-copy">Somewhere between the skyline and the sea,<br>a new story is waiting. Make it yours.</p>
          <div class="hero-actions"><button class="primary-button" data-action="play">ENTER THE CITY ${icon('arrow')}</button><button class="text-button" data-action="map">Explore the world <span>↗</span></button></div>
          <div class="feature-row"><span>${icon('car')} DRIVE ANYWHERE</span><span>${icon('foot')} LIVE THE STREETS</span><span>${icon('sun')} CHASE THE SUN</span></div>
        </main>
        <div class="scene-caption"><span class="caption-line"></span><div><span class="micro">WELCOME TO</span><strong id="scene-name">The Keys</strong><span id="scene-detail" class="caption-detail">THE OVERSEAS CAUSEWAY</span><div class="scene-switcher" aria-label="Choose a world scene">${SCENES.map((s,i)=>`<button data-action="scene" data-index="${i}" class="${i===0?'active':''}" aria-label="View ${s.name}" title="${s.name}"><span></span></button>`).join('')}</div></div></div>
        <div class="landing-bottom"><button class="route-teaser" data-action="route"><span class="route-symbol">${icon('route')}</span><span><span class="micro">YOUR FIRST CHAPTER</span><strong id="teaser-title">The coastal run</strong><span>One car. An open road. No looking back.</span></span><span class="teaser-arrow">↗</span></button>
          <div class="conditions"><span class="condition-icon">${icon('sun')}</span><span><strong id="landing-clock">18:42</strong><span id="landing-weather">GOLDEN HOUR / 28°C</span></span><div class="conditions-divider"></div><span class="world-size"><strong>${DISTRICTS.length} DISTRICTS</strong><span>A WHOLE WORLD TO DISCOVER</span></span></div>
        </div>
        <footer class="landing-footer"><span>AN ORIGINAL COASTAL OPEN WORLD</span><div><span class="key">W A S D</span> MOVE <span class="key">E</span> EXIT CAR <span class="key">M</span> MAP</div><span class="build-label">PLAYABLE ALPHA <i>01</i></span></footer>
      </section>
      <section id="hud" class="hud hidden" aria-label="Game interface">
        <div class="hud-top"><div><button class="brand hud-brand" data-action="pause" aria-label="Pause game">${logo}</button><div class="district-tag"><i></i><span id="district-name">OCEAN DRIVE</span><span id="hud-time">18:42</span></div></div>
          <div class="hud-finance"><div class="cash-label">AVAILABLE FUNDS</div><strong id="cash">$1,250</strong><div id="wanted" class="wanted">${Array.from({length: 3}, () => icon('star')).join('')}</div></div></div>
        <div id="objective" class="objective hidden"><span class="micro">ACTIVE CHAPTER</span><h3 id="mission-title"></h3><p id="mission-subtitle"></p><div class="objective-bottom"><span>${icon('pin')} <span id="mission-distance"></span></span><strong id="mission-reward"></strong></div></div>
        <div class="hud-bottom"><div class="map-block"><div class="map-header"><span>LOCAL AREA</span><button data-action="map" aria-label="Open world map">${icon('expand')}</button></div><canvas id="minimap" aria-label="Local minimap"></canvas><div class="map-footer"><span id="vehicle-mode">SUNRISE GT</span><span><kbd>M</kbd> WORLD MAP</span></div></div>
          <div id="context-prompt" class="context-prompt"><kbd>E</kbd> EXIT VEHICLE <span>·</span> <kbd>J</kbd> START CHAPTER</div>
          <div class="vehicle-hud"><div class="speed-row"><span id="gear">N</span><strong id="speed">000</strong><span>KM/H</span></div><div class="speed-meter"><span id="speed-fill"></span></div><div class="vehicle-condition"><span>VEHICLE CONDITION</span><span id="health-label">100%</span></div><div class="health-meter"><span id="health-fill"></span></div><div class="hud-buttons"><button data-action="camera" aria-label="Change camera">${icon('camera')} <kbd>C</kbd></button><button data-action="reset" aria-label="Recover vehicle">${icon('reset')} <kbd>R</kbd></button><button data-action="pause" aria-label="Pause">Ⅱ <kbd>ESC</kbd></button></div></div>
        </div>
        <div class="touch-controls"><div><button data-touch="left" aria-label="Steer left">←</button><button data-touch="right" aria-label="Steer right">→</button></div><div><button data-touch="brake" aria-label="Brake">↓</button><button data-touch="gas" aria-label="Accelerate">↑</button><button data-action="enter" aria-label="Enter or exit car">${icon('car')}</button></div></div>
      </section>
      <div id="toast" class="toast hidden" role="status"></div>
      <div id="modal-layer" class="modal-layer hidden"><section id="panel" class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title"></section></div>
      <div id="photo-ui" class="photo-ui hidden"><div class="photo-top">${logo}<span>PHOTO MODE</span></div><div class="photo-bottom"><span>MOVE WITH MOUSE DRAG · SCROLL TO ZOOM</span><button class="primary-button" data-action="capture">${icon('camera')} SAVE PHOTO</button><button class="glass-button" data-action="photo">BACK TO THE CITY <kbd>P</kbd></button></div></div>
    `;
    this.mini = new WorldMap(document.querySelector('#minimap'));
    this.elements = Object.fromEntries(['speed', 'gear', 'speed-fill', 'health-fill', 'health-label', 'cash', 'district-name', 'wanted', 'context-prompt', 'vehicle-mode', 'hud-time', 'mission-title', 'mission-subtitle', 'mission-distance', 'mission-reward', 'objective'].map(id => [id, document.getElementById(id)]));
    document.querySelector('#app').addEventListener('click', e => {
      const button = e.target.closest('[data-action]'); if (!button) return;
      e.preventDefault(); this.action(button.dataset.action, button.dataset);
    });
    document.querySelector('#app').addEventListener('change', e => {
      const key = e.target.dataset.setting; if (!key) return;
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'range' ? Number(e.target.value) : e.target.value;
      this.settings[key] = value; this.callbacks.settings(key, value);
    });
    document.querySelectorAll('[data-touch]').forEach(button => {
      const action = button.dataset.touch;
      button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); this.callbacks.touch(action, true); });
      const release = () => this.callbacks.touch(action, false);
      button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
    });
    document.querySelector('#modal-layer').addEventListener('click', e => { if (e.target.id === 'modal-layer') this.close(); });
    this.previousFocus = null;
    window.addEventListener('keydown', e => {
      if (e.code !== 'Tab' || !this.panel) return;
      const focusable = [...document.querySelector('#panel').querySelectorAll('button, select, input')].filter(el => !el.disabled);
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    });
  }
  ready() { document.querySelector('#loading').classList.add('loaded'); setTimeout(() => document.querySelector('#loading').remove(), 700); }
  start() { this.playing = true; document.querySelector('#landing').classList.add('hidden'); document.querySelector('#hud').classList.remove('hidden'); this.close(); }
  action(action, data = {}) {
    if (['map', 'garage', 'settings', 'pause', 'help'].includes(action)) return this.open(action);
    if (action === 'close' || action === 'resume') return this.close();
    if (action === 'home') return this.close();
    if (action === 'district') { this.selectedDistrict = Number(data.index); this.open('map'); return; }
    if (action === 'travel') { this.callbacks.travel(DISTRICTS[this.selectedDistrict ?? 0]); this.close(); return; }
    if (action === 'vehicle') { this.callbacks.vehicle(Number(data.index)); this.open('garage'); return; }
    if (action === 'paint') { this.callbacks.paint(data.color); this.toast('NEW LOOK', 'Your ride, your color.'); return; }
    if (action === 'scene') {const index=Number(data.index);this.callbacks.scene(index);document.querySelector('#scene-name').textContent=SCENES[index].name;document.querySelector('#scene-detail').textContent=SCENES[index].detail;document.querySelectorAll('.scene-switcher button').forEach((b,i)=>b.classList.toggle('active',i===index));return;}
    if (action === 'menu') { this.playing = false; document.querySelector('#landing').classList.remove('hidden'); document.querySelector('#hud').classList.add('hidden'); this.close(); this.callbacks.menu(); return; }
    this.callbacks[action]?.();
  }
  open(kind) {
    this.previousFocus ??= document.activeElement;
    this.panel = kind; this.callbacks.pause(true); document.querySelector('#modal-layer').classList.remove('hidden');
    const panel = document.querySelector('#panel'); panel.className = `panel panel-${kind}`;
    const heading = (kicker, title) => `<header class="panel-header"><div><span class="micro">${kicker}</span><h2 id="panel-title">${title}</h2></div><button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button></header>`;
    if (kind === 'map') {
      const index = this.selectedDistrict ?? 0, district = DISTRICTS[index];
      panel.innerHTML = `${heading('KNOW YOUR CITY', 'A world worth getting lost in.')}<div class="world-map-layout"><div class="full-map-wrap"><canvas id="full-map" aria-label="Map of all eight world districts"></canvas><div class="map-scale">N ↑ <span>500 M ━━━━━</span></div></div><aside class="map-sidebar"><span class="micro">${DISTRICTS.length} DISTRICTS · ONE WORLD</span><div class="district-list">${DISTRICTS.map((d, i) => `<button data-action="district" data-index="${i}" class="${i === index ? 'selected' : ''}"><span class="district-dot" style="background:${d.color}"></span><span><strong>${d.name}</strong><span>${i === 0 ? 'YOUR STARTING NEIGHBORHOOD' : 'DISCOVER THE DISTRICT'}</span></span>${icon('arrow')}</button>`).join('')}</div><div class="district-detail"><span class="micro">EXPLORE ${district.name.toUpperCase()}</span><p>${district.description}</p><button class="primary-button" data-action="travel">TRAVEL HERE ${icon('arrow')}</button></div></aside></div>`;
      this.fullMap = new WorldMap(document.querySelector('#full-map'), true);
    } else if (kind === 'garage') {
      const selected = this.callbacks.getVehicle();
      panel.innerHTML = `${heading('MAKE AN ENTRANCE', 'Find your kind of fast.')}<div class="garage-layout"><div class="garage-display"><canvas id="garage-preview" aria-label="Interactive 3D preview of your car"></canvas><span class="micro garage-display-caption">${VEHICLE_SPECS[selected].class} / VICE MOTOR WORKS</span></div><div class="garage-info"><span class="micro">YOUR COLLECTION</span><div class="vehicle-list">${VEHICLE_SPECS.map((v, i) => `<button data-action="vehicle" data-index="${i}" class="${i === selected ? 'selected' : ''}"><span class="car-color" style="background:${v.color}">${icon('car')}</span><span><strong>${v.name}</strong><span>${v.class}</span></span>${i === selected ? icon('check') : icon('arrow')}</button>`).join('')}</div><div class="vehicle-stats"><div><span>TOP SPEED</span><strong>${Math.round(VEHICLE_SPECS[selected].topSpeed * 3.6)} <small>KM/H</small></strong></div><div><span>DRIVE</span><strong>RWD</strong></div></div><span class="micro">FIND YOUR COLOR</span><div class="paint-swatches">${['#e9a37b', '#2f5464', '#bbd8bc', '#f2e6d2', '#b85d58', '#43454b'].map(color => `<button data-action="paint" data-color="${color}" style="--swatch:${color}" aria-label="Paint ${color}"></button>`).join('')}</div><p class="garage-note">Every car is ready to drive. Switch rides, then take it to the streets.</p><button class="primary-button" data-action="play">TAKE A DRIVE ${icon('arrow')}</button></div></div>`;
      this.callbacks.preview(document.querySelector('#garage-preview'));
    } else if (kind === 'settings') {
      panel.innerHTML = `${heading('YOUR CITY, YOUR WAY', 'Set the mood.')}<div class="settings-grid"><label><span>${icon('sun')} TIME OF DAY</span><select data-setting="time"><option value="golden">Golden hour</option><option value="noon">Midday</option><option value="night">Blue night</option></select></label><label><span>${icon('wind')} WEATHER</span><select data-setting="weather"><option value="clear">Clear skies</option><option value="rain">Tropical rain</option></select></label><label><span>${icon('settings')} GRAPHICS QUALITY</span><select data-setting="quality"><option value="high">High — shadows & bloom</option><option value="balanced">Balanced — lighter shadows</option><option value="low">Low — best performance</option></select></label><label><span>${icon('camera')} DEFAULT CAMERA</span><select data-setting="camera"><option value="chase">Chase camera</option><option value="hood">Hood camera</option><option value="orbit">Cinematic orbit</option></select></label><label class="volume-setting"><span>${icon('volume')} ENGINE AUDIO</span><input data-setting="volume" type="range" min="0" max="1" step="0.05" value="${this.settings.volume}" aria-label="Engine audio volume"></label><label class="traffic-setting"><span>${icon('car')} CITY TRAFFIC</span><input data-setting="traffic" type="checkbox" ${this.settings.traffic ? 'checked' : ''} aria-label="Enable city traffic"></label></div><div class="settings-footer"><span>Settings and chapter progress save on this device.</span><button class="glass-button" data-action="fullscreen">${icon('expand')} FULLSCREEN</button></div>`;
      panel.querySelectorAll('select').forEach(el => el.value = this.settings[el.dataset.setting]);
      panel.insertAdjacentHTML('beforeend', '<p class="asset-credit">Car Concept model & textures © 2024 Darmstadt Graphics Group GmbH / Eric Chadwick. <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Adapted for Vice Horizon. Barlow Condensed by Jeremy Tribby / SIL OFL.</p>');
    } else {
      panel.innerHTML = `${heading('TAKE A BREATH', 'The city can wait.')}<div class="pause-layout"><div class="pause-actions"><button class="primary-button" data-action="resume">BACK TO THE STREETS ${icon('play')}</button><button class="glass-button" data-action="map">${icon('map')} WORLD MAP</button><button class="glass-button" data-action="garage">${icon('car')} YOUR GARAGE</button><button class="glass-button" data-action="settings">${icon('settings')} SETTINGS</button><button class="text-button" data-action="menu">RETURN TO MAIN MENU ↗</button></div><div class="controls-list"><span class="micro">THE KEYS TO THE CITY</span>${[['W / ↑', 'Accelerate / walk forward'], ['S / ↓', 'Brake, then reverse'], ['A D / ← →', 'Steer / turn'], ['SPACE', 'Handbrake / sprint on foot'], ['E', 'Enter or exit your car'], ['J', 'Start next chapter'], ['C', 'Cycle cameras'], ['M', 'World map'], ['P', 'Photo mode'], ['R', 'Recover / repair your car'], ['ESC', 'Pause / resume']].map(([key, label]) => `<div><kbd>${key}</kbd><span>${label}</span></div>`).join('')}</div></div>`;
    }
    panel.querySelector('button')?.focus();
  }
  close() {
    this.panel = null; this.fullMap = null; this.callbacks.disposePreview?.(); document.querySelector('#modal-layer').classList.add('hidden');
    this.callbacks.pause(false); this.previousFocus?.focus(); this.previousFocus = null;
  }
  toast(title, detail = '', duration = 4) {
    const el = document.querySelector('#toast'); el.replaceChildren();
    const strong = document.createElement('strong'); strong.textContent = title; el.append(strong);
    if (detail) { const span = document.createElement('span'); span.textContent = detail; el.append(span); }
    el.classList.remove('hidden'); this.toastTimer = duration;
  }
  photo(value) { document.querySelector('#hud').classList.toggle('hidden', value || !this.playing); document.querySelector('#photo-ui').classList.toggle('hidden', !value); }
  update(dt, game) {
    if (this.toastTimer > 0) { this.toastTimer -= dt; if (this.toastTimer <= 0) document.querySelector('#toast').classList.add('hidden'); }
    const { physics, missions, population, driving, health, wanted, position, heading, district, vehicleIndex } = game;
    const e = this.elements;
    e.speed.textContent = Math.round(Math.abs(driving ? physics.speed : game.walkSpeed) * 3.6).toString().padStart(3, '0');
    e.gear.textContent = !driving ? '—' : physics.speed < -1 ? 'R' : Math.abs(physics.speed) < .4 ? 'N' : Math.min(6, Math.floor(Math.abs(physics.speed) / 11) + 1);
    e['speed-fill'].style.width = `${Math.min(100, Math.abs(physics.speed) / physics.spec.topSpeed * 100)}%`;
    e['health-fill'].style.width = `${health}%`; e['health-label'].textContent = `${Math.round(health)}%`;
    e.cash.textContent = formatMoney(missions.cash); e['district-name'].textContent = district.name.toUpperCase();
    e.wanted.querySelectorAll('svg').forEach((star, i) => star.classList.toggle('lit', i < wanted));
    e['vehicle-mode'].textContent = driving ? VEHICLE_SPECS[vehicleIndex].name : game.swimming ? (game.diveDepth>2?'DIVING':'SWIMMING') : 'EXPLORING ON FOOT';
    const timeLabel = this.settings.time === 'night' ? '23:18' : this.settings.time === 'noon' ? '12:30' : '18:42';
    e['hud-time'].textContent = timeLabel; document.querySelector('#landing-clock').textContent = timeLabel;
    document.querySelector('#landing-weather').textContent = this.settings.weather === 'rain' ? 'TROPICAL RAIN / 26°C' : this.settings.time === 'night' ? 'BLUE NIGHT / 24°C' : this.settings.time === 'noon' ? 'CLEAR SKIES / 31°C' : 'GOLDEN HOUR / 28°C';
    const nearCar = position.distanceTo(physics.model.group.position) < 5;
    e['context-prompt'].innerHTML = physics.overturned && driving ? '<kbd>R</kbd> RECOVER VEHICLE' : driving ? '<kbd>E</kbd> EXIT VEHICLE <span>·</span> <kbd>J</kbd> START CHAPTER' : nearCar ? '<kbd>E</kbd> ENTER VEHICLE <span>·</span> <kbd>SPACE</kbd> SPRINT' : '<kbd>SPACE</kbd> SPRINT <span>·</span> <kbd>M</kbd> WORLD MAP';
    if(!driving&&game.swimming)e['context-prompt'].innerHTML='<kbd>Q</kbd> DIVE <span>·</span> <kbd>SPACE</kbd> SURFACE <span>·</span> <kbd>W</kbd> SWIM';
    e.objective.classList.toggle('hidden', !missions.active);
    if (missions.active) {
      e['mission-title'].textContent = missions.route.title; e['mission-subtitle'].textContent = missions.route.subtitle;
      const distance = routeDistance(position, missions.route); e['mission-distance'].textContent = distance >= 1000 ? `${(distance / 1000).toFixed(1)} KM` : `${Math.round(distance)} M`;
      e['mission-reward'].textContent = `+${formatMoney(missions.route.reward)}`;
    }
    this.mini.draw(position, heading, missions, population, game.time);
    this.fullMap?.draw(position, heading, missions, population, game.time);
  }
}
