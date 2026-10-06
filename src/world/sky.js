import * as THREE from 'three';

const palettes = {
  golden: { top: '#469aba', horizon: '#efb58e', fog: '#d6c5ac', sun: '#ffd4a0', intensity: 2.8, angle: 0.39, sky: 1.25 },
  noon: { top: '#3189bb', horizon: '#b7dadd', fog: '#b7d1d1', sun: '#fff2dc', intensity: 3.4, angle: 0.85, sky: 2.8 },
  night: { top: '#08192e', horizon: '#334157', fog: '#172c3b', sun: '#89a8ca', intensity: 0.55, angle: 0.6, sky: 0.85 },
};

export class Sky {
  constructor(scene) {
    this.scene = scene;
    this.material = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, sunColor: { value: new THREE.Color() }, sunDirection: { value: new THREE.Vector3() }, time: { value: 0 } },
      vertexShader: 'varying vec3 vPosition; void main(){ vPosition=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `varying vec3 vPosition; uniform vec3 top; uniform vec3 horizon; uniform vec3 sunColor; uniform vec3 sunDirection; uniform float time;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
        void main(){vec3 d=normalize(vPosition); float h=max(d.y,0.); vec3 color=mix(horizon,top,pow(h,.48));
          float sun=dot(d,normalize(sunDirection)); color+=sunColor*(pow(max(sun,0.),200.)*.45+smoothstep(.9993,.9998,sun)*2.);
          vec2 uv=d.xz/(max(d.y,.08))*1.5+vec2(time*.002,0.); float n=noise(uv*1.5)*.55+noise(uv*3.)*.3+noise(uv*6.)*.15;
          float clouds=smoothstep(.64,.83,n)*smoothstep(.04,.22,d.y)*.3; color=mix(color,vec3(1.,.96,.88),clouds);
          gl_FragColor=vec4(color,1.); #include <tonemapping_fragment> #include <colorspace_fragment> }`,
    });
    // Shader chunk directives must begin on their own line.
    this.material.fragmentShader = this.material.fragmentShader.replace(' #include', '\n#include').replace(' #include', '\n#include').replace('> }', '>\n}');
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(4500, 32, 24), this.material); this.dome.frustumCulled = false; scene.add(this.dome);
    this.sun = new THREE.DirectionalLight('#ffdbac', 3); this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048); Object.assign(this.sun.shadow.camera, { left: -100, right: 100, top: 100, bottom: -100, near: 1, far: 450 });
    this.sun.shadow.bias = -0.0002; this.sun.shadow.normalBias = 0.14;
    scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight('#b5d8e4', '#8c8771', 2.3); scene.add(this.hemi);
    this.setTime('golden');
  }
  setTime(value) {
    this.time = value; const p = palettes[value] || palettes.golden;
    this.material.uniforms.top.value.set(p.top); this.material.uniforms.horizon.value.set(p.horizon); this.material.uniforms.sunColor.value.set(p.sun);
    this.direction = new THREE.Vector3(0.62, p.angle, 0.55).normalize(); this.material.uniforms.sunDirection.value.copy(this.direction);
    this.sun.color.set(p.sun); this.sun.intensity = p.intensity; this.hemi.intensity = p.sky;
    this.scene.fog = new THREE.FogExp2(p.fog, value === 'night' ? 0.00135 : 0.00075);
  }
  update(time, focus) {
    this.material.uniforms.time.value = time; this.dome.position.copy(focus);
    this.sun.target.position.set(focus.x, 0, focus.z); this.sun.position.copy(this.sun.target.position).addScaledVector(this.direction, 250);
  }
}
