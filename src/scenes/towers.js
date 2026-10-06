import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ellipsePoints, polygonSlab, beltGeometry, ribbon } from './geometry.js';
import { palm, tree, shrub, planter } from './landscape.js';
import { bench, lamp, person, umbrella, lounger, car } from './props.js';
import { skyline } from './skyline.js';
import { addWater, boat, wake } from './water.js';
import { helicopter } from './atmosphere.js';

function curvedTower(b,{x,z,floors,rx,rz,base=15,phase=0}) {
  const white=[],glass=[],rails=[],floorHeight=3.6;
  const curtainMaterials=['#bab8a8','#686f70','#9e9f91','#83908c'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.86}));
  for(let floor=0;floor<floors;floor++) {
    const t=floor/(floors-1),crown=Math.max(0,(t-.87)/.13),y=base+floor*floorHeight;
    const width=rx*(1+.035*Math.sin(t*Math.PI*2+.3)-crown*.63),depth=rz*(1+.035*Math.sin(t*4)-crown*.46);
    const offsetX=Math.sin(t*2.8+phase)*2.3-crown*9,offsetZ=Math.sin(t*3+phase)*1.3;
    const outer=ellipsePoints(width,depth,0,96,phase+t*1.8,.035),recess=ellipsePoints(width-1.85,depth-1.85,0,96,phase+t*1.8,.035);
    const translate=g=>g.translate(x+offsetX,0,z+offsetZ);
    const slab=polygonSlab(outer,.34);slab.translate(x+offsetX,y,z+offsetZ);white.push(slab);
    white.push(translate(beltGeometry(outer,ellipsePoints(width-.18,depth-.18,0,96,phase+t*1.8,.035),y+.34,.15)));
    glass.push(translate(beltGeometry(recess,ellipsePoints(width-2,depth-2,0,96,phase+t*1.8,.035),y+.52,2.95,false)));
    rails.push(translate(beltGeometry(ellipsePoints(width-.32,depth-.32,0,96,phase+t*1.8,.035),ellipsePoints(width-.35,depth-.35,0,96,phase+t*1.8,.035),y+.45,.88,false)));
    const perimeter=ellipsePoints(width-1.8,depth-1.8,0,72,phase+t*1.8,.035);
    for(let j=0;j<72;j++) {
      const p=perimeter[j],a=j/72*Math.PI*2,py=y+1.94;
      b.cube(b.m.frame,x+offsetX+p.x,py,z+offsetZ+p.z,.055,2.9,.055);
      const rp=outer[Math.round(j/72*96)%96];
      b.cube(b.m.metal,x+offsetX+rp.x*.991,y+.91,z+offsetZ+rp.z*.991,.032,.95,.032);
      if((j+floor*3)%7===0) {
        const tangent=perimeter[(j+1)%72].clone().sub(p),angle=Math.atan2(-tangent.z,tangent.x);
        b.cube(curtainMaterials[(floor+j)%4],x+offsetX+p.x*.993,py,z+offsetZ+p.z*.993,tangent.length()*.55,2.7,.035,angle);
      }
      if(j%18===0 && floor%4===0) {
        const px=x+offsetX+rp.x*.975,pz=z+offsetZ+rp.z*.975;
        b.cylinderPart(b.m.cream,px,y+.64,pz,.25,.45);shrub(b,px,pz,.37,y+.72);
      }
    }
    b.stats.floors++;
  }
  for(const [parts,mat]of[[white,b.m.white],[glass,b.m.glass],[rails,b.m.glassRail]]) {
    const compatible=parts.map(g=>g.index?g.toNonIndexed():g),merged=mergeGeometries(compatible);
    new Set([...parts,...compatible]).forEach(g=>g.dispose());b.mesh(merged,mat);
  }
  const roofY=base+floors*floorHeight,crown=ellipsePoints(rx*.36,rz*.53);
  b.mesh(polygonSlab(crown,.45),b.m.cream,x-8,roofY,z);
  b.mesh(beltGeometry(crown,ellipsePoints(rx*.33,rz*.5),0,1.2),b.m.white,x-8,roofY,z);
  b.cube(b.m.dark,x-8,roofY+.55,z,rx*.24,1.2,rz*.31);
  b.cylinderPart(b.m.red,x-8,roofY+2.5,z,.06,2.8);
  b.stats.buildings++;
}

function podium(b) {
  const outline=ellipsePoints(67,37,0,112,.6,.045),inner=ellipsePoints(65.4,35.4,0,112,.6,.045);
  for(let floor=0;floor<5;floor++) {
    const y=2.3+floor*3;
    b.mesh(polygonSlab(outline,.35),b.m.white,-44,y,28);
    b.mesh(beltGeometry(inner,ellipsePoints(65.1,35.1,0,112,.6,.045),0,2.55,false),b.m.glassDark,-44,y+.38,28);
    for(let j=0;j<72;j++){const a=j/72*Math.PI*2;b.cube(b.m.frame,-44+Math.cos(a)*65.4,y+1.6,28+Math.sin(a)*35.4,.09,2.55,.09);}
  }
  b.mesh(polygonSlab(ellipsePoints(65,35),.5),b.m.cream,-44,17.5,28);
  for(let i=0;i<11;i++){const a=i/11*Math.PI*2;planter(b,-44+Math.cos(a)*56,28+Math.sin(a)*29,18,.9);}
  for(let i=0;i<22;i++){
    const a=i/22*Math.PI*2,x=-44+Math.cos(a)*57,z=28+Math.sin(a)*28;
    b.cube(b.m.cream,x,18.2,z,3.8,.5,3.5);shrub(b,x,z,1.4,18.3);
    if(i%3===0)palm(b,x,z,8+b.random()*3,18.4,1.1);else if(i%2===0)tree(b,x,z,7,2.7,18.4);
  }
  // Sculptural entry canopy between towers, curved rather than a straight bridge.
  const path=[new THREE.Vector3(-1,0,23),new THREE.Vector3(10,0,16),new THREE.Vector3(25,0,2),new THREE.Vector3(46,0,-4),new THREE.Vector3(70,0,-13)];
  b.mesh(ribbon(path,13,18),b.m.white);
  for(const [x,z]of[[10,16],[25,2],[62,-8]])b.cube(b.m.white,x,9,z,1.2,18,1.2);
}

function promenade(b) {
  const rockGeometry=new THREE.IcosahedronGeometry(1,0);
  const outer=ellipsePoints(132,78,0,128,.4,.035),inner=ellipsePoints(122,67,0,128,.4,.025);
  b.mesh(polygonSlab(outer,2.2),b.m.concrete,-22,-.2,-5);
  b.mesh(polygonSlab(inner,.12),b.m.grass,-22,2.08,-5);
  b.mesh(beltGeometry(outer,ellipsePoints(128,87,0,128,.4,.035),0,.16),b.m.cream,-22,2.1,-5);
  const r=b.random;
  for(let i=0;i<128;i++) {
    const a=i/128*Math.PI*2,px=-22+Math.cos(a)*132,pz=-5+Math.sin(a)*78;
    for(let j=0;j<3;j++)b.batch.add(rockGeometry,b.m.concrete,px+(r()-.5)*3,.15+r()*.7,pz+(r()-.5)*3,.65+r()*.45,.65+r()*.4,.65+r()*.45,a);
  }
  for(let i=0;i<36;i++) {
    const a=i/36*Math.PI*2,px=-22+Math.cos(a)*116,pz=-5+Math.sin(a)*63;
    palm(b,px,pz,13+r()*6,2.2,1.1+r()*.35);
    if(i%3===0)bench(b,-22+Math.cos(a)*127,-5+Math.sin(a)*72,2.2,-a);
    if(i%4===0)lamp(b,-22+Math.cos(a)*129,-5+Math.sin(a)*73,5,0,2.2);
    if(i%5===0)person(b,-22+Math.cos(a)*126,-5+Math.sin(a)*71,2.25,a);
  }
  for(let i=0;i<40;i++) {
    const x=-105+r()*205,z=-58+r()*121;
    if((x+48)**2/42**2+((z-14)/32)**2<1.2 || (x-45)**2/36**2+((z+28)/30)**2<1.2)continue;
    tree(b,x,z,9+r()*6,3+r()*2.5,2.2);
  }
  b.mesh(polygonSlab(ellipsePoints(15,9),.12),b.m.white,72,2.25,41);
  b.mesh(polygonSlab(ellipsePoints(13.5,7.5),.08),b.m.waterPool,72,2.4,41);
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2;lounger(b,72+Math.cos(a)*17,41+Math.sin(a)*11,2.4,a);if(i%3===0)umbrella(b,72+Math.cos(a)*20,41+Math.sin(a)*14,2.4,2.5,b.m.blue);}
}

function bridge(b) {
  b.cube(b.m.concrete,315,7.8,-157,280,.7,14);b.cube(b.m.asphalt,315,8.2,-157,280,.08,12);
  for(let x=178;x<458;x+=14){b.cube(b.m.white,x,9,-150,11,.09,.1);b.cube(b.m.white,x,9,-164,11,.09,.1);b.cube(b.m.concrete,x,8.6,-150,.12,1.3,.12);}
  for(let x=185;x<460;x+=28){b.cube(b.m.concrete,x,3.7,-157,1.6,7.6,9);}
  for(let x=200;x<450;x+=31)car(b,x,-158,Math.PI/2,'#b8c8c4',false,8.25);
}

export function buildTowers(b) {
  const sea=addWater(b,{color:'#497e77'});
  // Far riverbank leaves an open channel to the right of the island.
  b.cube(b.m.grass,0,-.3,-395,1800,.5,270);b.cube(b.m.concrete,0,.6,-260,1700,1.3,2);
  const westBank=[[-650,-600],[-650,51],[-226,60],[-138,69],[-110,42],[-90,-60],[-100,-600]].map(([x,z])=>new THREE.Vector3(x,0,z));
  b.mesh(polygonSlab(westBank,1.4),b.m.concrete,0,.1,0);b.mesh(polygonSlab(westBank,.12),b.m.grass,0,1.5,0);
  skyline(b,'towers');promenade(b);podium(b);
  curvedTower(b,{x:-48,z:18,floors:46,rx:35,rz:25,base:17.8,phase:.2});
  curvedTower(b,{x:33,z:-24,floors:53,rx:34,rz:26,base:8,phase:1.1});
  bridge(b);
  for(const [x,z,angle,large]of[[-42,92,-1.1,false],[136,35,-.8,false],[160,80,1.4,true],[127,103,.18,false],[128,-44,-.3,false]])boat(b,x,z,angle,large);
  wake(b,[[-42,92],[-12,102],[17,113],[52,107],[80,122]],3.4);
  wake(b,[[136,35],[151,47],[149,69],[163,84],[165,97]],4);
  wake(b,[[127,103],[120,128],[108,147],[109,166]],3.3);
  wake(b,[[128,-44],[126,-26],[118,-15]],2.5);
  helicopter(b,189,163,-80,.9);helicopter(b,-194,117,-175,.38,b.m.red);
  for(let i=0;i<24;i++)palm(b,170+i*8,-248+Math.sin(i)*7,9+b.random()*5);
  for(let i=0;i<48;i++){
    const x=-330+b.random()*190,z=-188+b.random()*220;
    if(i%2===0)palm(b,x,z,13+b.random()*7,1.6,1.1);else tree(b,x,z,10+b.random()*7,3+b.random()*3,1.6);
  }
  b.cube(b.m.asphalt,-270,1.64,-39,325,.13,9);b.cube(b.m.cream,-270,1.64,-31,325,.13,6);
  return {sea,camera:{position:[105,96,315],target:[25,81,-12],fov:42},title:'Waterfront towers',reference:'Vice_City_10.jpg',subtitle:'Twin towers · island promenade · Biscayne-inspired waterfront'};
}
