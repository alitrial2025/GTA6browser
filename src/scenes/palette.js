import * as THREE from 'three';
import { seededRandom } from '../game/math.js';
import { tiledTexture } from '../world/textures.js';

export function paintedTexture(width, height, draw) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8; return texture;
}

function grainTexture(color, seed, strength = 18) {
  const random = seededRandom(seed);
  return paintedTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 62000; i++) {
      const v = Math.floor(random() * 150); ctx.fillStyle = `rgba(${v},${v},${v},${strength / 100})`;
      ctx.fillRect(random() * w, random() * h, 1 + random(), 1 + random());
    }
  });
}

export function facadeTexture(seed, warm = false) {
  const random = seededRandom(seed);
  return paintedTexture(512, 1024, (ctx, w, h) => {
    ctx.fillStyle = warm ? '#e1d7c5' : '#dddeda'; ctx.fillRect(0, 0, w, h);
    for (let row = 0; row < 24; row++) for (let col = 0; col < 10; col++) {
      const x = col * w / 10, y = row * h / 24, ww = w / 10, hh = h / 24;
      ctx.fillStyle = '#b7b9b5'; ctx.fillRect(x + 7, y + 6, ww - 13, hh - 9);
      const brightness = Math.floor(67 + random() * 67);
      ctx.fillStyle = `rgb(${brightness},${brightness + 9},${brightness + 13})`; ctx.fillRect(x + 9, y + 8, ww - 17, hh - 13);
      if (random() > .4) { ctx.fillStyle = '#cac7b6'; ctx.globalAlpha = .6; ctx.fillRect(x + 9, y + 8, (ww - 17) * random(), hh - 13); ctx.globalAlpha = 1; }
      ctx.fillStyle = '#edece5'; ctx.fillRect(x + ww * .5, y + 8, 1.4, hh - 13);
      ctx.fillStyle = 'rgba(10,27,32,.2)'; ctx.fillRect(x, y + hh - 3, ww, 3);
    }
  });
}

export function makePalette() {
  const concrete = grainTexture('#d8d6cc', 411, 9), road = grainTexture('#535858', 4, 35);
  concrete.wrapS = concrete.wrapT = road.wrapS = road.wrapT = THREE.RepeatWrapping;
  concrete.repeat.set(3, 3); road.repeat.set(24, 24);
  const wall = grainTexture('#f1efe9', 89, 5); wall.wrapS = wall.wrapT = THREE.RepeatWrapping; wall.repeat.set(4, 4);
  const glassMap = paintedTexture(256, 512, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, '#87939b'); gradient.addColorStop(.4, '#464d54'); gradient.addColorStop(1, '#b0b8bc');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c6c5b1'; ctx.globalAlpha = .22; for (let x = 10; x < w; x += 15) ctx.fillRect(x, 0, 6, h);
  });
  const standard = (color, extras = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, ...extras });
  const palette = {
    white: standard('#fffdf5', { map: wall, bumpMap: concrete, bumpScale: .025 }),
    cream: standard('#ddd9cd', { map: concrete, bumpMap: concrete, bumpScale: .03 }),
    concrete: standard('#bab9ae', { map: concrete, bumpMap: concrete, bumpScale: .04 }),
    asphalt: standard('#a4a6a0', { map: road, bumpMap: road, bumpScale: .025, roughness: .99 }),
    brick: standard('#a57f67', { map: concrete, bumpMap: concrete, bumpScale: .07 }),
    dark: standard('#30363a'), black: standard('#151c20'),
    glass: new THREE.MeshPhysicalMaterial({ color: '#66727a', map: glassMap, roughness: .3, metalness: .22, clearcoat: 0, envMapIntensity: .35 }),
    glassDark: new THREE.MeshPhysicalMaterial({ color: '#424f54', roughness: .19, metalness: .38 }),
    glassRail: new THREE.MeshStandardMaterial({ color: '#6f8289', transparent: true, opacity: .21, roughness: .5, metalness: .05, depthWrite: false }),
    metal: standard('#b1b4af', { metalness: .7, roughness: .3 }),
    frame: standard('#a9aba2', { metalness: .5, roughness: .42 }),
    blue: standard('#234b89'), terracotta: standard('#ba795a'),
    wood: standard('#9d886b', { map: tiledTexture('wood', 1, 1), bumpMap: tiledTexture('woodBump', 1, 1), bumpScale: .03 }),
    grass: standard('#748365', { map: tiledTexture('grass', 32, 32), normalMap: tiledTexture('grassNormal', 32, 32), normalScale: new THREE.Vector2(.2, .2) }),
    trunk: standard('#8c8061', { map: concrete, bumpMap: concrete, bumpScale: .09 }),
    leaf: ['#3d562b', '#4a622e', '#65783b', '#344c26'].map(color => standard(color, { side: THREE.DoubleSide })),
    foliage: ['#57713e', '#456032', '#708446'].map(color => standard(color, { roughness: 1 })),
    waterPool: new THREE.MeshPhysicalMaterial({ color: '#4aafa9', roughness: .15, metalness: .28, clearcoat: 1 }),
    courtGreen: standard('#407463', { map: concrete }), courtBlue: standard('#315975', { map: concrete }),
    yellow: standard('#ecd087'), red: standard('#ba5545'), pink: standard('#c9827c'),
    facades: Array.from({ length: 7 }, (_, i) => standard('#f5f3e9', { map: facadeTexture(i * 83 + 12, i % 3 === 0) })),
    curtainFacades: ['#8098a4','#78909d','#9cabad'].map((color,index)=>standard(color,{roughness:.42,metalness:.18,map:paintedTexture(512,1024,(ctx,w,h)=>{
      const r=seededRandom(55+index),g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#628290');g.addColorStop(.5,'#a0b9c3');g.addColorStop(1,'#446575');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      for(let row=0;row<40;row++)for(let col=0;col<14;col++){
        const x=col*w/14,y=row*h/40;ctx.fillStyle=r()>.5?'#d1dada':'#203a4a';ctx.globalAlpha=.04+r()*.14;ctx.fillRect(x,y,w/14,h/40);
      }ctx.globalAlpha=1;ctx.fillStyle='#a5b8bd';for(let x=0;x<w;x+=w/14)ctx.fillRect(x,0,1.2,h);for(let y=0;y<h;y+=h/40)ctx.fillRect(0,y,w,1.4);
    })})),
  };
  return palette;
}
