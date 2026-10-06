import './viewer.css';
import {asset} from '../asset-base.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { loadSurfaceTextures } from '../world/textures.js';
import { loadDetailedCharacter } from '../world/detailed-character.js';
import { loadDetailedVehicle } from '../world/detailed-vehicle.js';
import { makePalette } from './palette.js';
import { SceneBuilder } from './builder.js';
import { buildResort } from './resort.js';
import { buildTowers } from './towers.js';
import { buildNeighborhood } from './neighborhood.js';
import { buildMuralStreet } from './mural-street.js';
import { buildHarborParty } from './harbor-party.js';
import { addAtmosphere } from './atmosphere.js';

const paths={orbit:'M8 4a8 8 0 1 1-4 7M4 4v5h5 M12 8v8M8 12h8',reference:'M3 3h18v18H3zM12 3v18M6 8h3M15 16h3',reset:'M4 8a8 8 0 1 1 0 8M4 3v5h5',camera:'M3 7h4l2-3h6l2 3h4v13H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',pause:'M8 5v14M16 5v14',play:'M8 4l12 8-12 8z',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1',hide:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',full:'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',info:'M12 11v6M12 7v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
const button=(id,name,label,title,pressed=null)=>`<button id="${id}" title="${title}" aria-label="${title}" ${pressed===null?'':`aria-pressed="${pressed}"`}>${icon(name)}<span>${label}</span></button>`;
document.querySelector('#app').innerHTML=`
  <div id="loading" class="loadscreen" role="status"><div class="load-title">VICE CITY</div><p>FIVE REFERENCE SCENE STUDIES</p><div class="load-bar"><span></span></div><p id="loading-message">Loading materials and models…</p></div>
  <div id="reference" class="reference"><img id="reference-image" alt="User-provided Vice City reference screenshot"/><span class="reference-label">ORIGINAL REFERENCE</span></div>
  <div id="compare-line" class="compare-line"><span class="compare-handle">↔</span></div>
  <main class="studio" id="studio">
    <header class="masthead"><div class="identity"><div class="identity-mark">VC</div><div><b>VICE CITY</b><span>SCENE STUDIES</span></div></div><div class="view-status"><i></i><span id="view-status">REFERENCE CAMERA</span><button id="about" aria-label="About these scenes" style="margin-left:8px;background:none;border:0;padding:4px;color:inherit">${icon('info')}</button></div></header>
    <div id="orbit-hint" class="hint hidden">Drag to orbit · scroll to zoom · right-drag to pan</div>
    <div class="scene-info"><div class="eyebrow" id="scene-number">STUDY 03 / DAYLIGHT</div><h1 id="scene-title">Resort district</h1><p id="scene-subtitle">Hotel Valetta · rooftop courts · canal-side neighborhood</p></div>
    <div id="compare-controls" class="compare-controls hidden"><label for="compare-slider">Reference</label><input id="compare-slider" type="range" min="0" max="100" value="50" aria-label="Reference comparison split"/><span>3D scene</span></div>
    <span id="render-label" class="render-label hidden">3D RECONSTRUCTION</span>
    <div class="dock"><nav class="scene-tabs" aria-label="Scene selection"><button class="scene-tab" data-scene="0" aria-pressed="true"><span class="number">03</span><div><strong>Resort</strong><small>Hotels</small></div></button><button class="scene-tab" data-scene="1" aria-pressed="false"><span class="number">10</span><div><strong>Waterfront</strong><small>Towers</small></div></button><button class="scene-tab" data-scene="2" aria-pressed="false"><span class="number">06</span><div><strong>Gellhorn</strong><small>Sunset</small></div></button><button class="scene-tab" data-scene="3" aria-pressed="false"><span class="number">05</span><div><strong>Keys</strong><small>Boats</small></div></button><button class="scene-tab" data-scene="4" aria-pressed="false"><span class="number">09</span><div><strong>Murals</strong><small>Street</small></div></button></nav>
    <div class="tools" aria-label="Scene controls">${button('explore','orbit','Explore','Explore the 3D scene',false)}${button('compare','reference','Compare','Compare with original reference (C)',false)}${button('reset','reset','Reset','Reset reference camera (R)')}
      <i class="tool-divider"></i>${button('motion','pause','','Pause scene animation (Space)',true)}${button('lighting','sun','','Toggle warm afternoon lighting',false)}${button('capture','camera','','Save scene as PNG (S)')}${button('hide','hide','','Hide interface (H)')}${button('fullscreen','full','','Toggle fullscreen (F)')}
      <select id="quality" aria-label="Render quality"><option value="high">High quality</option><option value="balanced" selected>Balanced</option><option value="draft">Draft</option></select>
    </div></div>
    <button id="restore" class="restore-ui hidden">Show controls · H</button><div id="toast" class="toast hidden" role="status"></div>
    <aside id="credits" class="credits hidden"><button id="close-about" aria-label="Close scene information">✕</button><b>Built as explorable 3D scenes</b><p>These are modeled studies of your five screenshots. Architecture, materials, foliage and surroundings are reconstructed from the visible views. They remain works in progress.</p><p>Compare overlays the original image explicitly. The 3D view uses modeled geometry and does not use the screenshot as its scene.</p><p>Humanoid: Cesium · Car Concept: DGG / Eric Chadwick · HDR: Poly Haven. <a href="${asset('/asset-credits.html')}" target="_blank" rel="noopener">Asset credits</a></p><div class="keys">1–5: scenes · R: reference view · C: compare<br>Space: motion · H: controls · S: save PNG</div></aside>
  </main>`;

class SceneStudio {
  async initialize() {
    this.index=0;this.time=0;this.motion=new URLSearchParams(location.search).get('motion')==='on'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;this.exploring=false;this.comparing=false;this.warm=false;this.clean=false;
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
    this.renderer.setSize(innerWidth,innerHeight);this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    this.renderer.info.autoReset=false;
    this.renderer.domElement.setAttribute('aria-label','Explorable 3D Vice City reference scene');document.querySelector('#world').append(this.renderer.domElement);
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.2,5000);this.atmosphere=addAtmosphere(this.scene);
    const pmrem=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment(),initial=pmrem.fromScene(room,.04);this.scene.environment=initial.texture;this.scene.environmentIntensity=.45;room.dispose();
    const environment=Promise.all(['daylight','sunset'].map(async name=>{
      const hdr=await new RGBELoader().loadAsync('/environments/'+name+'.hdr');const target=pmrem.fromEquirectangular(hdr);hdr.dispose();return target;
    })).then(targets=>{this.environments=targets.map(t=>t.texture);this.environmentTargets=targets;this.scene.environment=targets[0].texture;initial.dispose();});
    await Promise.all([loadSurfaceTextures(),loadDetailedCharacter(),loadDetailedVehicle(),environment]);pmrem.dispose();
    this.materials=makePalette();this.views=[];
    for(const [i,build]of[buildResort,buildTowers,buildNeighborhood,buildHarborParty,buildMuralStreet].entries()) {
      document.querySelector('#loading-message').textContent=`Building scene ${i+1} of 5…`;await new Promise(requestAnimationFrame);
      const root=new THREE.Group();root.visible=false;this.scene.add(root);
      const builder=new SceneBuilder(root,this.materials,103+i*71),view=build(builder);root.name=view.title;builder.flush();this.views.push({...view,code:view.code||['03','10'][i],root,builder});
    }
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=false;this.controls.minDistance=2;this.controls.maxDistance=1100;this.controls.maxPolarAngle=Math.PI*.499;this.controls.enabled=false;
    this.controls.addEventListener('change',()=>this.dirty=true);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));
    this.ao=new SSAOPass(this.scene,this.camera,innerWidth,innerHeight,16);this.ao.kernelRadius=3.5;this.ao.minDistance=.07/this.camera.far;this.ao.maxDistance=12/this.camera.far;this.composer.addPass(this.ao);this.composer.addPass(new OutputPass());
    this.bind();const query=new URLSearchParams(location.search);this.quality=query.get('quality')||'balanced';if(!['high','balanced','draft'].includes(this.quality))this.quality='balanced';document.querySelector('#quality').value=this.quality;
    const requested=query.get('scene');this.select(Math.max(0,this.views.findIndex(v=>v.code===requested||v.reference.replace('.jpg','')===requested)));this.setQuality(this.quality);this.syncMotion();this.render();document.querySelector('#loading').remove();
    this.clock=new THREE.Clock();this.renderer.setAnimationLoop(()=>this.frame());
    window.__VICE_SCENES__={snapshot:()=>({ready:true,scene:this.active.code,sunset:!!this.active.atmosphere?.sunset,title:this.active.title,...this.active.builder.stats,exploring:this.exploring,comparing:this.comparing,motion:this.motion,time:this.time,warm:this.warm,quality:this.quality,camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray()},calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,referenceVisible:document.querySelector('#reference').classList.contains('active')}),characterHeights:()=>{
      const heights=[];this.active.root.updateMatrixWorld(true);this.active.root.traverse(o=>{if(o.userData.detailed&&o.userData.animate){o.traverse(mesh=>{if(mesh.isSkinnedMesh){mesh.skeleton.update();mesh.computeBoundingBox();}});const bounds=new THREE.Box3().setFromObject(o,true);heights.push(bounds.max.y-bounds.min.y);}});return heights;
    }};
  }
  bind() {
    document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>this.select(Number(button.dataset.scene))));
    document.querySelector('#explore').onclick=()=>this.toggleExplore();document.querySelector('#compare').onclick=()=>this.toggleCompare();document.querySelector('#reset').onclick=()=>this.resetCamera();
    document.querySelector('#motion').onclick=()=>{this.motion=!this.motion;this.syncMotion();this.dirty=true;};document.querySelector('#lighting').onclick=()=>this.toggleLighting();
    document.querySelector('#capture').onclick=()=>this.capture();document.querySelector('#hide').onclick=()=>this.toggleClean();document.querySelector('#restore').onclick=()=>this.toggleClean();
    document.querySelector('#compare-slider').oninput=e=>this.split(e.target.value);document.querySelector('#quality').onchange=e=>this.setQuality(e.target.value);
    document.querySelector('#about').onclick=()=>document.querySelector('#credits').classList.toggle('hidden');document.querySelector('#close-about').onclick=()=>document.querySelector('#credits').classList.add('hidden');
    document.querySelector('#fullscreen').onclick=()=>this.fullscreen();
    window.addEventListener('resize',()=>this.resize());
    window.addEventListener('keydown',e=>{if((e.target.matches('input,select,textarea')||(e.target.matches('button')&&e.code==='Space'))&&e.code!=='Escape')return;
      const actions={Digit1:()=>this.select(0),Digit2:()=>this.select(1),Digit3:()=>this.select(2),Digit4:()=>this.select(3),Digit5:()=>this.select(4),KeyR:()=>this.resetCamera(),KeyC:()=>this.toggleCompare(),KeyH:()=>this.toggleClean(),KeyS:()=>this.capture(),KeyF:()=>this.fullscreen(),Space:()=>{this.motion=!this.motion;this.syncMotion();},Escape:()=>{document.querySelector('#credits').classList.add('hidden');if(this.comparing)this.toggleCompare();if(this.clean)this.toggleClean();}};
      if(actions[e.code]){e.preventDefault();actions[e.code]();this.dirty=true;}
    });
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.renderer.setAnimationLoop(null);this.toast('Graphics context interrupted. Reload to restore the scene.');});
  }
  select(index) {
    if(this.comparing)this.toggleCompare();this.index=index;this.views.forEach((v,i)=>v.root.visible=i===index);this.active=this.views[index];
    this.warm=false;this.applyAtmosphere();
    document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.scene)===index));
    document.querySelector('#scene-title').textContent=this.active.title;document.querySelector('#scene-subtitle').textContent=this.active.subtitle;
    this.syncLighting();
    document.querySelector('#reference-image').src=asset('/references/'+this.active.reference);document.querySelector('#reference-image').alt=this.active.title+' — original user-provided reference';document.querySelector(`[data-scene="${index}"]`).scrollIntoView({block:'nearest',inline:'nearest'});
    this.resetCamera();this.renderer.shadowMap.needsUpdate=true;this.dirty=true;
  }
  resetCamera() {
    this.controls.enableDamping=false;this.controls.update();
    this.camera.position.fromArray(this.active.camera.position);this.camera.fov=this.active.camera.fov;this.camera.updateProjectionMatrix();this.controls.target.fromArray(this.active.camera.target);this.camera.lookAt(this.controls.target);
    // Reset OrbitControls' damping so the restored view cannot drift.
    this.controls.enableDamping=false;this.controls.update();this.exploring=false;this.controls.enabled=false;this.syncExplore();if(this.composer)this.resize();this.dirty=true;
  }
  syncExplore() {document.querySelector('#explore').setAttribute('aria-pressed',this.exploring);document.querySelector('#orbit-hint').classList.toggle('hidden',!this.exploring);document.querySelector('#view-status').textContent=this.exploring?'EXPLORING IN 3D':'REFERENCE CAMERA';}
  toggleExplore() {if(this.comparing)this.toggleCompare();this.exploring=!this.exploring;this.controls.enabled=this.exploring;this.syncExplore();this.dirty=true;}
  toggleCompare() {
    this.comparing=!this.comparing;if(this.comparing){this.resetCamera();if(this.warm)this.toggleLighting();}
    document.querySelector('#compare').setAttribute('aria-pressed',this.comparing);
    for(const id of['reference','compare-line'])document.querySelector('#'+id).classList.toggle('active',this.comparing);
    for(const id of['compare-controls','render-label'])document.querySelector('#'+id).classList.toggle('hidden',!this.comparing);
    if(this.comparing)this.split(document.querySelector('#compare-slider').value);this.resize();this.dirty=true;
  }
  split(value) {document.querySelector('#reference').style.clipPath=`inset(0 ${100-Number(value)}% 0 0)`;document.querySelector('#compare-line').style.left=value+'%';}
  resize() {
    const width=this.comparing?Math.min(innerWidth,innerHeight*16/9):innerWidth,height=this.comparing?width*9/16:innerHeight;
    this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);if(this.composer){this.composer.setPixelRatio(this.renderer.getPixelRatio());this.composer.setSize(width,height);}document.querySelector('#world').classList.toggle('compare-fit',this.comparing);this.dirty=true;
  }
  syncMotion() {const button=document.querySelector('#motion'),label=this.motion?'Pause scene animation (Space)':'Play scene animation (Space)';button.setAttribute('aria-pressed',this.motion);button.setAttribute('aria-label',label);button.title=label;button.innerHTML=icon(this.motion?'pause':'play');}
  applyAtmosphere() {
    const preset=this.active.atmosphere||{clouds:this.index===1?.25:.53},sunset=!!preset.sunset;
    this.atmosphere.uniforms.cloudAmount.value=preset.clouds;this.atmosphere.uniforms.sunset.value=sunset?1:0;this.atmosphere.uniforms.warm.value=this.warm?1:0;
    this.scene.fog.color.set(preset.fog||'#b7cdd5');this.scene.fog.near=preset.fogNear||400;this.scene.fog.far=preset.fogFar||1550;
    this.scene.environment=this.environments[sunset?1:0];this.scene.environmentIntensity=sunset?.6:.45;
    const sun=this.atmosphere.sun;sun.color.set(sunset?'#ff9f32':this.warm?'#ffd0a1':'#fff1db');sun.intensity=sunset?4.5:3.1;
    sun.position.fromArray(this.warm?[-240,180,200]:preset.sun||[-170,260,200]);this.atmosphere.uniforms.sunDirection.value.copy(sun.position).normalize();
    const extent=this.index===4?90:this.index===2?170:240;Object.assign(sun.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent});sun.shadow.camera.updateProjectionMatrix();
    this.atmosphere.hemisphere.color.set(sunset?'#b595a3':'#bfdeee');this.atmosphere.hemisphere.groundColor.set(sunset?'#755d43':'#8d8b6e');this.atmosphere.hemisphere.intensity=sunset?.55:1.5;
    this.syncLighting();this.renderer.shadowMap.needsUpdate=true;this.dirty=true;
  }
  syncLighting(){document.querySelector('#lighting').setAttribute('aria-pressed',this.warm);document.querySelector('#scene-number').textContent=`STUDY ${this.active.code} / ${this.active.atmosphere?.sunset?'SUNSET':this.warm?'AFTERNOON':'DAYLIGHT'}`;}
  toggleLighting() {this.warm=!this.warm;if(this.comparing&&this.warm)this.toggleCompare();this.applyAtmosphere();}
  setQuality(quality) {this.quality=quality;this.renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='high'?1.75:quality==='draft'?.75:1.25));this.renderer.shadowMap.enabled=quality!=='draft';const size=quality==='high'?2048:1024;
    if(this.atmosphere.sun.shadow.mapSize.x!==size){this.atmosphere.sun.shadow.map?.dispose();this.atmosphere.sun.shadow.map=null;this.atmosphere.sun.shadow.mapSize.set(size,size);}
    this.views.forEach(v=>{v.sea.water.visible=quality!=='draft';v.sea.fallback.visible=quality==='draft';});this.ao.enabled=quality==='high';this.renderer.shadowMap.needsUpdate=true;this.resize();this.dirty=true;
  }
  toggleClean() {this.clean=!this.clean;document.querySelector('#studio').classList.toggle('clean',this.clean);document.querySelector('#restore').classList.toggle('hidden',!this.clean);document.querySelector('#credits').classList.add('hidden');}
  async fullscreen() {try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{this.toast('Use your browser’s fullscreen shortcut.');}}
  capture() {this.render();this.renderer.domElement.toBlob(blob=>{if(!blob){this.toast('Unable to save this frame.');return;}const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`vice-city-study-${this.active.code}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.toast('Scene saved as PNG.');},'image/png');}
  toast(message) {const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.remove('hidden');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>toast.classList.add('hidden'),3200);}
  render() {
    this.renderer.info.reset();if(this.quality==='high')this.composer.render();else this.renderer.render(this.scene,this.camera);
    // Keep at most one animated frame in flight. Software graphics drivers can
    // otherwise queue expensive frames faster than they finish and starve input.
    const gl=this.renderer.getContext();if(this.gpuFence)gl.deleteSync(this.gpuFence);this.gpuFence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();this.dirty=false;
  }
  frame() {const dt=Math.min(this.clock.getDelta(),.1);if(document.hidden)return;if(this.game)this.game.update(dt);if(this.gpuFence){const gl=this.renderer.getContext();if(gl.clientWaitSync(this.gpuFence,0,0)===gl.TIMEOUT_EXPIRED)return;gl.deleteSync(this.gpuFence);this.gpuFence=null;}if(this.motion){this.time+=dt;this.active.sea.update(this.time);this.active.builder.animations.forEach(fn=>fn(this.time));this.dirty=true;}if(this.exploring)this.controls.update();if(this.dirty)this.render();}
}

const studio=new SceneStudio();studio.initialize().then(async()=>{if(new URLSearchParams(location.search).get('studio')!=='1'){const {DistrictGame}=await import('../campaign/game.js');new DistrictGame(studio);}}).catch(error=>{console.error(error);let loading=document.querySelector('#loading');if(!loading){loading=document.createElement('div');loading.className='loadscreen';document.body.append(loading);}loading.classList.add('error');loading.innerHTML='<div class="load-title">SCENE UNAVAILABLE</div><p>The 3D scene could not be initialized. Check that WebGL is enabled and the local assets are available.</p><button onclick="location.reload()">Reload scene</button>';});
