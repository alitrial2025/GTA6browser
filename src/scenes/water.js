import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { textures } from '../world/textures.js';
import { paintedTexture } from './palette.js';
import { ribbon } from './geometry.js';

export function addWater(b, { x=0,z=0,size=3000,color='#407b79' }={}) {
  const water=new Water(new THREE.PlaneGeometry(size,size),{
    textureWidth:384,textureHeight:384,waterNormals:textures.waterNormal,sunDirection:new THREE.Vector3(-.48,.7,.5),sunColor:'#fff1dc',waterColor:color,distortionScale:2.2,fog:true,
  });
  water.rotation.x=-Math.PI/2;water.position.set(x,-.12,z);water.material.uniforms.size.value=2.4;b.root.add(water);
  // Keep reflected sky detail while absorbing more red light in the bay water.
  water.material.fragmentShader=water.material.fragmentShader.replace('reflectionSample * 0.9','reflectionSample * vec3(0.48,0.72,0.75)');
  const reflect=water.onBeforeRender;
  water.onBeforeRender=function(renderer,scene,camera,...rest){if(!scene.overrideMaterial)reflect.call(this,renderer,scene,camera,...rest);};
  const staticMaterial=new THREE.MeshStandardMaterial({color,normalMap:textures.waterNormal,normalScale:new THREE.Vector2(.6,.6),roughness:.19,metalness:.4});
  const fallback=new THREE.Mesh(water.geometry,staticMaterial);fallback.rotation.copy(water.rotation);fallback.position.copy(water.position);fallback.visible=false;b.root.add(fallback);
  return {water,fallback,update:time=>water.material.uniforms.time.value=time*.6};
}

let foam;
export function wake(b,points,width=4) {
  foam ||= paintedTexture(128,512,(ctx,w,h)=>{
    const rng=b.random;ctx.clearRect(0,0,w,h);
    for(let i=0;i<14500;i++){const x=rng()*w,y=rng()*h,edge=1-Math.abs(x/w-.5)*2;ctx.fillStyle=`rgba(241,248,234,${edge*(.15+rng()*.7)})`;ctx.fillRect(x,y,.6+rng()*3,.8+rng()*3);}
  });
  foam.wrapT=THREE.RepeatWrapping;
  const material=new THREE.MeshBasicMaterial({map:foam,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide});
  const path=points.map(p=>new THREE.Vector3(p[0],0,p[1]));
  const mesh=b.mesh(ribbon(path,width,.035),material);mesh.castShadow=mesh.receiveShadow=false;
  const core=b.mesh(ribbon(path,width*.18,.045),new THREE.MeshBasicMaterial({color:'#e1efdf',transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));core.castShadow=core.receiveShadow=false;
  return mesh;
}

export function boat(b,x,z,angle=0,large=false) {
  const group=new THREE.Group(),m=b.m,length=large?13:5.6,width=large?3.4:1.9;
  const shape=new THREE.Shape();shape.moveTo(-width*.45,-length*.5);shape.lineTo(width*.45,-length*.5);shape.quadraticCurveTo(width*.62,length*.2,0,length*.5);shape.quadraticCurveTo(-width*.62,length*.2,-width*.45,-length*.5);
  const hull=new THREE.ExtrudeGeometry(shape,{depth:large?1.1:.55,bevelEnabled:true,bevelThickness:.2,bevelSize:.18,bevelSegments:3});hull.rotateX(-Math.PI/2);
  const add=(g,mat,px,py,pz)=>{const mesh=new THREE.Mesh(g,mat);mesh.position.set(px,py,pz);mesh.castShadow=true;group.add(mesh);return mesh;};
  add(hull,m.white,0,-.1,0);add(new THREE.BoxGeometry(width*.72,.09,length*.65),m.wood,0,.6,-length*.07);
  add(new THREE.BoxGeometry(width*.65,.72,length*.28),m.white,0,.95,-length*.08);
  add(new THREE.BoxGeometry(width*.6,.65,length*.22),m.glassDark,0,1.55,-length*.08);
  add(new THREE.BoxGeometry(width*.78,.12,length*.33),large?m.cream:m.blue,0,1.95,-length*.08);
  for(const side of[-1,1]){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*width*.44,.9,-length*.36),new THREE.Vector3(side*width*.43,.9,length*.14),new THREE.Vector3(side*.05,.9,length*.43)]);
    add(new THREE.TubeGeometry(curve,18,.028,5,false),m.metal,0,0,0);
    add(new THREE.BoxGeometry(.34,.75,.5),m.dark,side*width*.18,.5,-length*.51);
  }
  group.position.set(x,.1,z);group.rotation.y=angle;b.root.add(group);b.animations.push(time=>{group.position.y=.1+Math.sin(time*.9+x)*.08;group.rotation.z=Math.sin(time*.6+z)*.014;});
  return group;
}
