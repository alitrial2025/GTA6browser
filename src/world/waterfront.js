import * as THREE from 'three';
import { canvasTexture } from './materials.js';
import { createDetailedCharacter } from './detailed-character.js';

export class Waterfront {
  constructor(city) { this.c=city;this.m=city.materials;this.buildPub();this.buildYachts(); }
  buildPub() {
    const c=this.c,m=this.m,x=735,z=2680;
    c.solid(m.timber,x,3.4,z,29,6.8,19);c.buildingCount++;
    c.cube(m.greenWood,x,3.1,z+9.7,29,6.2,.15);
    c.cube(m.timber,x,.6,z+15,36,.35,11);
    c.solid(m.timber,x,0.6,z+15,36,.4,11);
    for(const px of[x-16,x-8,x+8,x+16]){
      c.cube(m.greenWood,px,3.4,z+19.7,.28,6.3,.28);
      c.cube(m.greenWood,px,2.1,z+19.7,.23,2.5,.23);
    }
    for(const dx of[-12,0,12]){c.cube(m.glass,x+dx,3.4,z+9.83,3.3,3.8,.07);c.cube(m.greenWood,x+dx-2,3.4,z+9.84,.28,4.4,.14);c.cube(m.greenWood,x+dx+2,3.4,z+9.84,.28,4.4,.14);}
    c.cube(m.greenWood,x,6.5,z+20,36,.3,.3);
    for(let j=0;j<10;j++){const px=x-15+j*3.3;c.cube(m.greenWood,px,2,z+20,.12,1.5,.12);c.cube(m.timber,px,1.8,z+20,3,1.2,.1);}
    // Corrugated sloping roofs and veranda beams.
    for(let px=x-18;px<x+18;px+=.7){
      c.batch.add(c.box,m.dark,px,7.1,z, .68,.12,23,0,0,-.11);
      c.batch.add(c.box,m.greenWood,px,6.7,z+15,.68,.1,11,0,0,.16);
    }
    for(let j=0;j<6;j++)c.cube(m.timber,x-15,.11+j*.12,z+25-j*.6,5,.14,.6);
    const signTexture=canvasTexture(1024,(ctx,s)=>{
      ctx.fillStyle='#678e7b';ctx.fillRect(0,0,s,s);ctx.fillStyle='#88a896';ctx.fillRect(15,275,s-30,475);
      const r=c.random;for(let i=0;i<8000;i++){ctx.fillStyle=r()>.5?'#dae1be':'#234b3e';ctx.globalAlpha=.08;ctx.fillRect(r()*s,r()*s,2+r()*7,1);}ctx.globalAlpha=1;
      ctx.strokeStyle='#d8c897';ctx.lineWidth=10;ctx.strokeRect(20,282,s-40,460);ctx.fillStyle='#f1eddb';ctx.textAlign='center';ctx.font='bold 66px serif';ctx.fillText('THE RUSTY ANCHOR',s/2,490);ctx.fillStyle='#e0ca82';ctx.font='italic 27px serif';ctx.fillText('Cold drinks. Good company. Ocean air.',s/2,570);
    });
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(25,8),new THREE.MeshStandardMaterial({map:signTexture,roughness:.9}));sign.position.set(x,8.5,z+10);c.scene.add(sign);
    // Weathered picnic tables with striped tops, bottles, stools, and planter beds.
    for(const [px,pz]of[[704,2711],[719,2715],[739,2721],[756,2714]]){
      c.cube(m.greenWood,px,1,pz,3.8,.15,1.7);c.cube(m.timber,px,.45,pz,2.4,.9,.18);
      for(const side of[-1,1]){c.cube(m.greenWood,px,.55,pz+side*1.2,4,.16,.45);c.cube(m.white,px+side*1.35,.45,pz,.22,.9,1.8);}
      c.cube(m.yellow,px,1.09,pz,3.8,.024,.18);
      c.batch.add(new THREE.CylinderGeometry(.07,.07,.4,6),m.glass,px+.6,1.28,pz);
    }
    for(const [px,pz]of[[709,2697],[763,2698],[710,2710],[765,2710]]){c.cube(m.timber,px,.6,pz,2,1.2,2);c.palm(px,pz,5);}
    for(const px of[704,768])for(let pz=2650;pz<2720;pz+=16)c.palm(px,pz,10+c.random()*5);
    // Utility poles and sagging wires create the roadside-town silhouette.
    for(let pz=2500;pz<2850;pz+=65){c.cube(m.trunk,632,5.6,pz,.23,11.2,.23);c.cube(m.timber,632,10,pz,3.2,.14,.14);
      for(const dx of[-1,0,1]){
        const points=[];for(let i=0;i<=15;i++){const t=i/15;points.push(new THREE.Vector3(632+dx,10-Math.sin(t*Math.PI)*1.1,pz+t*65));}
        const curve=new THREE.CatmullRomCurve3(points),wire=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.027,3,false),m.dark);c.scene.add(wire);
      }
    }
  }
  hull(length=12,width=3.8) {
    const s=new THREE.Shape();s.moveTo(-width*.4,-length*.5);s.lineTo(width*.4,-length*.5);s.quadraticCurveTo(width*.58,0,0,length*.5);s.quadraticCurveTo(-width*.58,0,-width*.4,-length*.5);
    const g=new THREE.ExtrudeGeometry(s,{depth:.9,bevelEnabled:true,bevelThickness:.35,bevelSize:.28,bevelSegments:3,steps:1});g.rotateX(-Math.PI/2);return g;
  }
  buildYachts() {
    const c=this.c,m=this.m;this.boats=[];
    for(let i=0;i<9;i++){
      const group=new THREE.Group(),large=i<3,length=large?23:10,width=large?6.5:3.2;
      const add=(g,mat,x,y,z)=>{const mesh=new THREE.Mesh(g,mat);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);return mesh;};
      add(this.hull(length,width),m.white,0,-.4,0);
      add(new THREE.BoxGeometry(width*.86,.13,length*.65),m.timber,0,.67,-length*.07);
      add(new THREE.BoxGeometry(width*.75,1.1,length*.3),m.white,0,1.35,-length*.08);
      add(new THREE.BoxGeometry(width*.66,.9,length*.24),m.glass,0,2.28,-length*.08);
      add(new THREE.BoxGeometry(width*.81,.16,length*.37),m.white,0,2.81,-length*.08);
      if(large){add(new THREE.BoxGeometry(width*.57,.85,length*.18),m.white,0,3.34,-length*.11);add(new THREE.BoxGeometry(width*.54,.1,length*.23),m.white,0,3.81,-length*.11);}
      for(const side of[-1,1]){
        const rail=new THREE.CatmullRomCurve3([new THREE.Vector3(side*width*.38,1.15,-length*.4),new THREE.Vector3(side*width*.43,1.15,0),new THREE.Vector3(side*.2,1.15,length*.46)]);
        add(new THREE.TubeGeometry(rail,16,.045,6,false),m.rail,0,0,0);
        for(let j=0;j<5;j++)add(new THREE.CylinderGeometry(.03,.03,.65,6),m.rail,side*width*.38,.88,-length*.36+j*length*.16);
        add(new THREE.BoxGeometry(.7,.6,1.4),m.dark,side*width*.2,.55,-length*.5-.5);
      }
      const x=large?865+i*39:800+(i-3)*21,z=large?1130+i*70:2780+(i-3)*24;
      const crew=[];
      if(large)for(let j=0;j<3;j++){const human=createDetailedCharacter(i*3+j);if(human){human.position.set(j%2?1.7:-1.7,1.1,j*2.7-5.5);human.rotation.y=j*1.6;group.add(human);crew.push(human);}}
      group.position.set(x,0,z);group.rotation.y=i*.7;c.scene.add(group);this.boats.push({group,x,z,phase:i*.8,moving:i>4,crew});
    }
  }
  update(time){this.boats.forEach(b=>{b.group.position.y=Math.sin(time*.7+b.phase)*.08;b.group.rotation.z=Math.sin(time*.8+b.phase)*.018;b.crew.forEach((h,i)=>h.userData.animate(time*.18+i,.3));if(b.moving){b.group.position.x=b.x+Math.sin(time*.025+b.phase)*100;b.group.position.z=b.z+Math.cos(time*.025+b.phase)*100;b.group.rotation.y=-time*.025-b.phase;}});}
}
