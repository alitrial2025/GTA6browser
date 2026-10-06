import { WORLD, DISTRICTS } from '../config.js';

export class WorldMap {
  constructor(canvas, full = false) { this.canvas = canvas; this.context = canvas.getContext('2d'); this.full = full; }
  draw(position, heading, mission, population, time) {
    const c = this.context, canvas = this.canvas;
    const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    }
    const w = canvas.width, h = canvas.height;
    c.clearRect(0, 0, w, h); c.fillStyle = '#15333d'; c.fillRect(0, 0, w, h);
    const scale = this.full ? Math.min(w / 4000, h / 5450) : w / 440;
    const center = this.full ? { x: -730, z: 1000 } : position;
    const toScreen = (x, z) => ({ x: w / 2 + (x - center.x) * scale, y: h / 2 + (z - center.z) * scale });
    const area = (x, z, width, depth, color) => {
      const p = toScreen(x, z); c.fillStyle = color; c.fillRect(p.x, p.y, width * scale, depth * scale);
    };
    area(WORLD.minX - 70, WORLD.minZ - 100, 1940, 3080, '#2a4144');
    area(-2600, -1500, 1480, 3000, '#304d3e');
    for (const island of [{z:1930,rx:265,rz:240},{z:2690,rx:340,rz:330},{z:3360,rx:290,rz:205}]) {
      const p = toScreen(610, island.z); c.fillStyle = '#a7aa82'; c.beginPath(); c.ellipse(p.x,p.y,island.rx*scale,island.rz*scale,0,0,Math.PI*2);c.fill();
      c.fillStyle='#506c52';c.beginPath();c.ellipse(p.x,p.y,island.rx*scale*.8,island.rz*scale*.8,0,0,Math.PI*2);c.fill();
    }
    area(598, 1430, 24, 2160, '#8d9d8b'); area(-1965, 631, 860, 18, '#859984'); area(-1289, -1440, 18, 2880, '#859984');
    for (let x = WORLD.minX; x < 640; x += 160) for (let z = WORLD.minZ; z < WORLD.maxZ; z += 160) {
      area(x + 20, z + 20, 120, 120, x >= -480 && x <= 0 && z >= -800 && z <= -160 ? '#426061' : '#3b5554');
      if (!this.full) { area(x + 35, z + 35, 40, 40, '#526964'); area(x + 88, z + 85, 36, 40, '#526964'); }
    }
    area(625, WORLD.minZ - 80, 25, 3050, '#697c6a'); area(650, WORLD.minZ - 80, 105, 3050, '#9e9f80');
    c.strokeStyle = '#b4bea5'; c.globalAlpha = .24; c.lineWidth = .8 * dpr;
    for (let x = WORLD.minX; x <= 640; x += 160) { const a = toScreen(x, WORLD.minZ), b = toScreen(x, WORLD.maxZ); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    for (let z = WORLD.minZ; z <= WORLD.maxZ; z += 160) { const a = toScreen(WORLD.minX, z), b = toScreen(640, z); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
    c.globalAlpha = 1;
    if (mission?.active) {
      const p = toScreen(position.x, position.z), t = toScreen(mission.route.x, mission.route.z);
      c.strokeStyle = '#eebb97'; c.lineWidth = 2.3 * dpr; c.setLineDash([5 * dpr, 4 * dpr]);
      c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(t.x, p.y); c.lineTo(t.x, t.y); c.stroke(); c.setLineDash([]);
      const tx = Math.max(12 * dpr, Math.min(w - 12 * dpr, t.x)), ty = Math.max(12 * dpr, Math.min(h - 12 * dpr, t.y));
      c.fillStyle = '#eebb97'; c.beginPath(); c.arc(tx, ty, 5 * dpr, 0, Math.PI * 2); c.fill();
    }
    if (this.full) {
      c.textAlign = 'center'; c.font = `600 ${8 * dpr}px sans-serif`;
      for (const district of DISTRICTS) { const p = toScreen(district.x, district.z); c.fillStyle = district.color; c.beginPath(); c.arc(p.x,p.y,2*dpr,0,Math.PI*2);c.fill(); c.fillText(district.name.toUpperCase(), p.x, p.y - 7 * dpr); }
      const p = toScreen(1020, 0); c.save(); c.translate(p.x, p.y); c.rotate(-Math.PI / 2); c.fillStyle = '#729caa'; c.font = `500 ${13 * dpr}px sans-serif`; c.fillText('ATLANTIC OCEAN', 0, 0); c.restore();
    } else if (population.enabled) {
      c.fillStyle = '#c0cdc2'; population.cars.forEach(car => { const p = toScreen(car.body.position.x, car.body.position.z); if (p.x > 0 && p.x < w && p.y > 0 && p.y < h) c.fillRect(p.x - dpr, p.y - dpr, 2 * dpr, 2 * dpr); });
    }
    const p = toScreen(position.x, position.z);
    c.save(); c.translate(p.x, p.y); c.rotate(Math.PI - heading); c.shadowColor = '#91ebe2'; c.shadowBlur = 8 * dpr;
    c.fillStyle = '#b4f1e3'; c.beginPath(); c.moveTo(0, -7 * dpr); c.lineTo(5 * dpr, 5 * dpr); c.lineTo(0, 2 * dpr); c.lineTo(-5 * dpr, 5 * dpr); c.closePath(); c.fill(); c.restore();
    if (!this.full) { c.fillStyle = '#e5e8d8'; c.font = `600 ${10 * dpr}px sans-serif`; c.textAlign = 'center'; c.fillText('N', w - 15 * dpr, 19 * dpr); }
  }
}
