import * as THREE from 'three';
import { Water as ReflectiveWater } from 'three/addons/objects/Water.js';
import { textures } from './textures.js';

export class Water {
  constructor(scene) {
    this.scene = scene;
    this.material = new THREE.ShaderMaterial({
      transparent: true, uniforms: { time: { value: 0 }, night: { value: 0 } },
      vertexShader: `uniform float time; varying vec3 vWorld; varying vec3 vNormal;
        void main(){vec3 p=position; vec4 w=modelMatrix*vec4(p,1.); float a=sin(w.x*.032+time*.7),b=cos(w.z*.041+time*.48);p.z+=a*.18+b*.12;
        vWorld=(modelMatrix*vec4(p,1.)).xyz; vNormal=normalize(vec3(-cos(w.x*.032+time*.7)*.18,1.,sin(w.z*.041+time*.48)*.13));gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,
      fragmentShader: `uniform float time; uniform float night; varying vec3 vWorld; varying vec3 vNormal;
        void main(){vec3 view=normalize(cameraPosition-vWorld);float f=pow(1.-max(dot(view,vNormal),0.),3.); float depth=smoothstep(750.,1120.,vWorld.x);
        vec3 color=mix(vec3(.12,.62,.61),vec3(.025,.27,.37),depth);color=mix(color,vec3(.61,.78,.78),f*.65);
        float s=pow(max(dot(reflect(-normalize(vec3(.62,.39,.55)),vNormal),view),0.),100.);color+=vec3(1.,.86,.63)*s*.8;
        float foam=smoothstep(.8,.98,sin(vWorld.z*.07+vWorld.x*.25-time*1.7))*exp(-abs(vWorld.x-758.)*.09); color=mix(color,vec3(.86,.91,.84),foam*.7);
        color*=1.-night*.7;gl_FragColor=vec4(color,.96);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(9000, 10000, 170, 150), this.material);
    this.mesh.rotation.x = -Math.PI / 2; this.mesh.position.set(1800, -0.12, 1200); scene.add(this.mesh);
  }
  prepareReflection() {
    this.reflection = new ReflectiveWater(new THREE.PlaneGeometry(9000,10000), {
      textureWidth: 256, textureHeight: 256, waterNormals: textures.waterNormal,
      sunDirection: new THREE.Vector3(.62,.85,.55).normalize(), sunColor: '#fff8e7',
      waterColor: '#096c7a', distortionScale: 2.8, fog: true,
    });
    this.reflection.rotation.x=-Math.PI/2;this.reflection.position.copy(this.mesh.position);this.scene.add(this.reflection);
  }
  setQuality(quality) { this.quality=quality; }
  update(time, night, underwater=false) {
    this.material.uniforms.time.value=time;this.material.uniforms.night.value=night?1:0;
    const reflective=this.quality==='high'&&!underwater;
    this.mesh.visible=!reflective;
    if(this.reflection){this.reflection.visible=reflective;this.reflection.material.uniforms.time.value=time*.7;this.reflection.material.uniforms.sunColor.value.set(night?'#849eba':'#fff3da');}
  }
}
