import * as THREE from 'three';
import { seededRandom } from '../game/math.js';
import { canvasTexture } from './materials.js';
import { Batch } from './batch.js';

export class Marine {
  constructor(city){this.c=city;this.scene=city.scene;this.r=seededRandom(866);this.reef=new THREE.Group();this.scene.add(this.reef);this.reefBatch=new Batch(this.reef);this.buildReef();this.reefBatch.flush();this.buildWildlife();this.buildPlane();}
  buildReef(){
    const c=this.c,m=c.materials,r=this.r;
    const floor=new THREE.PlaneGeometry(360,320,42,38);floor.rotateX(-Math.PI/2);floor.translate(1020,-13,2710);
    const p=floor.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,-13+Math.sin(p.getX(i)*.033)*1.2+Math.cos(p.getZ(i)*.027)*.8);floor.computeVertexNormals();
    const ground=new THREE.Mesh(floor,m.sand);this.reef.add(ground);
    const stone=new THREE.IcosahedronGeometry(1,2);const rockMat=new THREE.MeshStandardMaterial({color:'#6e8277',roughness:1,bumpMap:m.sand.map,bumpScale:.1});
    const corals=['#bd719d','#b2a776','#bd8f65','#6b9b93'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.95}));
    const branch=new THREE.CylinderGeometry(.1,.19,1,7),weed=new THREE.ConeGeometry(.12,1,5);
    for(let i=0;i<100;i++){
      const x=925+r()*190,z=2610+r()*200,y=-12.5;
      this.reefBatch.add(stone,rockMat,x,y,z,1+r()*5,1+r()*2.5,1+r()*5,r()*6.28);
      if(i%3===0){for(let j=0;j<12;j++){const a=r()*6.28; this.reefBatch.add(branch,corals[i%4],x+Math.cos(a)*.7,y+2+r()*1.5,z+Math.sin(a)*.7,.8,1+r()*2,.8,a,(r()-.5)*.9);}}
      else{for(let j=0;j<5;j++)this.reefBatch.add(weed,m.leaf,x+(r()-.5)*3,y+1.4,z+(r()-.5)*3,1,2+r()*3,1,r()*6.28,(r()-.5)*.35);}
    }
    const rays=new THREE.Mesh(new THREE.CylinderGeometry(.5,12,28,12,1,true),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'varying vec2 vUv;void main(){gl_FragColor=vec4(.55,.88,.89,sin(vUv.x*3.14159)*vUv.y*.045);}'
    }));rays.position.set(1015,-5,2700);rays.rotation.z=.45;this.reef.add(rays);
  }
  buildWildlife(){
    const r=this.r;this.fish=[];const geo=new THREE.SphereGeometry(1,9,6),mat=new THREE.MeshStandardMaterial({color:'#a8b7a0',metalness:.25,roughness:.5});
    for(let i=0;i<38;i++){
      const g=new THREE.Group(),body=new THREE.Mesh(geo,mat);body.scale.set(.1,.2,.43);g.add(body);
      const tailGeo=new THREE.BufferGeometry();tailGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.37,0,.25,-.68,0,-.25,-.68],3));tailGeo.computeVertexNormals();
      const tail=new THREE.Mesh(tailGeo,new THREE.MeshStandardMaterial({color:'#839aa1',side:THREE.DoubleSide,roughness:.7}));g.add(tail);
      this.reef.add(g);this.fish.push({g,tail,x:970+r()*90,y:-5-r()*5,z:2650+r()*90,phase:r()*6.28});
    }
    const shellTexture=canvasTexture(512,(c,s)=>{
      c.fillStyle='#596345';c.fillRect(0,0,s,s);
      for(let y=-1;y<9;y++)for(let x=-1;x<9;x++){
        const cx=x*73+(y%2)*36,cy=y*63;c.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3;c.lineTo(cx+Math.cos(a)*39,cy+Math.sin(a)*39);}c.closePath();c.fillStyle=(x+y)%2?'#64724e':'#758059';c.fill();c.strokeStyle='#3e4b34';c.lineWidth=4;c.stroke();
      }
    });
    const shellMat=new THREE.MeshStandardMaterial({map:shellTexture,roughness:.6}),skin=new THREE.MeshStandardMaterial({color:'#798967',roughness:.75}),eyeMat=new THREE.MeshStandardMaterial({color:'#111b1c',roughness:.12});
    this.turtles=[];
    for(let i=0;i<3;i++){
      const g=new THREE.Group(),shell=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),shellMat);shell.scale.set(.83,.32,1.05);g.add(shell);
      const belly=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),new THREE.MeshStandardMaterial({color:'#b7b591',roughness:.8}));belly.scale.set(.76,.13,.94);belly.position.y=-.18;g.add(belly);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.24,14,10),skin);head.position.set(0,.02,1.22);head.scale.z=1.35;g.add(head);
      for(const side of[-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.027,8,6),eyeMat);eye.position.set(side*.2,.1,1.38);g.add(eye);}
      const flippers=[];
      for(const side of[-1,1])for(const front of[true,false]){
        const fin=new THREE.Mesh(new THREE.SphereGeometry(1,12,7),skin);fin.scale.set(front?.65:.34,.045,front?.27:.2);fin.position.set(side*(front?.87:.65),-.13,front?.4:-.75);fin.rotation.y=side*(front?-.55:.3);g.add(fin);flippers.push(fin);
      }
      g.position.set(1010+i*8,-6.5-i*.6,2700+i*12);this.reef.add(g);this.turtles.push({g,flippers,x:g.position.x,z:g.position.z,phase:i*2});
    }
  }
  buildPlane(){
    const g=new THREE.Group(),m=this.c.materials;
    const add=(geo,mat,x,y,z,rx=0,rz=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,0,rz);o.castShadow=true;g.add(o);return o;};
    add(new THREE.CapsuleGeometry(.85,9.5,5,14),m.white,0,0,0,Math.PI/2);
    add(new THREE.SphereGeometry(1,16,10),m.glass,0,.4,2.8).scale.set(.88,1.0,2.1);
    add(new THREE.BoxGeometry(23,.18,2.4),m.white,0,1.25,.3);
    for(const side of[-1,1]){add(new THREE.BoxGeometry(2,.22,2.4),m.yellow,side*10.5,1.26,.3);add(new THREE.CapsuleGeometry(.46,5,4,10),m.white,side*2.4,-2.2,.2,Math.PI/2);add(new THREE.BoxGeometry(.12,2.4,.12),m.rail,side*2.4,-1.1,1.5,0,side*.2);add(new THREE.BoxGeometry(.1,2.4,.12),m.rail,side*2.4,-1.1,-1.5,0,side*.2);}
    add(new THREE.BoxGeometry(6,.16,1.5),m.white,0,.5,-4.8);
    add(new THREE.BoxGeometry(.16,2.7,1.7),m.yellow,0,1.7,-4.6,0,.04);
    add(new THREE.CylinderGeometry(.6,.6,.3,16),m.dark,0,0,5.6,Math.PI/2);
    const prop=new THREE.Group();prop.position.set(0,0,5.85);for(const rz of[0,Math.PI/2]){const blade=new THREE.Mesh(new THREE.BoxGeometry(.17,3,.08),m.dark);blade.rotation.z=rz;prop.add(blade);}g.add(prop);
    g.position.set(1130,105,3230);g.rotation.y=2.7;this.scene.add(g);this.plane={g,prop};
  }
  update(time){
    for(const f of this.fish){const a=time*.08+f.phase;f.g.position.set(f.x+Math.cos(a)*17,f.y+Math.sin(a*.8)*.4,f.z+Math.sin(a)*17);f.g.rotation.y=-a;f.tail.rotation.y=Math.sin(time*8+f.phase)*.3;}
    for(const t of this.turtles){const a=time*.025+t.phase;t.g.position.set(t.x+Math.sin(a)*10,-6.5+Math.sin(a)*.3,t.z+Math.cos(a)*10);t.g.rotation.y=a;t.flippers.forEach((f,i)=>f.rotation.z=Math.sin(time*1.7+t.phase)*.22*(i<2?1:-1));}
    this.plane.g.position.x=1130+Math.sin(time*.008)*240;this.plane.g.position.z=3230-Math.sin(time*.012)*180;this.plane.g.position.y=105+Math.sin(time*.025)*7;this.plane.prop.rotation.z=time*35;
  }
}
