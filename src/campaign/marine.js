import * as THREE from 'three';
export class MarinePhysics{
  constructor(group,onCollision){this.group=group;this.onCollision=onCollision;this.position=new THREE.Vector3();this.speed=0;this.heading=0;this.time=0;this.topSpeed=28;}
  reset(spawn){this.position.set(spawn.x,.1,spawn.z);this.speed=0;this.heading=spawn.heading;this.sync();}
  update(dt,input,occupied){const throttle=occupied?input.throttle:0;this.speed+=(throttle*9-this.speed*.25-Math.sign(this.speed)*.05)*dt;if(input.handbrake)this.speed*=Math.exp(-dt*2.5);this.speed=THREE.MathUtils.clamp(this.speed,-7,this.topSpeed);
    this.heading+=(occupied?input.steer:0)*Math.min(1,Math.abs(this.speed)/6)*dt*.8*Math.sign(this.speed||1);this.position.x+=Math.sin(this.heading)*this.speed*dt;this.position.z+=Math.cos(this.heading)*this.speed*dt;this.time+=dt;this.sync();}
  sync(){this.group.position.copy(this.position);this.group.position.y=.12+Math.sin(this.time*2.3)*.06;this.group.rotation.set(Math.sin(this.time*1.3)*.008,this.heading,Math.sin(this.time*1.7)*.016);}
  get overturned(){return false;}
}
