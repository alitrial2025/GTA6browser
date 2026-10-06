export class Input {
  constructor() {
    this.keys = new Set();
    this.pressed = new Set();
    this.touch = { throttle: 0, steer: 0, brake: false };
    this.blocked = true;
    window.addEventListener('keydown', e => {
      if (e.target.matches('input, select, textarea') || this.blocked) return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
  }
  clear() { this.keys.clear(); this.pressed.clear(); this.touch = { throttle: 0, steer: 0, brake: false }; }
  down(...codes) { return !this.blocked && codes.some(c => this.keys.has(c)); }
  take(code) { const value = this.pressed.has(code); this.pressed.delete(code); return value; }
  get throttle() { return this.blocked ? 0 : Number(this.down('KeyW', 'ArrowUp')) - Number(this.down('KeyS', 'ArrowDown')) + this.touch.throttle; }
  get steer() { return this.blocked ? 0 : Number(this.down('KeyA', 'ArrowLeft')) - Number(this.down('KeyD', 'ArrowRight')) + this.touch.steer; }
  get handbrake() { return !this.blocked && (this.down('Space') || this.touch.brake); }
}
