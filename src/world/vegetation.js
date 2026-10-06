import * as THREE from 'three';
import { seededRandom } from '../game/math.js';
import { canvasTexture } from './materials.js';

export function leafyCanopy(leafCount=110, leafSize=1) {
  const random=seededRandom(219),positions=[],uv=[],indices=[];
  for(let i=0;i<leafCount;i++) {
    const theta=random()*Math.PI*2,phi=Math.acos(2*random()-1),radius=Math.cbrt(random());
    const center=new THREE.Vector3(Math.sin(phi)*Math.cos(theta)*radius,Math.cos(phi)*radius,Math.sin(phi)*Math.sin(theta)*radius);
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(random()*Math.PI,random()*Math.PI,random()*Math.PI));
    const n=positions.length/3,size=(.13+random()*.13)*leafSize;
    for(const [x,y]of[[-1,-1],[1,-1],[-1,1],[1,1]]) {
      const v=new THREE.Vector3(x*size,y*size,0).applyQuaternion(q).add(center);positions.push(v.x,v.y,v.z);uv.push((x+1)/2,(y+1)/2);
    }
    indices.push(n,n+1,n+2,n+1,n+3,n+2);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const leaf=canvasTexture(128,(c,s)=>{
    c.clearRect(0,0,s,s);const g=c.createLinearGradient(0,0,s,s);g.addColorStop(0,'#829a50');g.addColorStop(.4,'#527b39');g.addColorStop(1,'#234d26');
    c.fillStyle=g;c.beginPath();c.ellipse(64,64,52,29,-.65,0,Math.PI*2);c.fill();c.strokeStyle='#97a563';c.lineWidth=1.5;c.beginPath();c.moveTo(17,105);c.lineTo(111,23);c.stroke();
    c.globalAlpha=.33;for(let i=0;i<9;i++){c.beginPath();c.moveTo(27+i*9,96-i*8);c.lineTo(21+i*9,62-i*5);c.stroke();}
  });
  const materials=['#a3b28b','#809c70','#b0b88b'].map(color=>new THREE.MeshStandardMaterial({color,map:leaf,alphaTest:.3,side:THREE.DoubleSide,roughness:1}));
  return {geometry,materials};
}
