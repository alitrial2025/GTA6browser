import * as THREE from 'three';
import { paintedTexture } from './palette.js';
import { classicCar, car, person, fence, bench } from './props.js';
import { palm, tree } from './landscape.js';
import { utilityPole, wires } from './neighborhood.js';
import { polygonSlab } from './geometry.js';

function star(ctx,x,y,r) {ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.25:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.stroke();}
function mural(b,style) {
  const map=paintedTexture(1024,2048,(ctx,w,h)=>{
    const r=b.random;ctx.fillStyle='#d0c4a8';ctx.fillRect(0,0,w,h);
    if(style==='purple'){
      ctx.fillStyle='#9b78b6';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#675486';ctx.lineWidth=6;
      for(let i=0;i<9;i++) {ctx.fillStyle=i%2?'#c7b2cb':'#eee1b6';ctx.beginPath();ctx.moveTo(0,200+i*200);ctx.bezierCurveTo(180,30+i*200,320,370+i*200,500,190+i*200);ctx.bezierCurveTo(700,i*200,900,310+i*200,w,170+i*200);ctx.lineTo(w,310+i*200);ctx.bezierCurveTo(700,470+i*200,520,230+i*200,0,380+i*200);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.fillStyle='#f2e4b2';ctx.strokeStyle='#7b6573';ctx.lineWidth=9;ctx.font='bold 720px Georgia';ctx.textAlign='center';ctx.strokeText('P',w*.5,1320);ctx.fillText('P',w*.5,1320);
      ctx.fillStyle='#f4e5af';ctx.strokeStyle='#a68e67';for(const [x,y,rr]of[[270,160,65],[730,1100,72],[400,1490,67],[800,1740,60]])star(ctx,x,y,rr);
    }else if(style==='liberty'){
      ctx.fillStyle='#cfceb5';ctx.fillRect(0,0,w,h);
      const fill=(color,points)=>{ctx.fillStyle=color;ctx.strokeStyle='#707450';ctx.lineWidth=5;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();};
      fill('#759366',[[0,1980],[130,1510],[280,1360],[680,1380],[1000,1600],[1024,2048]]);
      fill('#bdd1a3',[[270,1410],[331,1080],[375,580],[690,590],[754,1190],[674,1580],[477,1720]]);
      fill('#d9cb8e',[[300,1380],[300,614],[420,393],[651,412],[745,622],[786,1440],[657,1220],[625,683],[445,686],[422,1270]]);
      fill('#dfd5a6',[[380,674],[656,662],[668,851],[583,1033],[452,1018],[378,842]]);
      fill('#9b9568',[[359,644],[441,538],[629,544],[688,633],[650,672],[403,681]]);
      for(let i=0;i<7;i++)fill('#bdc995',[[340+i*50,585],[347+i*50,350-Math.sin(i/6*Math.PI)*83],[376+i*47,577]]);
      ctx.strokeStyle='#696e4b';ctx.lineWidth=7;
      for(const x of[440,590]){ctx.beginPath();ctx.ellipse(x,764,41,20,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#626544';ctx.beginPath();ctx.ellipse(x,767,12,15,0,0,Math.PI*2);ctx.fill();}
      ctx.beginPath();ctx.moveTo(518,785);ctx.lineTo(505,849);ctx.lineTo(536,849);ctx.stroke();ctx.beginPath();ctx.moveTo(480,900);ctx.quadraticCurveTo(521,881,558,900);ctx.quadraticCurveTo(522,929,480,900);ctx.stroke();
      fill('#a87878',[[170,170],[254,47],[347,207],[477,159],[612,208],[721,321],[722,470],[500,446],[360,384],[203,378]]);
      ctx.font='bold 430px Georgia';ctx.textAlign='center';ctx.strokeStyle='#9f7566';ctx.lineWidth=8;ctx.strokeText('E',550,1470);ctx.fillStyle='#c98073';ctx.fillText('E',550,1470);
    }else{
      ctx.fillStyle='#ecdfbf';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2e6094';ctx.fillRect(0,h*.35,w,h*.12);ctx.fillStyle='#ad534c';ctx.fillRect(0,h*.24,w,h*.1);
      ctx.fillStyle='#788bae';ctx.strokeStyle='#d0b568';ctx.lineWidth=8;ctx.font='bold 670px Georgia';ctx.textAlign='center';ctx.strokeText('R',w*.5,h*.79);ctx.fillText('R',w*.5,h*.79);
      for(let i=0;i<16;i++){ctx.fillStyle=i%2?'#b56a5b':'#bbad5d';ctx.beginPath();ctx.arc(r()*w,h*.89+r()*h*.1,24+r()*25,0,Math.PI*2);ctx.fill();}
    }
    // Paint is worn and stained rather than perfectly flat digital artwork.
    for(let i=0;i<17000;i++){ctx.fillStyle=r()>.5?'#777161':'#efe6c9';ctx.globalAlpha=.035+r()*.09;ctx.fillRect(r()*w,r()*h,1+r()*6,2+r()*14);}ctx.globalAlpha=1;
    for(let i=0;i<55;i++){ctx.strokeStyle='#66685b';ctx.globalAlpha=.13;ctx.lineWidth=.5+r()*2;ctx.beginPath();const x=r()*w,y=r()*h;ctx.moveTo(x,y);ctx.lineTo(x+(r()-.5)*50,y+40+r()*95);ctx.stroke();}ctx.globalAlpha=1;
  });return new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:.024,roughness:.92});
}

export function motorcycle(b,x,z,angle=0,quad=false,color=b.m.red) {
  const group=new THREE.Group(),add=(g,m,px,py,pz)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(px,py,pz);mesh.castShadow=true;group.add(mesh);return mesh;};
  const wheel=(px,pz)=>{const o=add(new THREE.TorusGeometry(.34,.09,10,32),b.m.black,px,.44,pz);o.rotation.y=Math.PI/2;const rim=add(new THREE.CylinderGeometry(.23,.23,.11,24),b.m.metal,px,.44,pz);rim.rotation.z=Math.PI/2;};
  if(quad)for(const px of[-.56,.56])for(const pz of[-.63,.7])wheel(px,pz);else{wheel(0,-.74);wheel(0,.87);}
  add(new THREE.BoxGeometry(quad?.9:.38,.38,.6),b.m.metal,0,.7,-.05);add(new THREE.BoxGeometry(.37,.16,.74),b.m.black,0,1,-.35);
  const tank=add(new THREE.SphereGeometry(1,16,12),color,0,1,.14);tank.scale.set(.26,.22,.43);
  const fork=add(new THREE.CylinderGeometry(.045,.045,.85,8),b.m.metal,0,.75,.71);fork.rotation.x=-.22;
  add(new THREE.BoxGeometry(.78,.045,.045),b.m.metal,0,1.16,.52);
  for(const side of[-1,1]){add(new THREE.BoxGeometry(.17,.07,.08),b.m.black,side*.38,1.16,.52);if(quad)add(new THREE.BoxGeometry(.3,.09,.42),color,side*.5,.78,quad?.67:-.7);}
  const light=add(new THREE.CylinderGeometry(.1,.1,.07,16),b.m.white,0,.99,.75);light.rotation.x=Math.PI/2;
  group.position.set(x,0,z);group.rotation.y=angle;b.root.add(group);b.stats.vehicles++;return group;
}

function storefront(b) {
  b.flatBuilding(-15,-27,30,14,2,{floorHeight:4.2,material:b.m.brick,windows:false});
  for(let px=-27;px<-2;px+=5){
    const arch=new THREE.Shape();arch.moveTo(-1.65,0);arch.lineTo(1.65,0);arch.lineTo(1.65,4.2);arch.absarc(0,4.2,1.65,0,Math.PI,false);arch.lineTo(-1.65,0);
    const g=new THREE.ShapeGeometry(arch,20);b.mesh(g,b.m.blue,px,0,-19.94);
    b.cube(b.m.glassDark,px,2.6,-19.89,2,4.5,.035);
    b.mesh(new THREE.CircleGeometry(1.1,24),b.m.dark,px,6.5,-19.9);
  }
  b.sign('INCOME TAX',-13,3.95,-19.82,9,1.4,'#4f493b','#c2ab63');b.sign('BOOKS · MUSIC · LOCAL ART',-22,1.8,-19.8,8,.7,'#e4d9b9','#334969');
  // Psychedelic courtyard wall is an independent painted surface.
  const art=paintedTexture(1024,1024,(ctx,w,h)=>{
    const r=b.random;ctx.fillStyle='#9b725b';ctx.fillRect(0,0,w,h);
    for(let i=0;i<65;i++){const x=r()*w,y=r()*h;ctx.strokeStyle=['#d2b543','#68a3ab','#ae524a','#1e4354','#bb7c9d'][i%5];ctx.lineWidth=12+r()*23;ctx.beginPath();ctx.arc(x,y,18+r()*110,0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle='#dcb652';ctx.lineWidth=11;for(let i=0;i<15;i++){ctx.beginPath();const x=r()*w;ctx.moveTo(x,0);ctx.bezierCurveTo(x+130,300,x-210,600,x+40,h);ctx.stroke();}
  });b.mesh(new THREE.PlaneGeometry(15,9),new THREE.MeshStandardMaterial({map:art,roughness:.92}),-23,4.5,-17);
}

export function buildMuralStreet(b) {
  b.cube(b.m.asphalt,0,-.05,-45,50,.1,140);b.cube(b.m.cream,-9,.14,-38,4,.35,110);b.cube(b.m.cream,10,.14,-38,4,.35,110);
  b.cube(b.m.white,-6.9,.31,-35,.15,.24,120);b.cube(b.m.white,7.9,.31,-35,.15,.24,120);
  for(let z=-100;z<16;z+=6)b.cube(b.m.yellow,.1,.015,z,.065,.02,3);
  for(const [x,z,style,radius]of[[-3.8,.5,'purple',1.16],[6.1,-7,'liberty',1.08],[6.1,-30,'stripe',1.08],[-6.2,-28,'stripe',1.16],[6.1,-53,'stripe',1.08]]) {
    const mesh=b.mesh(new THREE.CylinderGeometry(radius,radius,12,64),mural(b,style),x,6,z);mesh.rotation.y=Math.PI+.22;
    b.cylinderPart(b.m.cream,x,.23,z,radius+.04,.46);b.cube(b.m.concrete,x,11.5,z,5,1.15,4.1);
  }
  b.cube(b.m.concrete,0,12.1,-34,16,1.8,93);b.cube(b.m.asphalt,0,13.08,-34,15,.1,93);
  for(const x of[-7.25,-3.5,0,3.5,7.25])b.cube(b.m.dark,x,10.95,-34,.24,1.25,93);
  for(const side of[-1,1])b.cube(b.m.concrete,side*8,13.5,-34,.4,1.2,94);
  // Black conduit follows the underside and wraps around column caps.
  for(const side of[-1,1]){const points=[new THREE.Vector3(side*7.4,10.9,7),new THREE.Vector3(side*7.4,10.2,-4),new THREE.Vector3(side*7.3,10.25,-25),new THREE.Vector3(side*7.4,10.4,-56)];b.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,.055,8,false),b.m.black);}
  storefront(b);palm(b,-12,-13,10,0,1.25);tree(b,-23,-7,8,4.4);b.cube(b.m.grass,-14,.09,-10,11,.1,6);
  const pole1=utilityPole(b,-10,-23,15),pole2=utilityPole(b,-5,-61,14),pole3=utilityPole(b,13,-50,14);wires(b,pole1,pole2,5);wires(b,pole1,pole3,4);wires(b,[-7,14,7],pole1,4);
  const hero=classicCar(b,.8,0,Math.PI-.65,'#267dab');
  car(b,4.3,-18,Math.PI,'#8e3030');car(b,.5,-43,Math.PI,'#b8c8c4',true);car(b,-2,-31,0,'#53616a');
  motorcycle(b,5.4,2,Math.PI,false);motorcycle(b,-9,-11,.45,true,b.m.waterPool);motorcycle(b,-14,-13,-.3,true,b.m.yellow);motorcycle(b,-10,-19,.5,false,b.m.blue);
  for(const [x,z,a]of[[-10,-7,0],[-12,-13,.8],[-15,-14,1.7],[-10,-19,0],[5.9,-11,3],[-8,1,1.2],[-9,2,-.4],[3,-29,.2]])person(b,x,z,.2,a);
  bench(b,-9,2,.26);fence(b,-17,-8,14,1.6,0,.2);
  const puddle=new THREE.MeshPhysicalMaterial({color:'#61756c',roughness:.06,metalness:.3,clearcoat:1});
  for(const [x,z,w]of[[-6,4,1.6],[-6,-7,1.2],[3.5,7,.7]]) {
    const points=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return new THREE.Vector3(x+Math.cos(a)*w*(.8+b.random()*.4),0,z+Math.sin(a)*w*.35*(.8+b.random()*.4));});b.mesh(polygonSlab(points,.005),puddle,0,.014,0);
  }
  for(let i=0;i<40;i++)b.cube(i%3===0?b.m.yellow:b.m.terracotta,-6.5+b.random()*1.4,.04,-7+b.random()*17,.035,.02,.07,b.random()*6);
  // Advertising billboard, road signs, background apartments and dense utility detail.
  b.cube(b.m.white,-5,16,-61,16,7,.35);b.sign('MANMAN',-5,18,-60.78,12,2.2,'#f0e6ce','#c76353');b.sign('Taste the sunshine',-5,15.9,-60.76,13,1,'#eee0b9','#73a3b2');
  for(let i=0;i<6;i++){b.cube([b.m.blue,b.m.yellow,b.m.red][i%3],-11+i*2.4,14.2,-60.71,1.5,2.1,.025);}
  b.flatBuilding(16,-67,19,18,14,{floorHeight:3.5});b.flatBuilding(-20,-77,29,22,8,{floorHeight:3.4});
  b.sign('NORTH 561',9,4.3,-19,1.5,.7,'#e7e9d8','#416955');b.sign('TO 10 / 97',9,3.4,-19,1.5,.6,'#e7e9d8','#3a5881');b.cube(b.m.metal,9,2.3,-19,.06,4.6,.06);
  for(let i=0;i<15;i++)palm(b,-29+b.random()*62,-87-b.random()*55,11+b.random()*8);
  const sea={water:{visible:false},fallback:{visible:false},update:()=>{}};
  return {sea,hero,camera:{position:[-3,2.65,8],target:[4,1.85,-12],fov:53},title:'Mural street',reference:'Vice_City_09.jpg',code:'VC09',subtitle:'Painted overpass · street life · classic coupe',atmosphere:{clouds:.32,fog:'#b5cbd1',fogNear:120,fogFar:620,sun:[-120,160,120]}};
}
