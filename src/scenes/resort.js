import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { polygonSlab, beltGeometry, ellipsePoints } from './geometry.js';
import { palm, tree, shrub, planter } from './landscape.js';
import { basketballCourt, umbrella, lounger, terrace, fence, bench, person, bus, car, lamp } from './props.js';
import { addWater, boat } from './water.js';
import { skyline } from './skyline.js';
import { birds, helicopter } from './atmosphere.js';

function roundedOutline(w,d,r=3) {
  const points=[];
  for(const [x,z,start]of[[w/2-r,d/2-r,0],[-w/2+r,d/2-r,Math.PI/2],[-w/2+r,-d/2+r,Math.PI],[w/2-r,-d/2+r,Math.PI*1.5]])for(let i=0;i<13;i++){
    const a=start+i/12*Math.PI/2;points.push(new THREE.Vector3(x+Math.cos(a)*r,0,z+Math.sin(a)*r));
  }
  return points;
}

function resortTower(b) {
  const x=-23,z=-35,base=12,floors=12,fh=5.8,w=25,d=28;
  b.cube(b.m.white,x,base+floors*fh/2,z,w,floors*fh,d);b.stats.buildings++;
  const balconyParts=[],railParts=[];
  for(let floor=0;floor<floors;floor++) {
    const y=base+floor*fh;
    const outer=roundedOutline(w+4,d+5,4),inner=roundedOutline(w+3.7,d+4.7,3.9);
    const slab=polygonSlab(outer,.22);slab.translate(x,y,z);balconyParts.push(slab);
    const rail=beltGeometry(outer,inner,y+.28,1.04,false);rail.translate(x,0,z);railParts.push(rail);
    b.cube(b.m.glass,x,y+fh*.53,z+d/2+.02,w-1.3,fh-.5,.06);
    b.cube(b.m.glass,x-w/2-.02,y+fh*.53,z,.06,fh-.5,d-1.1);
    for(let dx=-w/2+.8;dx<=w/2;dx+=3.4){
      b.cube(b.m.frame,x+dx,y+fh*.53,z+d/2+.12,.09,fh-.4,.08);
      b.cube(b.m.metal,x+dx,y+.83,z+(d+5)/2,.055,1.1,.055);
      if(floor%3===0 && Math.round(dx)%2===0)b.cube(b.m.cream,x+dx+1,y+fh*.53,z+d/2+.08,1.3,fh-.6,.055);
    }
    for(let dz=-d/2+1;dz<=d/2;dz+=3.4)b.cube(b.m.frame,x-w/2-.1,y+fh*.53,z+dz,.08,fh-.4,.09);
    for(const side of[-1,1]){
      b.cube(b.m.white,x+side*(w/2+1),y+fh*.5,z+d/2+1.9,.14,fh-.2,.14);
      b.cube(b.m.dark,x+side*6,y+.67,z+d/2+1.2,1.6,.12,.7);
      b.cube(b.m.dark,x+side*6,y+1.07,z+d/2+1.2,.9,.9,.25);
    }
    b.stats.floors++;
  }
  b.mesh(mergeGeometries(balconyParts),b.m.white);b.mesh(mergeGeometries(railParts),b.m.glassRail);balconyParts.forEach(g=>g.dispose());railParts.forEach(g=>g.dispose());
  const height=base+floors*fh;
  b.cube(b.m.cream,x,height+.12,z,w+2,.35,d+2);
  b.cube(b.m.brick,x+5,height+2.1,z-5,19,4,13);
  for(let dy=0;dy<5;dy++)b.cube(b.m.dark,x,height+1+dy*.8,z+d/2,29,.2,.2);
  for(let dx=-13;dx<15;dx+=4)b.cube(b.m.dark,x+dx,height+2.6,z+d/2,.15,4,.15);
  b.sign('HOTEL VALETTA',x+6,height+4,z+1.6,13,1.8,'#ddd8cc');
  // Solid rear/side wing has tall paired window strips and deep white piers.
  b.cube(b.m.white,14,42,-42,48,73,27);
  for(const px of[-4,7,18,31])for(let floor=0;floor<12;floor++) {
    const y=10+floor*5.7;
    b.cube(b.m.glass,px,y,-28.4,2.3,5.25,.09);b.cube(b.m.white,px,y,-28.3,.09,5.26,.13);
    b.cube(b.m.cream,px,y+2.7,-28.1,2.5,.18,.5);
  }
  b.flatBuilding(43,-38,15,25,12,{base:8,floorHeight:5.7,balconies:true});
  b.cube(b.m.white,14,79,-42,49,1,28);b.cube(b.m.white,4,81,-39,3,3,4);
}

function lowHotel(b) {
  const x=61,z=10,w=75,d=26;
  b.flatBuilding(x,z,w,d,7,{base:6,floorHeight:4.6,balconies:true});
  b.cube(b.m.white,61,3,20,86,6,45);
  for(let floor=0;floor<2;floor++)for(let dx=-39;dx<43;dx+=3.1) {
    b.cube(b.m.glass,61+dx,1.7+floor*2.9,42.56,2.3,2.3,.07);
    b.cube(b.m.frame,61+dx,1.7+floor*2.9,42.62,.1,2.3,.1);
  }
  // A tall warm masonry stair core anchors the right elevation.
  b.cube(b.m.brick,94,21.8,20,8,43.6,22);b.cube(b.m.white,97.5,21.8,20,.65,43.6,22);
  b.sign('HOTEL',94,40,31.1,7,1.7);b.sign('VALETTA',94,38.2,31.1,7,1.6);
  for(let i=0;i<8;i++)b.cube(b.m.white,91.3+i*.75,21,31.17,.16,25,.09);
  // External switchback stairs: individual treads, landings, stringers, railings.
  for(let flight=0;flight<6;flight++){
    const direction=flight%2===0?1:-1,y0=4+flight*5.1,x0=direction===1?98.8:109.2;
    for(let step=0;step<18;step++)b.cube(b.m.white,x0+direction*step*.57,y0+step*.283,19, .62,.18,3.2);
    b.beam(b.m.white,[x0,y0-.15,17.3],[x0+direction*10,y0+4.9,17.3],.4);
    b.beam(b.m.white,[x0,y0-.15,20.7],[x0+direction*10,y0+4.9,20.7],.4);
    for(const zz of[17.45,20.55]){b.beam(b.m.metal,[x0,y0+1.05,zz],[x0+direction*10,y0+6.1,zz],.055);for(let j=0;j<7;j++)b.cube(b.m.metal,x0+direction*j*1.6,y0+j*.8+.56,zz,.045,1.1,.045);}
    b.cube(b.m.white,x0+direction*10,y0+5.1,19,3,.3,3.7);
  }
  // Roof umbrellas are a repeated blue rhythm prominent in the source image.
  for(let px=27;px<96;px+=8.5){umbrella(b,px,13,38.7,3,b.m.blue);lounger(b,px-1.8,15.8,38.7);lounger(b,px+1.8,15.8,38.7);}
  for(let px=30;px<90;px+=12) {b.cube(b.m.cream,px,39.2,-.5,1.5,.85,1.5);b.cylinderPart(b.m.metal,px,39.8,-.5,.44,.28);}
  for(let px=25;px<89;px+=7)planter(b,px,23,11,.5);
  // Curved waterfront restaurant terrace.
  const outline=[new THREE.Vector3(66,0,29),new THREE.Vector3(112,0,29)];
  for(let i=0;i<=24;i++){const a=i/24*Math.PI/2;outline.push(new THREE.Vector3(112+Math.sin(a)*13,0,42+Math.cos(a)*13));}outline.push(new THREE.Vector3(66,0,55));
  b.mesh(polygonSlab(outline,3.5),b.m.concrete,0,.6,0);b.mesh(polygonSlab(outline,.16),b.m.cream,0,4.1,0);
  const curve=new THREE.CatmullRomCurve3(outline.slice(1,-1));b.mesh(new THREE.TubeGeometry(curve,32,.06,6,false),b.m.metal,0,5.23,0);
  for(let i=0;i<20;i++){const p=curve.getPoint(i/19);b.cube(b.m.metal,p.x,4.69,p.z,.055,1.1,.055);}
  for(let px=73;px<117;px+=8){umbrella(b,px,43,4.3,1.8,b.m.white,false);lounger(b,px,46,4.3,Math.PI/2,b.m.cream);planter(b,px,49,4.3,.5);}
}

function courtyard(b) {
  b.cube(b.m.cream,1,1,18,60,2,43);
  b.cube(b.m.white,0,2.06,21,31,.15,15);b.cube(b.m.waterPool,0,2.16,21,28,.11,12);
  // Pool rails, springboard, cabanas, seating, and planting islands.
  for(const px of[-9,9]){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(px,2.1,27),new THREE.Vector3(px,3.2,27),new THREE.Vector3(px,3.2,25.8),new THREE.Vector3(px,2.1,25.8)]);
    b.mesh(new THREE.TubeGeometry(curve,16,.033,6,false),b.m.metal);
  }
  for(let px=-24;px<30;px+=7){lounger(b,px,9,2.1);lounger(b,px,34,2.1,Math.PI);umbrella(b,px,39,2.1,2.5,b.m.blue);}
  for(const [x,z]of[[-28,26],[27,22],[-17,39],[19,37],[4,45]]){
    b.cube(b.m.brick,x,2.4,z,5,.6,5);palm(b,x,z,11+b.random()*3,2.7);shrub(b,x+1.1,z,1.2,2.7);
  }
  for(const x of[-12,12]){
    for(const dx of[-2,2])for(const dz of[-2,2])b.cube(b.m.white,x+dx,3.7,45+dz,.12,3.2,.12);
    b.cube(b.m.blue,x,5.2,45,4.8,.12,4.8);
  }
  b.cube(b.m.white,-25,7,-3,41,10,20);for(let dx=-44;dx<-5;dx+=3.2)b.cube(b.m.glass,dx,7,-3+10.06,2.3,7,.07);
  terrace(b,-25,-1,43,17,12.3,true);
  for(let x=-44;x<-3;x+=5.5)umbrella(b,x,5,12.5,2.4,b.m.blue);
  for(let i=0;i<8;i++)person(b,-20+b.random()*47,4+b.random()*35,2.25,b.random()*6);
  for(const [x,z]of[[-52,26],[-36,43],[-15,52],[18,49],[41,42],[60,46],[76,57]])palm(b,x,z,13+b.random()*4);
}

function streets(b) {
  b.cube(b.m.asphalt,0,.07,78,470,.15,16);
  for(const side of[-1,1]){
    b.cube(b.m.cream,0,.23,78+side*10,470,.35,4);
    b.cube(b.m.white,0,.24,78+side*8.1,470,.18,.17);
  }
  b.cube(b.m.asphalt,-61,.08,-35,12,.14,212);
  for(let x=-230;x<235;x+=5)b.cube(b.m.yellow,x,.163,78,2.7,.014,.065);
  for(let x=-230;x<235;x+=7)for(const dz of[-4,4])b.cube(b.m.white,x,.164,78+dz,3,.012,.07);
  for(const x of[-58,135])for(let dx=-4;dx<5;dx+=1)b.cube(b.m.white,x+dx,.169,76,.5,.014,12);
  const colors=['#b8c8c4','#b54137','#d3cdbb','#53616a'];
  bus(b,49,75,Math.PI/2);car(b,27,75,Math.PI/2,colors[3],true);car(b,111,81,-Math.PI/2,colors[0],true);
  for(const [i,x]of[-155,-111,-82,-15,6,81,151,175].entries())car(b,x,i%2?75:81,i%2?Math.PI/2:-Math.PI/2,colors[i%4]);
  for(let z=-110;z<45;z+=14)car(b,-61,z,0,colors[Math.abs(z)%4]);
  // Lower foreground street and a landscaped turning circle.
  b.cube(b.m.asphalt,34,.05,112,152,.13,11);b.cube(b.m.cream,34,.22,121,152,.34,6);
  for(const x of[-16,19,65,81])car(b,x,112,-Math.PI/2,colors[Math.floor(Math.abs(x))%4]);
  b.mesh(polygonSlab(ellipsePoints(20,14),.15),b.m.cream,89,.2,130);b.mesh(polygonSlab(ellipsePoints(18,12),.13),b.m.grass,89,.4,130);
  for(const [x,z]of[[86,126],[95,131],[81,135]])palm(b,x,z,12+b.random()*5,.5);
  for(let x=-170;x<201;x+=22){
    palm(b,x,66,11+b.random()*5);lamp(b,x+5,68,8,Math.PI/2);bench(b,x,88);if(x%3===0)person(b,x+4,87,.41,b.random()*6);
  }
  for(let x=-30;x<160;x+=27)person(b,x,91,.05,b.random()*6,true);
  // Glass bus shelter and curbside furniture.
  for(const px of[64,71])b.cube(b.m.metal,px,1.7,87,.055,3.3,.055);
  b.cube(b.m.foliage[1],67.5,3.35,87,8,.13,3);
  b.cube(b.m.glassRail,67.5,1.8,88.35,7,2.8,.03);bench(b,67.5,88,.2);
  b.cylinderPart(b.m.dark,75,.9,87,.33,1.4);
}

function foreground(b) {
  const courtBase=12.5;
  b.cube(b.m.white,-94,6.1,116,44,12.2,58);
  basketballCourt(b,-94,128,courtBase,29,16);basketballCourt(b,-94,104,courtBase,29,16,b.m.courtGreen);
  for(let i=0;i<7;i++)person(b,-105+b.random()*26,98+b.random()*41,courtBase+.05,b.random()*6);
  const ball=new THREE.SphereGeometry(.12,12,8);b.batch.add(ball,b.m.terracotta,-90,courtBase+.13,116);
  b.cube(b.m.white,-48,8.2,131,18,16.4,30);
  b.cube(b.m.white,-46,16.6,131,21,.35,33);
  terrace(b,-46,131,18,28,16.8,false);
  // Foreground roof and a visible broad stair flight beneath the reference camera.
  b.cube(b.m.white,-11,3.9,181,29,7.8,31);b.cube(b.m.cream,-11,8,181,29,.2,31);
  for(let i=0;i<19;i++)b.cube(b.m.white,8,1+i*.4,177-i*.55,7,.15,.57);
  fence(b,-45,121,58,1.05,Math.PI/2,16.8);
  person(b,-43,130,16.95,-.9);
  // Roof planting is dense in the reference, spilling over the near edge.
  for(const [x,z,h]of[[-64,145,12],[-71,134,14],[-60,120,15],[-42,155,13],[-34,143,12],[-81,88,16],[-48,96,14],[-54,87,16]])palm(b,x,z,h,courtBase,.9);
  for(let i=0;i<12;i++)shrub(b,-57+b.random()*15,118+b.random()*38,1.2,courtBase);
  for(let i=0;i<17;i++)palm(b,-73+b.random()*36,122+b.random()*36,10+b.random()*6,courtBase,1.4);
  b.cube(b.m.white,-142,42,120,17,84,36); // cropped left building anchors the balcony viewpoint.
}

function neighbors(b) {
  b.flatBuilding(-112,-42,38,28,2,{floorHeight:5.5});b.flatBuilding(-86,-68,33,34,7,{floorHeight:4.1});
  // Glass office block and the folded white rooftop sculpture to the left.
  b.cube(b.m.glass,-90,23,-121,68,43,37);
  for(let x=-124;x<-55;x+=2.6)b.cube(b.m.frame,x,23,-102.4,.095,43,.1);
  for(let y=2;y<45;y+=3)b.cube(b.m.frame,-90,y,-102.35,68,.13,.12);
  for(const side of[-1,1])b.cube(b.m.white,-89+side*16,51,-118,17,.7,24,0,side*.62);
  b.flatBuilding(173,-19,40,32,7,{floorHeight:3.5,balconies:true});
  b.flatBuilding(150,-75,45,36,5,{floorHeight:3.3,balconies:true});
  b.flatBuilding(185,-116,39,30,28,{floorHeight:3.5,balconies:true});
  const medallion=new THREE.Mesh(new THREE.CircleGeometry(3.2,32),b.m.cream);medallion.position.set(185,103,-100.7);b.root.add(medallion);
  b.flatBuilding(150,30,27,25,3,{floorHeight:3.6});b.cube(b.m.cream,151,11,30,29,.4,28);
  for(let z=-95;z<64;z+=22){palm(b,136,z,13+b.random()*7);tree(b,152+b.random()*39,z,11+b.random()*6,4+b.random()*2);}
  for(let i=0;i<40;i++){
    const x=-180+b.random()*125,z=-145+b.random()*213;
    if(Math.abs(x+61)<12)continue;
    if(i%3===0)palm(b,x,z,12+b.random()*7);else tree(b,x,z,9+b.random()*5,3+b.random()*3);
  }
  // Fill the midground with smaller streets and blocks before the hazy skyline.
  for(const z of[-180,-270,-370]) {
    b.cube(b.m.asphalt,-6,.06,z,480,.16,10);b.cube(b.m.cream,-6,.09,z+7,480,.2,4);
    for(let x=-208;x<201;x+=63) {
      if(z===-180 && x>90)continue;
      const floors=3+Math.floor(b.random()*7);
      b.flatBuilding(x,z-30,29+b.random()*12,26+b.random()*12,floors,{floorHeight:3.2,material:b.m.white});
      for(const dx of[-20,20])palm(b,x+dx,z-11,10+b.random()*8);
      tree(b,x+15,z-28,11+b.random()*5,4+b.random()*2);
      car(b,x,z,Math.PI/2,'#b8c8c4');
    }
  }
  for(let i=0;i<26;i++){
    const x=-52+b.random()*126,z=-73-b.random()*83;
    if(x>-37&&x<54&&z>-62)continue;
    tree(b,x,z,12+b.random()*5,4+b.random()*2);
  }
}

export function buildResort(b) {
  const sea=addWater(b,{color:'#526a65'});
  b.cube(b.m.concrete,-84,-.5,-99,365,1,430);
  for(const [x,z,w,d]of[[-139,9,83,90],[-34,53,130,20],[-165,-99,57,43],[-9,-116,60,62],[69,-100,27,105]])b.cube(b.m.grass,x,.02,z,w,.07,d);
  b.cube(b.m.grass,217,-.5,-160,176,1,550);
  b.cube(b.m.concrete,108,1.1,-116,2,2.2,320);b.cube(b.m.concrete,129,1.1,-116,2,2.2,320);
  b.cube(b.m.concrete,7,1.2,60,200,2.4,1.4);
  b.cube(b.m.grass,0,-.55,-535,2000,1,600);
  skyline(b,'resort');neighbors(b);resortTower(b);lowHotel(b);courtyard(b);streets(b);b.section(foreground,24,15,-45);
  for(let i=0;i<22;i++) {const x=-36+b.random()*115,z=45+b.random()*20;palm(b,x,z,11+b.random()*7,0,1.15);shrub(b,x+1,z,1.5);}
  birds(b,8);helicopter(b,-134,101,-201,.6,b.m.red);boat(b,117,-170,0,false);
  return {sea,camera:{position:[-80,62,153],target:[19,30,-24],fov:48},title:'Resort district',reference:'Vice_City_03.jpg',subtitle:'Hotel Valetta · rooftop courts · canal-side neighborhood'};
}
