import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { paintedTexture } from './palette.js';

// An authored 1970s-inspired coupe, in meters, facing +Z. A lower-detail version
// shares the same silhouette for traffic; close views keep interior and tire details.
export function createClassicCar(color='#328ab3',detail=true) {
  const group=new THREE.Group(),parts=new Map(),matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion();
  const paint=new THREE.MeshPhysicalMaterial({color,metalness:.52,roughness:.26,clearcoat:1,clearcoatRoughness:.16});
  const chrome=new THREE.MeshStandardMaterial({color:'#b9c2c7',metalness:1,roughness:.19});
  const rubber=new THREE.MeshStandardMaterial({color:'#15171a',roughness:.91});
  const interior=new THREE.MeshStandardMaterial({color:'#403f37',roughness:.94});
  const glass=new THREE.MeshPhysicalMaterial({color:'#819ca8',metalness:.08,roughness:.11,transparent:detail,opacity:detail?.48:1,depthWrite:!detail,side:THREE.DoubleSide});
  const red=new THREE.MeshPhysicalMaterial({color:'#9e1c20',roughness:.25,clearcoat:1,emissive:'#791215',emissiveIntensity:.35});
  const white=new THREE.MeshPhysicalMaterial({color:'#dae1d6',roughness:.12,clearcoat:1});
  const amber=new THREE.MeshStandardMaterial({color:'#d9903d',roughness:.36});
  const box=new THREE.BoxGeometry(1,1,1);
  const add=(geometry,material,x=0,y=0,z=0,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{
    const g=geometry.clone();quaternion.setFromEuler(new THREE.Euler(rx,ry,rz));matrix.compose(new THREE.Vector3(x,y,z),quaternion,new THREE.Vector3(sx,sy,sz));g.applyMatrix4(matrix);
    if(g.index){const flat=g.toNonIndexed();g.dispose();if(!parts.has(material))parts.set(material,[]);parts.get(material).push(flat);}else {if(!parts.has(material))parts.set(material,[]);parts.get(material).push(g);}
  };
  const rounded=(w,h,d,r=.08)=>new RoundedBoxGeometry(w,h,d,detail?3:1,r);
  // Body panels are separated by seams instead of using a single cuboid shell.
  add(rounded(2.12,.69,5.35,.11),paint,0,.95,0);
  add(rounded(2.02,.12,1.64,.045),paint,0,1.34,1.67,1,1,1,-.035);
  add(rounded(2.04,.13,1.28,.035),paint,0,1.35,-2.0,1,1,1,.04);
  for(const side of[-1,1]) {
    // A long belt-line crease and chrome lower sill define the side profile.
    add(box,chrome,side*1.063,1.19,0,.026,.045,4.85);
    add(box,rubber,side*1.075,.69,0,.033,.035,4.8);
    add(box,chrome,side*1.058,.65,0,.03,.08,4.7);
    add(box,rubber,side*1.07,1.02,-.21,.012,.57,.016);
    add(box,rubber,side*1.07,1.02,.97,.012,.57,.016);
    add(rounded(.035,.055,.23,.012),chrome,side*1.09,1.21,-.65);
    add(box,amber,side*1.071,.91,2.36,.017,.1,.19);
    add(box,red,side*1.071,.92,-2.36,.017,.1,.2);
  }
  // Cabin: sloped front/rear glass, separate pillars, and a gently rounded roof.
  const cabinPoints=[[-.93,1.33,-1.33],[.93,1.33,-1.33],[-.77,1.83,-.91],[.77,1.83,-.91],[-.76,1.82,.56],[.76,1.82,.56],[-.96,1.33,1.06],[.96,1.33,1.06]];
  const panel=(ids,mat)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ids.flatMap(i=>cabinPoints[i]),3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));g.setIndex([0,2,1,1,2,3]);g.computeVertexNormals();add(g,mat);g.dispose();};
  panel([0,1,2,3],glass);panel([4,5,6,7],glass);panel([0,2,6,4],glass);panel([1,7,3,5],glass);
  add(rounded(1.64,.12,1.71,.05),paint,0,1.86,-.19);
  const beam=(a,b,mat,width=.048)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va),mid=va.add(vb).multiplyScalar(.5);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);add(box,mat,mid.x,mid.y,mid.z,width,delta.length(),width,e.x,e.y,e.z);};
  for(const [a,b]of[[0,2],[1,3],[4,6],[5,7],[2,4],[3,5],[0,6],[1,7],[0,1],[2,3],[4,5],[6,7]])beam(cabinPoints[a],cabinPoints[b],chrome,.042);
  for(const side of[-1,1]){beam([side*.87,1.35,-.24],[side*.77,1.83,-.24],paint,.055);add(rounded(.26,.17,.21,.035),paint,side*1.16,1.48,.81);add(box,chrome,side*1.18,1.5,.915,.22,.13,.018);beam([side*.9,1.32,.84],[side*1.13,1.44,.83],chrome,.045);}
  // Bumpers, grille slats, lamps, molded lenses, and license plate recesses.
  for(const side of[-1,1])add(rounded(2.22,.24,.2,.055),chrome,0,.67,side*2.7);
  add(box,rubber,0,.93,2.689,1.17,.39,.03);
  for(let i=0;i<19;i++)add(box,chrome,-.53+i*.059,.93,2.714,.019,.35,.02);
  add(box,chrome,0,1.12,2.712,1.24,.035,.02);add(box,chrome,0,.74,2.712,1.24,.035,.02);
  for(const side of[-1,1]) {
    add(rounded(.66,.37,.08,.025),rubber,side*.77,.94,2.69);
    for(let i=0;i<2;i++)add(new THREE.CylinderGeometry(.134,.134,.045,detail?24:12),white,side*.77+(i-.5)*.29,.95,2.73,1,1,1,Math.PI/2);
    add(rounded(.64,.29,.055,.025),chrome,side*.73,.99,-2.694);
    add(box,red,side*.73,.99,-2.729,.58,.245,.035);
    for(let i=0;i<9;i++)add(box,chrome,side*.73-.275+i*.069,.99,-2.75,.007,.245,.005);
    add(box,chrome,side*.73,.99,-2.756,.58,.012,.008);
    add(box,rubber,side*.83,.65,side*2.815,.12,.19,.04);
  }
  const plateMap=paintedTexture(512,256,(ctx,w,h)=>{ctx.fillStyle='#dce2ca';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#75868c';ctx.lineWidth=14;ctx.strokeRect(7,7,w-14,h-14);ctx.textAlign='center';ctx.font='27px Arial';ctx.fillStyle='#566f62';ctx.fillText('LEONIDA',w/2,48);ctx.fillStyle='#c39358';ctx.beginPath();ctx.arc(w/2,116,38,0,Math.PI*2);ctx.fill();ctx.fillStyle='#22415c';ctx.font='bold 73px monospace';ctx.fillText('VC 1978',w/2,175);ctx.font='18px Arial';ctx.fillText('SUNSHINE STATE',w/2,223);});
  const plate=new THREE.MeshStandardMaterial({map:plateMap,roughness:.6});
  const backPlate=new THREE.Mesh(new THREE.PlaneGeometry(.47,.23),plate);backPlate.position.set(0,.96,-2.76);backPlate.rotation.y=Math.PI;group.add(backPlate);
  add(box,chrome,0,1.25,-2.686,.16,.04,.045);
  // Dashboard and upholstered seats remain visible through transparent glass.
  add(box,interior,0,1.02,-.03,1.85,.16,2.4);add(rounded(1.78,.24,.39,.04),interior,0,1.28,.76);
  for(const side of[-1,1]) {
    add(rounded(.62,.19,.66,.055),interior,side*.45,1.15,.09);
    add(rounded(.62,.64,.17,.055),interior,side*.45,1.38,-.31,1,1,1,-.14);
    add(rounded(.27,.16,.13,.035),interior,side*.45,1.62,-.34);
    if(detail)for(let i=0;i<7;i++)add(box,rubber,side*.45-.25+i*.083,1.47,-.407,.005,.53,.006);
  }
  add(rounded(1.64,.42,.36,.065),interior,0,1.24,-.97);
  add(new THREE.TorusGeometry(.19,.018,8,24),rubber,-.43,1.52,.61,1,1,1,-.38);
  if(detail){beam([-.43,1.52,.63],[-.43,1.52,.32],chrome,.035);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam([-.43,1.52,.62],[-.43+Math.cos(a)*.17,1.52+Math.sin(a)*.17,.62],chrome,.02);}}
  // Lathed tire sidewall and raised center tread avoid flat cylinder wheels.
  const radius=.54,rimRadius=.36,profile=[new THREE.Vector2(.36,-.15),new THREE.Vector2(.47,-.17),new THREE.Vector2(.53,-.12),new THREE.Vector2(.55,-.08),new THREE.Vector2(.55,.08),new THREE.Vector2(.53,.12),new THREE.Vector2(.47,.17),new THREE.Vector2(.36,.15)];
  const tire=new THREE.LatheGeometry(profile,detail?64:24);tire.rotateZ(Math.PI/2);
  for(const side of[-1,1])for(const zz of[-1.77,1.68]) {
    const px=side*1.0,py=radius;
    add(new THREE.CylinderGeometry(.62,.62,.015,detail?48:24),rubber,side*1.072,py,zz,1,1,1,0,0,Math.PI/2);
    add(tire,rubber,px,py,zz);
    add(new THREE.CylinderGeometry(rimRadius,rimRadius,.29,detail?48:20),chrome,px,py,zz,1,1,1,0,0,Math.PI/2);
    const spokes=detail?36:12;
    for(let j=0;j<spokes;j++) {
      const a=j/spokes*Math.PI*2,outer=[px+side*.162,py+Math.cos(a)*.33,zz+Math.sin(a)*.33],inner=[px+side*.2,py+Math.cos(a+.23)*.09,zz+Math.sin(a+.23)*.09];beam(outer,inner,chrome,detail?.016:.025);
    }
    add(new THREE.CylinderGeometry(.095,.095,.035,16),chrome,px+side*.2,py,zz,1,1,1,0,0,Math.PI/2);
    if(detail) {
      for(let j=0;j<64;j++){const a=j*Math.PI/32;for(const xx of[-.1,.1])add(box,rubber,px+xx,py+Math.cos(a)*.553,zz+Math.sin(a)*.553,.085,.015,.057,a);}
      const arc=new THREE.TorusGeometry(.46,.006,4,64);add(arc,chrome,px+side*.17,py,zz,1,1,1,0,Math.PI/2);
    }
    const fenderArc=new THREE.TorusGeometry(.625,.034,6,detail?40:20,Math.PI);add(fenderArc,paint,side*1.09,py,zz,1,1,1,0,Math.PI/2);
  }
  for(const [material,geometries]of parts){const merged=mergeGeometries(geometries),mesh=new THREE.Mesh(merged,material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);geometries.forEach(g=>g.dispose());}
  group.userData.realisticCar=true;group.userData.paint=paint;group.userData.vehicleStyle='classic-coupe';return group;
}
