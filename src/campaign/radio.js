import { EngineAudio } from '../game/audio.js';
export class GameAudio extends EngineAudio{
  constructor(){super();this.music=true;this.enabled=true;this.beat=0;}
  start(){super.start();if(this.ready&&!this.timer)this.timer=setInterval(()=>this.tick(),300);}
  tone(frequency,duration=.2,volume=.025,type='sine'){if(!this.ready||!this.enabled)return;const t=this.context.currentTime,o=this.context.createOscillator(),g=this.context.createGain();o.type=type;o.frequency.value=frequency;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.context.destination);o.start(t);o.stop(t+duration);}
  tick(){if(!this.enabled||!this.music||!this.ready)return;const chords=[110,130.81,87.31,98],root=chords[Math.floor(this.beat/16)%4],pattern=[1,0,2,1,0,1.5,2,0];if(this.beat%2===0)this.tone(root,.26,.035,'triangle');const note=pattern[this.beat%8];if(note)this.tone(root*note*4,.2,.012,'sine');this.beat++;}
  update(speed,throttle,active){super.update(speed,throttle,active&&this.enabled);}
  collision(){this.tone(53,.18,.08,'sawtooth');}
  checkpoint(){this.tone(660,.17,.04);setTimeout(()=>this.tone(880,.25,.025),100);}
}
