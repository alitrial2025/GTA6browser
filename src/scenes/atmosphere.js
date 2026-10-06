import * as THREE from 'three';

export function addAtmosphere(scene, cloudy = true) {
  const uniforms = { cloudAmount: { value: cloudy ? .53 : .25 }, warm: { value: 0 }, sunset: { value: 0 }, sunDirection: {value: new THREE.Vector3(-170,260,200).normalize()} };
  const material = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms,
    vertexShader: 'varying vec3 vDirection; void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec3 vDirection; uniform float cloudAmount; uniform float warm; uniform float sunset; uniform vec3 sunDirection;
      float hash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 p){float n=0.,a=.52;for(int i=0;i<5;i++){n+=noise(p)*a;p=p*2.04+1.37;a*=.48;}return n;}
      void main(){vec3 d=normalize(vDirection);float y=max(d.y,0.);
        vec3 sky=mix(vec3(.43,.65,.79),vec3(.11,.32,.57),pow(y,.38));
        vec3 q=d*vec3(4.,6.,4.);float n=fbm(q+vec3(0.,3.2,0.));float clouds=smoothstep(.67-cloudAmount*.55,.74-cloudAmount*.47,n)*smoothstep(.015,.09,y);
        float detail=fbm(q*3.+vec3(7.));vec3 cloud=mix(vec3(.72,.77,.8),vec3(.99,.98,.94),smoothstep(.24,.65,detail));
        sky=mix(sky,cloud,clouds);sky=mix(sky,sky*vec3(1.12,.96,.81),warm*.65);
        float glow=pow(max(0.,dot(d,sunDirection)),10.);
        vec3 dusk=mix(vec3(.76,.39,.22),vec3(.17,.10,.12),pow(y,.52));
        dusk+=vec3(2.1,.89,.12)*glow;dusk+=vec3(5.,3.7,1.2)*pow(max(0.,dot(d,sunDirection)),1800.);dusk=mix(dusk,vec3(.37,.22,.20)+vec3(.6,.23,.035)*glow,clouds*.64);
        sky=mix(sky,dusk,sunset);gl_FragColor=vec4(sky,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }` });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(4000,32,20),material); sky.frustumCulled=false; sky.renderOrder=-100; scene.add(sky);
  const sun=new THREE.DirectionalLight('#fff1db',3.1); sun.position.set(-170,260,200);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-240,right:240,top:240,bottom:-240,near:1,far:650});sun.shadow.normalBias=.13;sun.shadow.bias=-.00015;
  const hemisphere=new THREE.HemisphereLight('#bfdeee','#8d8b6e',1.5);scene.add(sun,sun.target,hemisphere);
  scene.fog=new THREE.Fog('#b7cdd5',400,1550);
  return {sky,sun,hemisphere,uniforms};
}

export function helicopter(b,x,y,z,scale=1,color=b.m.white) {
  const group=new THREE.Group();
  const mesh=(g,m,px,py,pz)=>{const o=new THREE.Mesh(g,m);o.position.set(px,py,pz);o.castShadow=true;group.add(o);return o;};
  const body=mesh(new THREE.SphereGeometry(1,16,12),color,0,0,0);body.scale.set(1.1,1,2.1);
  const glass=mesh(new THREE.SphereGeometry(1,16,12),b.m.glassDark,0,.1,1.15);glass.scale.set(1.04,.85,1.04);
  const tail=mesh(new THREE.ConeGeometry(.55,5.5,12),color,0,.3,-4);tail.rotation.x=-Math.PI/2;
  const fin=mesh(new THREE.BoxGeometry(.09,1.6,1.3),color,0,1,-6.2);fin.rotation.x=-.25;
  mesh(new THREE.CylinderGeometry(.1,.1,.65,8),b.m.dark,0,1.45,0);
  const rotor=new THREE.Group();rotor.position.y=1.8;group.add(rotor);
  for(let i=0;i<2;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.12,.035,10),b.m.dark);blade.rotation.y=i*Math.PI/2;rotor.add(blade);}
  for(const side of[-1,1]){
    mesh(new THREE.BoxGeometry(.09,.09,3.6),b.m.metal,side*.85,-1.25,0);
    for(const zz of[-.9,.9])mesh(new THREE.CylinderGeometry(.04,.04,.7,6),b.m.metal,side*.85,-.95,zz);
  }
  group.position.set(x,y,z);group.scale.setScalar(scale);group.rotation.y=.8;b.root.add(group);
  b.animations.push(time=>rotor.rotation.y=time*27);return group;
}

export function birds(b,count=7) {
  const positions=[],indices=[];
  for(let i=0;i<count;i++) {
    const x=-100+b.random()*330,y=65+b.random()*65,z=-90-b.random()*110,size=.7+b.random()*.4,n=positions.length/3;
    positions.push(x,y,z,x-size*1.6,y+.45,z-.05,x-size*.85,y-.03,z+.2,x,y,z,x+size*1.6,y+.5,z,x+size*.9,y-.03,z+.2);
    indices.push(n,n+1,n+2,n+3,n+5,n+4);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
  const mesh=b.mesh(g,new THREE.MeshStandardMaterial({color:'#7e8583',side:THREE.DoubleSide}));mesh.castShadow=false;
}
