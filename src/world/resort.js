import * as THREE from 'three';
import { canvasTexture } from './materials.js';

export class Resort {
  constructor(city) { this.c = city; this.m = city.materials; this.buildHotel(); this.buildCourts(); this.buildBeach(); }
  hotel(x, z, width, depth, floors, facing = 'z') {
    const c = this.c, m = this.m, height = floors * 3.5;
    c.solid(m.stucco, x, height / 2, z, width, height, depth); c.buildingCount++;
    for (let floor = 0; floor < floors; floor++) {
      const y = floor * 3.5 + 1.75;
      for (const side of [-1, 1]) {
        if (facing === 'z') {
          for (let wx = x - width / 2 + 3; wx < x + width / 2 - 2; wx += 4.5) {
            c.cube(m.glass, wx, y, z + side * (depth / 2 + .04), 2.75, 2.6, .06);
            c.cube(m.white, wx, y, z + side * (depth / 2 + .1), .055, 2.6, .07);
          }
          c.cube(m.white, x, floor * 3.5 + .24, z + side * (depth / 2 + 1.45), width + .5, .24, 3.15);
          c.cube(m.rail, x, floor * 3.5 + 1.25, z + side * (depth / 2 + 2.9), width, .055, .08);
          for (let wx = x - width / 2; wx <= x + width / 2; wx += 4.5) c.cube(m.rail, wx, floor * 3.5 + .78, z + side * (depth / 2 + 2.9), .06, 1, .06);
        } else {
          for (let wz = z - depth / 2 + 3; wz < z + depth / 2 - 2; wz += 4.5) {
            c.cube(m.glass, x + side * (width / 2 + .04), y, wz, .06, 2.6, 2.75);
            c.cube(m.white, x + side * (width / 2 + .1), y, wz, .07, 2.6, .055);
          }
          c.cube(m.white, x + side * (width / 2 + 1.2), floor * 3.5 + .25, z, 2.8, .26, depth + .5);
          c.cube(m.rail, x + side * (width / 2 + 2.4), floor * 3.5 + 1.2, z, .08, .07, depth);
          for (let wz = z - depth / 2; wz <= z + depth / 2; wz += 4.5) c.cube(m.rail, x + side * (width / 2 + 2.4), floor * 3.5 + .75, wz, .06, 1, .06);
        }
      }
      c.cube(m.white, x, (floor + 1) * 3.5, z, width + .3, .2, depth + .3);
    }
    c.cube(m.stucco, x, height + 1.9, z, width * .7, 3.5, depth * .7);
    c.cube(m.dark, x, height + 4, z, width * .75, .3, depth * .75);
    for (let i = 0; i < 4; i++) c.cube(m.dark, x - width * .23 + i * width * .15, height + 2.4, z, .3, 3.2, depth * .7);
  }
  buildHotel() {
    const c = this.c, m = this.m;
    this.hotel(512, 78, 20, 113, 9, 'x'); this.hotel(553, 25, 67, 19, 12);
    this.hotel(563, 138, 86, 18, 5);
    c.cube(m.stucco, 556, .13, 80, 63, .15, 79);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(38, 37), new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `varying vec2 vUv;uniform float time;void main(){float a=sin(vUv.x*80.+sin(vUv.y*40.+time)*2.),b=cos(vUv.y*72.+sin(vUv.x*32.-time));float n=pow(abs(a*b),9.);gl_FragColor=vec4(mix(vec3(.015,.33,.48),vec3(.39,.86,.87),n*.65+.1),1.);}`,
    }));
    water.rotation.x = -Math.PI / 2; water.position.set(556, .22, 77); c.scene.add(water); this.pool = water;
    for (const dx of [-20, 20]) c.cube(m.white, 556 + dx, .25, 77, 2, .25, 41);
    for (const dz of [-20, 20]) c.cube(m.white, 556, .25, 77 + dz, 42, .25, 2);
    c.cube(m.dark, 556, .19, 77, 42, .04, 41);
    const umbrella = new THREE.ConeGeometry(2.1, .5, 12, 1, true);
    const coral = new THREE.MeshStandardMaterial({ color: '#cf8c78', roughness: 1 });
    for (let i = 0; i < 10; i++) {
      const z = 44 + i * 7.2;
      for (const x of [531, 582]) {
        c.cube(m.white, x, .48, z, 1, .1, 2.5);
        c.cube(m.timber, x, .4, z, .85, .22, 2.2);
        c.batch.add(c.box, m.white, x, .9, z - .95, 1, 1.1, .12, 0, -.25);
      }
      if (i % 2 === 0) { c.batch.add(umbrella, coral, 582, 3.15, z + 2); c.cube(m.timber, 582, 1.6, z + 2, .07, 3.1, .07); }
    }
    for (const [x,z] of [[540,112],[550,115],[566,117],[584,109],[589,83],[588,54],[590,35],[527,41],[527,106],[593,126]]) c.palm(x,z,10+c.random()*5);
    c.cube(m.timber, 588, 3.7, 114, 15, .16, 13);
    for (const x of [582,594]) for (const z of [109,120]) c.cube(m.timber,x,1.9,z,.2,3.8,.2);
    for(let x=582;x<596;x+=1.2)c.cube(m.timber,x,3.84,114,.17,.17,13);
    // External stairs and landings add the layered silhouette visible in the resort reference.
    for(let i=0;i<18;i++)c.cube(m.white,595, .22+i*.18,124-i*.42,3.8,.2,.45);
    c.sign('PALM|VISTA RESORT', 519, 27, 78, 11, '#ead7b7', -Math.PI/2);
    c.sign('HOTEL|VALETTA', 553, 32, 35, 9, '#e1ba91');
  }
  buildCourts() {
    const c=this.c,m=this.m;
    c.cube(m.grass,400,.08,80,123,.09,124);
    const courtTexture=canvasTexture(512,(ctx,s)=>{
      ctx.fillStyle='#3e7366';ctx.fillRect(0,0,s,s);ctx.fillStyle='#345773';ctx.fillRect(75,25,s-150,s-50);
      ctx.strokeStyle='#dedfc7';ctx.lineWidth=3;ctx.strokeRect(76,26,s-152,s-52);ctx.beginPath();ctx.moveTo(76,s/2);ctx.lineTo(s-76,s/2);ctx.stroke();
      ctx.beginPath();ctx.arc(s/2,s/2,40,0,Math.PI*2);ctx.stroke();
      for(const y of [26,s-26]){ctx.strokeRect(s/2-49,y===26?y:y-115,98,115);ctx.beginPath();ctx.arc(s/2,y===26?141:s-141,42,0,Math.PI*2);ctx.stroke();}
    });
    const courtMat=new THREE.MeshStandardMaterial({map:courtTexture,roughness:.95});
    for(const x of [370,424]){
      const floor=new THREE.Mesh(new THREE.PlaneGeometry(43,68),courtMat);floor.rotation.x=-Math.PI/2;floor.position.set(x,.15,80);floor.receiveShadow=true;c.scene.add(floor);
      for(const z of [47,113]){c.cube(m.dark,x,2.2,z,.15,4.4,.15);c.cube(m.white,x,3.6,z,2.3,1.2,.1);c.cube(m.coral,x,3.5,z-.12,1,.7,.02);
        const rim=new THREE.TorusGeometry(.34,.028,6,20);c.batch.add(rim,m.coral,x,3.25,z-.52);}
    }
    for(let z=25;z<140;z+=9){c.cube(m.dark,344,2.8,z,.08,5.6,.08);c.cube(m.dark,453,2.8,z,.08,5.6,.08);}
    for(const x of [344,453])for(let y=1;y<5.8;y+=.45)c.cube(m.rail,x,y,80,.025,.025,114);
    for(const z of [22,140])for(let y=1;y<5.8;y+=.45)c.cube(m.rail,400,y,z,114,.025,.025);
    for(const [x,z]of[[351,34],[451,35],[350,132],[448,130],[397,138],[394,23]])c.palm(x,z,12+c.random()*3);
  }
  buildBeach() {
    const c=this.c,m=this.m;
    // A timber lifeguard station with a real veranda and stair silhouette.
    const yellow=new THREE.MeshStandardMaterial({color:'#d1a44a',map:m.timber.map,bumpMap:m.timber.bumpMap,bumpScale:.025,roughness:.85});
    const x=720,z=85;
    c.solid(yellow,x,4.5,z,6,3.5,5);c.cube(yellow,x,6.4,z,8,.28,7);
    const roof=new THREE.ConeGeometry(1,1,4);c.batch.add(roof,yellow,x,7.5,z,6,2.2,5,Math.PI/4);
    c.cube(m.timber,x,2.6,z+3.5,9,.25,6);
    for(const dx of[-3,3])for(const dz of[-2,5])c.cube(yellow,x+dx,1.7,z+dz,.2,3.4,.2);
    for(let j=0;j<11;j++)c.cube(yellow,x+5, .18+j*.24,z+10-j*.45,2.2,.2,.5);
    for(const dx of[-4,4]){c.cube(yellow,x+dx,3.5,z+4,.12,1.7,6);c.cube(yellow,x+dx,4.1,z+4,.16,.18,6);}
    c.cube(yellow,x,4.1,z+7,8,.18,.16);c.cube(yellow,x,3.55,z+7,8,.1,.12);
    c.cube(m.glass,x,4.8,z+2.56,3.5,1.9,.035);
    c.sign('LIFEGUARD|OCEAN RESCUE',x,5,z+2.6,3.5,'#fff1cb');
    for(let zz=-30;zz<190;zz+=19)for(const xx of[663,678])c.palm(xx+(c.random()-.5)*8,zz,8+c.random()*7);
  }
  update(time) { this.pool.material.uniforms.time.value=time; }
}
