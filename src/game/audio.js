export class EngineAudio {
  constructor() { this.volume = 0.35; this.ready = false; }
  start() {
    if (this.ready) { this.context.resume(); return; }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.gain = this.context.createGain();
    this.gain.gain.value = 0;
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass'; this.filter.frequency.value = 280;
    this.osc = this.context.createOscillator(); this.osc.type = 'sawtooth'; this.osc.frequency.value = 40;
    this.osc2 = this.context.createOscillator(); this.osc2.type = 'triangle'; this.osc2.frequency.value = 81;
    this.osc.connect(this.filter); this.osc2.connect(this.filter); this.filter.connect(this.gain); this.gain.connect(this.context.destination);
    this.osc.start(); this.osc2.start(); this.ready = true;
  }
  update(speed, throttle, active) {
    if (!this.ready) return;
    const t = this.context.currentTime;
    const rpm = 34 + (Math.abs(speed) % 13) * 4 + Math.abs(throttle) * 18;
    this.osc.frequency.setTargetAtTime(rpm, t, 0.1);
    this.osc2.frequency.setTargetAtTime(rpm * 2.02, t, 0.1);
    this.filter.frequency.setTargetAtTime(180 + Math.abs(throttle) * 330 + Math.abs(speed) * 5, t, 0.1);
    this.gain.gain.setTargetAtTime(active ? this.volume * (0.05 + Math.abs(throttle) * 0.07) : 0, t, 0.15);
  }
  chime() {
    if (!this.ready) return;
    const o = this.context.createOscillator(), g = this.context.createGain(), t = this.context.currentTime;
    o.type = 'sine'; o.frequency.setValueAtTime(540, t); o.frequency.setValueAtTime(810, t + 0.12);
    g.gain.setValueAtTime(this.volume * 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g); g.connect(this.context.destination); o.start(t); o.stop(t + 0.5);
  }
}
