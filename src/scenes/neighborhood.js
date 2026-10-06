import * as THREE from 'three';
import { palm, tree, shrub } from './landscape.js';
import { classicCar, car, person, bench } from './props.js';
import { ribbon } from './geometry.js';
import { paintedTexture } from './palette.js';

export function utilityPole(b,x,z,height=11) {
  b.cylinderPart(b.m.trunk,x,height/2,z,.16,height);b.cube(b.m.wood,x,height-1,z,3.1,.15,.16);
  b.cylinderPart(b.m.concrete,x+.23,height-2.2,z,.29,1.1);
  for(const dx of[-1.1,0,1.1]){b.cylinderPart(b.m.white,x+dx,height-.72,z,.055,.3);b.cube(b.m.dark,x+dx,height-.7,z,.16,.035,.16);}
  return [x,height-1,z];
}
export function wires(b,start,end,strands=3) {
  for(let i=0;i<strands;i++) {
    const points=[],offset=(i-(strands-1)/2)*.7;
    for(let j=0;j<=20;j++){const t=j/20;points.push(new THREE.Vector3(THREE.MathUtils.lerp(start[0],end[0],t)+offset,THREE.MathUtils.lerp(start[1],end[1],t)-Math.sin(t*Math.PI)*1.8,THREE.MathUtils.lerp(start[2],end[2],t)));}
    b.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.019,4,false),b.m.dark);
  }
}

function dirtMaterial(b) {
  const map=paintedTexture(512,512,(ctx,w,h)=>{
    ctx.fillStyle='#74644b';ctx.fillRect(0,0,w,h);const r=b.random;
    for(let i=0;i<72000;i++){ctx.fillStyle=r()>.48?'#605235':'#a59270';ctx.globalAlpha=.08+r()*.35;ctx.fillRect(r()*w,r()*h,1+r()*4,1+r()*2);}ctx.globalAlpha=1;
    for(let i=0;i<80;i++){ctx.fillStyle='#5d6244';ctx.beginPath();ctx.ellipse(r()*w,r()*h,4+r()*18,2+r()*9,r()*6,0,Math.PI*2);ctx.fill();}
  });map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(20,20);
  return new THREE.MeshStandardMaterial({map,roughness:1,bumpMap:map,bumpScale:.035});
}

function trailer(b,x,z,width=13,depth=6,color='#b2b1a0',porch=true) {
  const r=b.random,map=paintedTexture(512,256,(ctx,w,h)=>{
    ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=13){ctx.fillStyle='#f1e2bd';ctx.globalAlpha=.19;ctx.fillRect(0,y,w,2);ctx.fillStyle='#37483b';ctx.globalAlpha=.34;ctx.fillRect(0,y+11,w,2);}
    for(let i=0;i<2300;i++){ctx.fillStyle=r()>.5?'#434735':'#dad3ba';ctx.globalAlpha=.1+r()*.2;ctx.fillRect(r()*w,r()*h,1+r()*15,1+r()*3);}ctx.globalAlpha=1;
  });const wall=new THREE.MeshStandardMaterial({map,roughness:.96,bumpMap:map,bumpScale:.045});
  b.cube(wall,x,2.2,z,width,3.1,depth);b.cube(b.m.dark,x,.6,z,width-.7,.7,depth-.4);b.stats.buildings++;
  b.cube(b.m.cream,x,3.78,z,width+.4,.16,depth+.35);
  for(let dx=-width/2+.6;dx<width/2-.3;dx+=2.4){
    b.cube(b.m.cream,x+dx,2.33,z+depth/2+.06,1.7,1.6,.12);b.cube(b.m.glassDark,x+dx,2.33,z+depth/2+.13,1.4,1.32,.04);
    b.cube(b.m.white,x+dx,2.33,z+depth/2+.17,.06,1.4,.04);
    for(let y=1.75;y<3;y+=.1)b.cube(b.m.cream,x+dx,y,z+depth/2+.18,1.4,.03,.025);
  }
  b.cube(b.m.concrete,x-width/2+.9,1.9,z+depth/2+.2,1.1,2.7,.15);b.cylinderPart(b.m.metal,x-width/2+1.2,2,z+depth/2+.3,.035,.1,0,0,Math.PI/2);
  b.cube(b.m.cream,x+width/2+.26,2.25,z+1.1,.8,.65,.8);b.cube(b.m.dark,x+width/2+.68,2.25,z+1.1,.04,.5,.6);
  b.cylinderPart(b.m.metal,x+2,4.4,z-1,.07,1.3);b.cube(b.m.dark,x+2,5.03,z-1,.35,.1,.35);
  for(let i=0;i<3;i++)b.cube(b.m.white,x-width/2+1,.7-i*.2,z+depth/2+.8+i*.45,2.1,.16,.5);
  if(porch){
    b.cube(b.m.wood,x,.75,z+depth/2+1.8,width-2,.22,3.1);
    for(const dx of[-width/2+1,0,width/2-1]){b.cube(b.m.white,x+dx,2.23,z+depth/2+3,.11,3,.11);for(let y=1;y<3.5;y+=.5){b.beam(b.m.white,[x+dx-.15,y,z+depth/2+3],[x+dx+.15,y+.4,z+depth/2+3],.025);b.beam(b.m.white,[x+dx+.15,y,z+depth/2+3],[x+dx-.15,y+.4,z+depth/2+3],.025);}}
    b.cube(b.m.wood,x,3.8,z+depth/2+1.8,width-1,.11,3.7,0,0,.08);
    for(let dx=-width/2+.5;dx<width/2;dx+=.32)b.cube(b.m.metal,x+dx,3.88,z+depth/2+1.8,.022,.025,3.7,0,0,.08);
    bench(b,x+2,z+depth/2+2.5,.85);person(b,x+1,z+depth/2+2,.91);person(b,x-1,z+depth/2+2,.91,1.3);
  }
  for(const [dx,dz]of[[width/2+2,2],[-width/2-1,-1]]){b.cube(b.m.blue,x+dx,.65,z+dz,1.8,1.3,1.2);b.cube(b.m.dark,x+dx,1.31,z+dz,1.88,.12,1.26);}
  return wall;
}

function waterTower(b) {
  const x=-62,z=-113,y=21;
  b.cylinderPart(b.m.brick,x,y,z,3.2,6.4);b.cylinderPart(b.m.dark,x,y+3.2,z,3.4,.12);
  const roof=new THREE.ConeGeometry(3.25,1.2,32);b.mesh(roof,b.m.brick,x,y+3.8,z);
  for(const dx of[-2.4,2.4])for(const dz of[-2.4,2.4])b.cube(b.m.metal,x+dx,9,z+dz,.15,18,.15);
  for(let h=0;h<18;h+=5)for(const side of[-1,1]){b.beam(b.m.metal,[x-2.4,h,z+side*2.4],[x+2.4,h+5,z+side*2.4],.055);b.beam(b.m.metal,[x+side*2.4,h,z-2.4],[x+side*2.4,h+5,z+2.4],.055);}
  b.sign('GELLHORN',x,22,z+3.22,5.5,1,'#d1bc9c');
}

export function buildNeighborhood(b) {
  const r=b.random,dirt=dirtMaterial(b);b.cube(dirt,0,-.16,-40,350,.3,320);
  const road=new THREE.MeshStandardMaterial({color:'#b19778',bumpMap:dirt.map,bumpScale:.06,roughness:1});
  for(const points of[[[-38,65],[-28,26],[-44,-5],[-32,-54],[-41,-130]],[[55,65],[29,23],[26,-21],[46,-57],[33,-140]],[[-64,-16],[-19,-21],[26,-21],[68,-44]]]){
    const path=points.map(([x,z])=>new THREE.Vector3(x,0,z));b.mesh(ribbon(path,5.5,.018),road);
    for(const offset of[-1.1,1.1])b.mesh(ribbon(path.map(p=>new THREE.Vector3(p.x+offset,0,p.z)),.14,.024),new THREE.MeshStandardMaterial({color:'#8b7457',roughness:1}));
  }
  trailer(b,-6,14,15,7,'#747c69');trailer(b,21,-12,14,6,'#c3bd9f');trailer(b,-34,-19,13,7,'#a8a18e');trailer(b,-7,-54,12,6,'#a09d81');trailer(b,40,-64,15,6,'#a78e79',false);
  trailer(b,-58,16,14,6,'#b2ac91');trailer(b,48,43,16,8,'#c0b7a0');
  classicCar(b,8,24,-1.1,'#8e3030');classicCar(b,-24,10,.3,'#c5ad73');car(b,34,-38,0,'#d3cdbb');car(b,-26,-51,0,'#53616a');
  for(let i=0;i<15;i++)person(b,-43+r()*90,-40+r()*90,.07,r()*6,i%3===0);
  // Random grass blades and rocks populate the neglected yards at ground level.
  const blade=new THREE.BufferGeometry();blade.setAttribute('position',new THREE.Float32BufferAttribute([-.04,0,0,.04,0,0,0,.55,.1],3));blade.computeVertexNormals();
  const rock=new THREE.IcosahedronGeometry(1,0);
  for(let i=0;i<2200;i++){
    const x=-82+r()*169,z=-140+r()*195;
    if((Math.abs(x+6)<10&&Math.abs(z-14)<8)||(Math.abs(x-27)<5&&z>-40)||(Math.abs(x+35)<5&&z<30))continue;
    b.batch.add(blade,b.m.leaf[i%4],x,.03,z,1, .35+r()*.85,1,r()*Math.PI*2);
    if(i%60===0)b.batch.add(rock,b.m.concrete,x,.12,z,.15+r()*.4,.14,.2+r()*.3);
  }
  for(let i=0;i<50;i++){
    const x=-100+r()*205,z=-144+r()*178;
    if(Math.abs(x)<18 && z>0)continue;
    if(i%3===0)palm(b,x,z,8+r()*8);else tree(b,x,z,7+r()*6,3+r()*3);
  }
  for(const [x,z,h]of[[-49,29,12],[20,17,11],[42,-4,14],[-18,-74,15]])palm(b,x,z,h,0,1.3);
  const poles=[[-23,39],[-38,1],[-31,-51],[-42,-105],[43,25],[28,-15],[48,-70],[30,-118]].map(([x,z])=>utilityPole(b,x,z,11+r()*3));
  for(const start of[0,4])for(let i=start;i<start+3;i++)wires(b,poles[i],poles[i+1],4);wires(b,poles[2],poles[6],4);wires(b,poles[1],poles[5],3);
  waterTower(b);
  for(const [x,z]of[[-77,-43],[67,-27],[9,-98],[60,-108],[-91,-98],[76,4]])trailer(b,x,z,12,6,'#a59c87',false);
  for(let i=0;i<110;i++){const x=-95+r()*182,z=-90+r()*136;if(Math.abs(x-27)<6||Math.abs(x+35)<6)continue;shrub(b,x,z,.4+r()*.8);}
  b.cylinderPart(b.m.cream,-97,8,-114,13,16);b.mesh(new THREE.ConeGeometry(13,2.5,40),b.m.metal,-97,17.25,-114);b.sign('GELLHORN STORAGE',-97,10,-100.9,19,2,'#797466');
  b.flatBuilding(-78,-76,27,13,2,{floorHeight:3.2,material:b.m.cream});
  // Hazy forested hills and transmission pylons establish the distant horizon.
  for(let i=0;i<65;i++){const x=-145+r()*320,z=-162-r()*90;tree(b,x,z,11+r()*11,4+r()*4,2+r()*3);}
  for(const x of[-103,-44,38]){
    for(const side of[-1,1])b.beam(b.m.metal,[x+side*3,0,-154],[x+side*.4,26,-154],.12);
    for(let y=5;y<25;y+=5){b.beam(b.m.metal,[x-2.7+y*.08,y,-154],[x+2.7-y*.08,y+5,-154],.08);b.cube(b.m.metal,x,y+2,-154,8,.12,.12);}
  }
  const sea={water:{visible:false},fallback:{visible:false},update:()=>{}};
  return {sea,camera:{position:[33,18,54],target:[-6,6,-30],fov:56},title:'Port Gellhorn',reference:'Port_Gellhorn_06.jpg',code:'PG06',subtitle:'Sunset · trailer yards · utility lines',atmosphere:{sunset:true,clouds:.62,fog:'#ae7e65',fogNear:65,fogFar:380,sun:[80,25,-240]}};
}
