import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { paintedTexture } from './palette.js';
import { addWater, wake, boat } from './water.js';
import { palm, tree } from './landscape.js';
import { person } from './props.js';
import { ribbon } from './geometry.js';

const steel=new THREE.MeshStandardMaterial({color:'#bac6cb',metalness:.93,roughness:.19});
const upholstery=new THREE.MeshStandardMaterial({color:'#c1764d',roughness:.72});
const gelcoat=new THREE.MeshPhysicalMaterial({color:'#edf2f0',roughness:.23,clearcoat:1,clearcoatRoughness:.13});
const blueHull=new THREE.MeshPhysicalMaterial({color:'#879da8',roughness:.27,metalness:.15,clearcoat:1});
const black=new THREE.MeshStandardMaterial({color:'#17212a',roughness:.35,metalness:.3});
const purple=new THREE.MeshPhysicalMaterial({color:'#b089ca',roughness:.29,clearcoat:1});
const blue=new THREE.MeshPhysicalMaterial({color:'#123edf',roughness:.22,clearcoat:1});
const green=new THREE.MeshPhysicalMaterial({color:'#60c244',roughness:.26,clearcoat:1});

function rounded(b,m,x,y,z,w,h,d,r=.1){return b.mesh(new RoundedBoxGeometry(w,h,d,3,r),m,x,y,z);}
function pipe(b,points,r=.025,m=steel){return b.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,r,6,false),m);}

// Hull cross-sections taper in three dimensions, including the rising bow and submerged keel.
function hullGeometry(length,width,height){
  const stations=[[-.5,.88],[-.38,.97],[-.12,1],[.12,.96],[.31,.72],[.43,.37],[.5,.015]],positions=[],indices=[];
  for(const [t,span]of stations){const bow=Math.max(0,t)*.5;
    for(const [s,y]of[[-1,height+bow],[-.87,.22],[-.45,-.18],[0,-.42],[.45,-.18],[.87,.22],[1,height+bow]])positions.push(s*width*.5*span,y,t*length);
  }
  for(let row=0;row<stations.length-1;row++)for(let col=0;col<6;col++){const a=row*7+col,c=(row+1)*7+col;indices.push(a,a+1,c,a+1,c+1,c);}
  for(let i=1;i<6;i++)indices.push(0,i+1,i);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function footprint(length,width){const shape=new THREE.Shape();shape.moveTo(-width*.44,-length*.5);shape.lineTo(width*.44,-length*.5);shape.bezierCurveTo(width*.61,0,width*.45,length*.34,0,length*.5);shape.bezierCurveTo(-width*.45,length*.34,-width*.61,0,-width*.44,-length*.5);return shape;}
function deck(b,length,width,y){const g=new THREE.ExtrudeGeometry(footprint(length,width),{depth:.13,steps:1,bevelEnabled:false,curveSegments:40});g.rotateX(-Math.PI/2);g.rotateY(Math.PI);return b.mesh(g,gelcoat,0,y,0);}
function outboard(b,x,z,y=.7){
  rounded(b,black,x,y+.32,z,.85,1.05,.86,.2);rounded(b,gelcoat,x,y+.51,z+.01,.86,.61,.91,.17);
  b.cube(black,x,y-.38,z+.08,.27,.8,.33);b.cube(black,x,y-.77,z-.09,.12,.07,.7);
  b.cylinderPart(steel,x,y-.65,z-.31,.12,.15,0,0,Math.PI/2);
  b.sign('DINKA',x,y+.61,z-.461,.66,.18,'#263447').rotation.y=Math.PI;
  for(let i=0;i<6;i++)b.cube(black,x+.437,y+.3+i*.05,z,.012,.021,.35);
}
function helm(b,x,z,y){
  rounded(b,gelcoat,x,y+.5,z,1.4,1,.94,.13);const screen=b.mesh(new THREE.PlaneGeometry(.5,.31),black,x,y+.94,z+.48);screen.rotation.x=-.23;
  b.cube(b.m.blue,x-.33,y+.94,z+.485,.14,.13,.01);b.cube(b.m.glassDark,x+.36,y+.96,z+.485,.2,.15,.01);
  const wheel=b.mesh(new THREE.TorusGeometry(.23,.022,8,32),steel,x,y+.65,z+.65);wheel.rotation.x=-.42;
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;b.beam(steel,[x,y+.65,z+.65],[x+Math.cos(a)*.22,y+.65+Math.sin(a)*.2,z+.65-Math.sin(a)*.08],.014);}
  b.cube(black,x+.55,y+.61,z+.51,.08,.27,.08,0,0,-.3);
}
function seat(b,x,z,y,m=upholstery,w=1){rounded(b,m,x,y+.25,z,w,.24,.8,.09);rounded(b,m,x,y+.63,z-.37,w,.66,.18,.08);
  for(let i=0;i<5;i++)b.cube(b.m.cream,x-w*.4+i*w*.2,y+.379,z,.008,.006,.58);}
function flag(b,x,z,y){
  b.cylinderPart(steel,x,y+.7,z,.018,1.4);
  const map=paintedTexture(512,256,(c,w,h)=>{for(let i=0;i<13;i++){c.fillStyle=i%2?'#f6f4e9':'#b7363b';c.fillRect(0,i*h/13,w,h/13+1);}c.fillStyle='#253e64';c.fillRect(0,0,w*.43,h*.54);c.fillStyle='#fff';for(let r=0;r<5;r++)for(let k=0;k<6;k++)c.fillRect(12+k*32,12+r*23,4,4);});
  const g=new THREE.PlaneGeometry(.9,.47,16,5);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*9)*.05);g.computeVertexNormals();const f=b.mesh(g,new THREE.MeshStandardMaterial({map,side:THREE.DoubleSide,roughness:.9}),x+.45,y+1.03,z);f.rotation.y=.4;
}
export function centerConsole(parent,x,z,angle=0,crew=true){
  const group=parent.section(b=>{
    b.mesh(hullGeometry(10.4,3.5,1.05),blueHull);deck(b,10.3,3.42,1.05);deck(b,5.1,2.2,1.15).position.z=2.4;
    for(const side of[-1,1]){pipe(b,[[side*1.53,1.27,-5.1],[side*1.73,1.3,-1.3],[side*1.49,1.47,2.3],[side*.16,1.69,5.1]],.045,gelcoat);pipe(b,[[side*1.47,1.9,-1],[side*1.45,2.03,2.1],[side*.1,2.3,4.6]],.024);for(const zz of[0,1.8,3.2])b.beam(steel,[side*(zz>3?.8:1.45),1.22,zz],[side*(zz>3?.8:1.45),2.03,zz],.027);}
    helm(b,0,-.1,1.15);seat(b,0,-1.4,1.13,b.m.white,1.55);
    for(const xx of[-.8,.8])for(const zz of[-.9,1])b.beam(steel,[xx,1.2,zz],[xx,3.7,zz],.042);
    rounded(b,gelcoat,0,3.75,.08,3.1,.18,2.7,.08);b.cylinderPart(gelcoat,0,4.01,-.35,.18,.3);b.cylinderPart(steel,.7,4.45,-.6,.012,1.3);
    const wind=b.mesh(new THREE.PlaneGeometry(1.5,1.08),b.m.glassRail,0,2.82,.85);wind.rotation.x=-.18;b.beam(steel,[-.76,2.24,.75],[-.76,3.34,.93],.025);b.beam(steel,[.76,2.24,.75],[.76,3.34,.93],.025);
    for(const xx of[-1.06,0,1.06])outboard(b,xx,-5.42,.84);
    rounded(b,gelcoat,-.98,1.33,2.45,.8,.27,2.3,.12);rounded(b,gelcoat,.98,1.33,2.45,.8,.27,2.3,.12);
    rounded(b,black,-.83,1.53,-3.5,1.05,.55,.6,.09);rounded(b,gelcoat,.91,1.46,-3.5,.83,.52,.65,.09);
    const tube=b.mesh(new THREE.TorusGeometry(.66,.21,16,48),blue,-1,2.1,2);tube.rotation.y=.35;
    b.sign('LUREPREDATOR',0,1.02,-5.225,2.25,.21,'#253141');flag(b,1.48,-4.95,1.37);
    for(let k=0;k<6;k++)b.cube(b.m.concrete,-.49+k*.2,1.2,3.05,.13,.03,.8);
    if(crew){person(b,-.84,-2.75,1.19,.2);person(b,.75,-2.7,1.19,-.7);person(b,.34,1.95,1.33,2.5);}
  },x,.12,z);group.rotation.y=angle;parent.stats.boats++;parent.animations.push(t=>{group.position.y=.12+Math.sin(t*.8+x)*.07;group.rotation.z=Math.sin(t*.6+z)*.012;});return group;
}
function yacht(parent,x,z,angle=0,foreground=false){
  const group=parent.section(b=>{
    b.mesh(hullGeometry(21,6.6,2.1),gelcoat);deck(b,20.8,6.35,2.05);
    for(const side of[-1,1]){pipe(b,[[side*2.95,2.18,-9.9],[side*3.29,2.21,-1.5],[side*2.7,2.39,5.5],[side*.1,2.64,10.2]],.1,gelcoat);pipe(b,[[side*2.88,3.11,-9.5],[side*3.04,3.14,-1.8],[side*2.57,3.33,5.4],[side*.1,3.65,9.85]],.038);for(let zz=-8;zz<8;zz+=2)b.beam(steel,[side*(zz>5?2.35:2.94),2.13,zz],[side*(zz>5?2.35:2.94),3.2,zz],.033);}
    rounded(b,gelcoat,0,3.18,-3.1,5,2.17,8,.25);rounded(b,b.m.glassDark,0,4.25,-2.7,4.7,1.8,6.6,.3);rounded(b,gelcoat,0,5.35,-2.8,5.7,.24,8.1,.22);
    for(const side of[-1,1]){b.beam(steel,[side*2.36,3.62,-.4],[side*1.9,5.12,1.01],.075);for(let zz=-5;zz<0;zz+=1.5)b.cube(gelcoat,side*2.41,4.36,zz,.095,1.73,.085);}
    deck(b,12,4.5,5.5).position.z=-3.5;rounded(b,gelcoat,0,6.05,-4.8,3.1,.9,3,.15);helm(b,0,-2.8,5.6);b.cylinderPart(steel,0,8.3,-5,.026,3.8);rounded(b,gelcoat,0,7.53,-5,1.9,.24,.55);
    seat(b,-1.35,4.8,2.23,upholstery,2.05);seat(b,1.35,4.8,2.23,upholstery,2.05);rounded(b,upholstery,0,2.35,7.2,3.6,.28,2.05,.15);
    for(const side of[-1,1])for(let zz=-9;zz<-3;zz+=1.65)b.mesh(new THREE.SphereGeometry(.26,20,12),b.m.glassDark,side*3.01,1.62,zz).scale.set(.1,1,1.8);
    if(foreground){person(b,-1.4,3.1,2.22,.9);person(b,-.3,3.6,2.22,2.3);person(b,1.4,6.4,2.52,-.5);person(b,1.7,.7,2.2,2.5);
      rounded(b,b.m.white,-1.15,2.59,1.7,.9,.75,.74);rounded(b,b.m.blue,-1.15,3.02,1.7,.92,.13,.76);
      for(let i=0;i<9;i++){const cx=-2+i*.23,cz=5.75+b.random()*.4;b.cylinderPart(i%3?b.m.yellow:steel,cx,2.41,cz,.055,.16);}
      const rolled=b.mesh(new THREE.CylinderGeometry(.23,.23,1,24),b.m.white,1.8,2.55,2.2);rolled.rotation.z=Math.PI/2;for(let i=0;i<9;i++)b.cube(b.m.blue,1.35+i*.12,2.69,2.2,.04,.01,.35);
      inflatable(b,-2.1,.9,2.9,false);
    }else{person(b,-2,2,2.22,.4);person(b,1,3.5,2.22,1);person(b,0,-2.3,5.63,0);}
    flag(b,2.86,-9.1,2.8);
  },x,.1,z);group.rotation.y=angle;parent.stats.boats++;parent.animations.push(t=>group.rotation.z=Math.sin(t*.45+x)*.006);return group;
}
function inflatable(b,x,z,y=0,flamingo=true){const material=flamingo?purple:green;
  const ring=b.mesh(new THREE.TorusGeometry(flamingo?1.15:.62,.29,18,56),material,x,y+.25,z);ring.rotation.x=Math.PI/2;ring.scale.y=1.2;
  pipe(b,[[x+.73,y+.27,z+.65],[x+.8,y+.9,z+.7],[x+.58,y+1.6,z+.62],[x+.1,y+1.78,z+.68]],.19,material);
  const head=b.mesh(new THREE.SphereGeometry(.26,20,16),material,x+.08,y+1.77,z+.68);head.scale.z=1.3;
  const beak=b.mesh(new THREE.ConeGeometry(.15,.4,16),flamingo?b.m.dark:b.m.yellow,x-.16,y+1.67,z+.74);beak.rotation.z=-1.02;
  for(const side of[-1,1])b.mesh(new THREE.SphereGeometry(.04,12,8),b.m.dark,x+.06,y+1.82,z+.68+side*.245);
  const wing=b.mesh(new THREE.SphereGeometry(.5,24,12),material,x-.5,y+.52,z-.5);wing.scale.set(1.2,.2,.6);
}
function spray(b,x,z,angle){const positions=[];for(let i=0;i<1800;i++){const t=b.random(),spread=(b.random()-.5)*(1+t*5),along=t*9;const y=Math.sin(t*Math.PI)*2.1+b.random()*.35;positions.push(x+Math.cos(angle)*spread+Math.sin(angle)*along,y,z-Math.sin(angle)*spread+Math.cos(angle)*along);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const points=new THREE.Points(g,new THREE.PointsMaterial({color:'#eff7ef',size:.045,transparent:true,opacity:.6,depthWrite:false}));b.root.add(points);
}
function jetski(b,x,z,angle){const group=b.section(c=>{const body=c.mesh(new THREE.SphereGeometry(1,24,14),c.m.blue,0,.27,0);body.scale.set(.65,.32,1.5);rounded(c,black,0,.66,-.2,.65,.22,1.32);c.beam(steel,[0,.6,.6],[0,1.12,.45],.055);c.beam(steel,[-.39,1.12,.45],[.39,1.12,.45],.05);person(c,0,-.25,.75,0);},x,0,z);group.rotation.y=angle;b.stats.boats++;spray(b,x,z,angle+Math.PI);wake(b,[[x,z],[x+Math.sin(angle+Math.PI)*12,z+Math.cos(angle+Math.PI)*12]],2.5);}

export function buildHarborParty(b){
  const sea=addWater(b,{color:'#285f84'});sea.water.material.fragmentShader=sea.water.material.fragmentShader.replace('vec3 outgoingLight = albedo;', 'vec3 outgoingLight = mix(albedo, albedo * vec3(0.35,0.65,0.9) + waterColor * 0.22, 0.6);');sea.water.material.uniforms.distortionScale.value=3.1;sea.fallback.material.normalScale.set(.9,.9);
  yacht(b,12,5,-.23,true);centerConsole(b,-3,7,Math.PI+.85);centerConsole(b,-5,-24,.13);centerConsole(b,-27,-21,1.27,false);
  yacht(b,7,-66,-.22);yacht(b,-47,-81,.4);centerConsole(b,29,-42,-.4,false);
  for(const [x,z,a]of[[-17,-56,.3],[30,-86,-.5],[69,-54,1.6],[-67,-25,.8]]){boat(b,x,z,a);b.stats.boats++;wake(b,[[x,z],[x-Math.sin(a)*15,z-Math.cos(a)*15]],2.6);}
  jetski(b,4,-29,-.62);jetski(b,22,-24,1.1);jetski(b,-16,-32,.85);
  inflatable(b,-9.5,10,0,true);person(b,-9.8,9.7,.44,.5);
  const ring=b.mesh(new THREE.TorusGeometry(.8,.25,16,48),blue,-16,.32,-12);ring.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++) {const x=-65+i*22,z=-105-b.random()*18;b.cylinderPart(steel,x,.72,z,.035,1.7);const marker=b.mesh(new THREE.ConeGeometry(.42,.8,3),i%2?b.m.red:green,x,1.63,z);marker.rotation.y=.4;}
  b.cube(b.m.grass,-64,1.2,-164,280,2.5,80);b.cube(b.m.concrete,-64,.45,-121,280,.9,1.5);
  for(let i=0;i<85;i++){const x=-190+b.random()*275,z=-130-b.random()*63;i%3?palm(b,x,z,10+b.random()*6,1.1):tree(b,x,z,8+b.random()*8,4+b.random()*4);}
  for(const [x,z,w,d]of[[-81,-134,20,13],[-125,-145,26,17],[-23,-149,14,13]]){b.flatBuilding(x,z,w,d,1,{floorHeight:5,material:b.m.wood,windows:true});const roof=b.mesh(new THREE.ConeGeometry(1,1,4),b.m.cream,x,6.3,z);roof.scale.set(w*.73,3,d*.73);roof.rotation.y=Math.PI/4;}
  for(let i=0;i<5;i++){const x=-135+i*37;b.cube(b.m.wood,x,.7,-111,3,.2,24);for(const zz of[-122,-114,-104])for(const side of[-1,1])b.cylinderPart(b.m.wood,x+side*1.4,.2,zz,.13,3);}
  const bridge=ribbon([new THREE.Vector3(50,0,-169),new THREE.Vector3(117,0,-168),new THREE.Vector3(187,0,-135),new THREE.Vector3(260,0,-130)],11,7);b.mesh(bridge,b.m.concrete);
  for(let i=0;i<20;i++){const x=50+i*10,z=-165+Math.max(0,x-110)*.23;for(const side of[-1,1])b.cylinderPart(b.m.concrete,x,3.45,z+side*4.5,.44,7);b.cylinderPart(steel,x,9.1,z+5,.035,4.1);}
  return{sea,code:'LK05',title:'Keys boat gathering',subtitle:'Center consoles · yacht decks · wakes & waterfront',reference:'Leonida_Keys_05.jpg',camera:{position:[8,5.6,18],target:[1,0,-12],fov:53},atmosphere:{clouds:.35,fog:'#b7ccd5',fogNear:230,fogFar:1000,sun:[-100,190,135]}};
}
