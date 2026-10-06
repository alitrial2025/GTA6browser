import * as THREE from 'three';
import { seededRandom } from '../game/math.js';

export class Weather {
  constructor(scene) {
    const r = seededRandom(91), positions = [];
    for (let i = 0; i < 1400; i++) positions.push((r() - .5) * 90, r() * 50, (r() - .5) * 90);
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { time: { value: 0 } },
      vertexShader: `uniform float time; void main(){vec3 p=position;p.y=mod(p.y-time*21.,50.);p.x+=sin(time*.5)*2.;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(60./-mv.z,1.,4.);}`,
      fragmentShader: 'void main(){if(abs(gl_PointCoord.x-.5)>.15)discard;gl_FragColor=vec4(.74,.84,.88,.42);}',
    });
    this.rain = new THREE.Points(geometry, this.material); this.rain.frustumCulled = false; this.rain.visible = false; scene.add(this.rain);
  }
  update(time, focus, enabled) { this.rain.visible = enabled; this.rain.position.set(focus.x, 0, focus.z); this.material.uniforms.time.value = time; }
}
