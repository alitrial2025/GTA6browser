import { MISSIONS } from './districts.js';

export function freshProgress(){return{version:1,cash:1500,xp:0,completed:{},pickups:[],district:0,color:'#267dab',upgrade:0};}
export function parseProgress(raw){
  try{const p=JSON.parse(raw);if(p?.version!==1)return freshProgress();const safe=freshProgress();
    safe.cash=Math.max(0,Math.min(1e8,Number(p.cash)||0));safe.xp=Math.max(0,Number(p.xp)||0);
    safe.district=Number.isInteger(p.district)&&p.district>=0&&p.district<5?p.district:0;
    safe.color=/^#[0-9a-f]{6}$/i.test(p.color)?p.color:safe.color;safe.upgrade=Math.max(0,Math.min(3,Number(p.upgrade)||0));
    for(const m of MISSIONS)if(Number.isFinite(p.completed?.[m.id])&&p.completed[m.id]>0)safe.completed[m.id]=p.completed[m.id];
    safe.pickups=Array.isArray(p.pickups)?[...new Set(p.pickups.filter(k=>typeof k==='string'&&/^[0-4]:[0-2]$/.test(k)))]:[];return safe;
  }catch{return freshProgress();}
}
export class CampaignProgress{
  constructor(progress=freshProgress()){this.progress=progress;this.run=null;this.lastOutcome=null;}
  start(id){const mission=MISSIONS.find(m=>m.id===id);if(!mission)throw new Error('Unknown mission');this.run={mission,checkpoint:0,elapsed:0};this.lastOutcome=null;return this.run;}
  update(dt,position){if(!this.run)return null;const run=this.run;run.elapsed+=Math.max(0,dt);if(run.elapsed>run.mission.limit){this.run=null;return this.lastOutcome={status:'failed',mission:run.mission};}
    const target=run.mission.route[run.checkpoint],radius=run.mission.district===3?10:6;
    if(Math.hypot(position.x-target[0],position.z-target[1])<=radius){run.checkpoint++;if(run.checkpoint===run.mission.route.length){const first=!this.progress.completed[run.mission.id];const best=this.progress.completed[run.mission.id];this.progress.completed[run.mission.id]=best?Math.min(best,run.elapsed):Math.max(.01,run.elapsed);
        if(first){this.progress.cash+=run.mission.reward;this.progress.xp+=500;}this.run=null;return this.lastOutcome={status:'completed',mission:run.mission,elapsed:run.elapsed,first,reward:first?run.mission.reward:0};
      }return{status:'checkpoint',checkpoint:run.checkpoint};}return null;
  }
  collect(district,index){const id=`${district}:${index}`;if(this.progress.pickups.includes(id))return false;this.progress.pickups.push(id);this.progress.cash+=400;this.progress.xp+=75;return true;}
  upgrade(){const price=2000*(this.progress.upgrade+1);if(this.progress.upgrade>=3||this.progress.cash<price)return false;this.progress.cash-=price;this.progress.upgrade++;return true;}
  get target(){return this.run?.mission.route[this.run.checkpoint];}
  get completed(){return Object.keys(this.progress.completed).length;}
}
