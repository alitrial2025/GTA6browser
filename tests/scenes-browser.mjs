import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, stat, readFile } from 'node:fs/promises';

const url=process.env.VICE_TEST_URL||'http://127.0.0.1:5175';
const output=new URL('../test-results/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
let server,browser,checks=0;const errors=[],failures=[];
function check(condition,message){assert.ok(condition,message);checks++;console.log(`PASS ${message}`);}
const watch=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});};
try{
  if(!process.env.VICE_TEST_URL){
    server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5175','--strictPort'],{stdio:['ignore','pipe','pipe']});
    let log='';server.stdout.on('data',b=>log+=b);server.stderr.on('data',b=>log+=b);
    let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw new Error(`Preview server failed: ${log}`);try{if((await fetch(url)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'Preview server becomes ready');
  }
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:720},acceptDownloads:true});watch(page);page.setDefaultTimeout(60000);
  await page.goto(url+'/?studio=1&quality=draft');await page.waitForFunction(()=>window.__VICE_SCENES__,undefined,{timeout:120000});
  const snapshot=()=>page.evaluate(()=>window.__VICE_SCENES__.snapshot());
  let state=await snapshot();
  check(state.scene==='03'&&state.buildings>=100&&state.palms>=180&&state.people>=25&&state.vehicles>=40,'default view loads the modeled resort neighborhood');
  check(!state.referenceVisible&&!state.comparing,'default scene renders 3D geometry without the original image overlay');
  const heights=await page.evaluate(()=>window.__VICE_SCENES__.characterHeights());
  check(heights.length>=25&&heights.every(h=>h>1.3&&h<2.1),'animated humanoids have realistic standing height');
  check(!state.motion,'reference camera starts with motion paused for inspection');
  await page.screenshot({path:output+'scene-03-viewer.png',timeout:120000});
  await page.getByRole('button',{name:'Explore the 3D scene',exact:true}).click();check((await snapshot()).exploring,'Explore enables orbit controls');
  const start=(await snapshot()).camera.position;
  await page.mouse.move(680,300);await page.mouse.down();await page.mouse.move(820,345,{steps:6});await page.mouse.up();
  await page.waitForFunction(p=>Math.hypot(...window.__VICE_SCENES__.snapshot().camera.position.map((v,i)=>v-p[i]))>5,start);
  check(JSON.stringify((await snapshot()).camera.position)!==JSON.stringify(start),'dragging changes the real 3D camera');
  await page.getByRole('button',{name:'Reset reference camera (R)',exact:true}).click();state=await snapshot();
  check(!state.exploring&&Math.hypot(...state.camera.position.map((v,i)=>v-[-80,62,153][i]))<.001,'reset restores the precise resort camera after orbiting');
  await page.getByRole('button',{name:'Compare with original reference (C)',exact:true}).click();check((await snapshot()).comparing&&await page.locator('#reference').isVisible(),'Compare explicitly displays the user reference');
  await page.waitForFunction(()=>document.querySelector('#reference-image').complete&&document.querySelector('#reference-image').naturalWidth===3840);
  await page.locator('#compare-slider').evaluate(e=>{e.value='68';e.dispatchEvent(new Event('input',{bubbles:true}));});
  check(await page.locator('#reference').evaluate(e=>e.style.clipPath.includes('32%')),'comparison slider changes the reference split');
  await page.screenshot({path:output+'scene-03-comparison.png',timeout:120000});
  await page.getByRole('button',{name:'Toggle warm afternoon lighting',exact:true}).click();check((await snapshot()).warm&&!(await snapshot()).comparing,'lighting control changes illumination and exits reference comparison');
  await page.getByRole('button',{name:'Toggle warm afternoon lighting',exact:true}).click();
  await page.locator('[data-scene="1"]').click();state=await snapshot();
  check(state.scene==='10'&&state.floors===99&&state.palms>=145&&state.buildings>=70,'scene switch loads both curved towers and their waterfront');
  check(!state.warm&&!state.exploring,'tower reference view is restored on scene selection');
  await page.screenshot({path:output+'scene-10-viewer.png',timeout:120000});
  await page.getByRole('button',{name:'Play scene animation (Space)',exact:true}).click();
  await page.waitForFunction(()=>window.__VICE_SCENES__.snapshot().time>.1);
  await page.getByRole('button',{name:'Pause scene animation (Space)',exact:true}).click();check(!(await snapshot()).motion&&(await snapshot()).time>.1,'scene motion advances and can be paused');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Save scene as PNG (S)',exact:true}).click();
  const download=await downloadPromise;await download.saveAs(output+'scene-10-export.png');
  const png=await readFile(output+'scene-10-export.png');check((await stat(output+'scene-10-export.png')).size>50000&&png.readUInt32BE(16)===960&&png.readUInt32BE(20)===540,'PNG export contains the rendered Draft-resolution frame');
  await page.getByRole('button',{name:'Hide interface (H)',exact:true}).click();check(!(await page.locator('.dock').isVisible())&&await page.locator('#restore').isVisible(),'clean view hides interface and provides a restore control');
  await page.locator('#restore').click();check(await page.locator('.dock').isVisible(),'controls can be restored');
  await page.getByRole('button',{name:'About these scenes',exact:true}).click();check(await page.locator('#credits').isVisible(),'scene information and asset attribution open');
  const creditHref=await page.locator('#credits a').getAttribute('href');check((await page.request.get(new URL(creditHref,page.url()).href)).ok(),'asset credits link resolves');await page.getByRole('button',{name:'Close scene information',exact:true}).click();
  for(const [index,code,minimumPeople]of[[2,'PG06',25],[3,'LK05',20],[4,'VC09',8]]){
    await page.locator(`[data-scene="${index}"]`).click();state=await snapshot();
    check(state.scene===code&&state.people>=minimumPeople,`${code} loads its authored setting and people`);
    if(index===2)check(state.sunset&&state.buildings>=8&&state.realisticCars===4,'Gellhorn includes sunset, trailers, industrial buildings and detailed coupes');
    if(index===3)check(!state.sunset&&state.boats>=14&&state.palms>=50,'Keys restores daylight and includes a populated fleet and wooded shore');
    if(index===4)check(state.realisticCars===4&&state.vehicles>=8,'mural street includes the blue classic coupe, traffic, motorcycles and ATVs');
    await page.locator('#compare').click();await page.waitForFunction(()=>{const e=document.querySelector('#reference-image');return e.complete&&e.naturalWidth===3840;});
    check(await page.locator('#reference-image').evaluate(e=>e.alt.includes(window.__VICE_SCENES__.snapshot().title)),`${code} comparison loads the correct reference and accessible label`);
    await page.locator('#compare').click();await page.screenshot({path:output+`scene-${code}-viewer.png`,timeout:120000});
  }
  await page.locator('[data-scene="1"]').click();
  await page.locator('#quality').selectOption('high');await page.waitForFunction(()=>window.__VICE_SCENES__.snapshot().quality==='high');
  await page.screenshot({path:output+'scene-10-high.png',timeout:120000});check((await snapshot()).calls>100,'High renders modeled geometry with reflective water, shadows and ambient occlusion');
  await page.locator('#quality').evaluate(e=>e.blur());await page.keyboard.press('1');await page.waitForFunction(()=>window.__VICE_SCENES__.snapshot().scene==='03');await page.screenshot({path:output+'scene-03-high.png',timeout:120000});
  check((await snapshot()).scene==='03','keyboard scene shortcut selects the resort at High quality');await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});watch(mobile);mobile.setDefaultTimeout(60000);
  await mobile.goto(url+'/?studio=1&scene=10&quality=draft');await mobile.waitForFunction(()=>window.__VICE_SCENES__,undefined,{timeout:120000});
  check(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile controls fit the viewport');
  await mobile.locator('[data-scene="4"]').tap();check((await mobile.evaluate(()=>window.__VICE_SCENES__.snapshot())).scene==='VC09','mobile scene strip scrolls to the fifth scene');await mobile.locator('[data-scene="1"]').tap();
  check((await mobile.evaluate(()=>window.__VICE_SCENES__.snapshot())).scene==='10','direct scene URL selects the waterfront');
  await mobile.getByRole('button',{name:'Compare with original reference (C)',exact:true}).tap();
  const aspect=await mobile.locator('#world canvas').evaluate(e=>e.clientWidth/e.clientHeight);check(Math.abs(aspect-16/9)<.01,'mobile comparison fits the reference aspect ratio without distortion');
  await mobile.screenshot({path:output+'scene-mobile-comparison.png',timeout:120000});
  check(errors.length===0,`no JavaScript or shader errors (${errors.join('; ')})`);check(failures.length===0,`all local models, textures, references and fonts load (${failures.join('; ')})`);
  console.log(`\n${checks} scene browser checks passed. Screenshots: ${output}`);
}finally{await browser?.close();server?.kill('SIGTERM');}
