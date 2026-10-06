import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
const url=(process.env.VICE_TEST_URL||'http://127.0.0.1:5177').replace(/\/$/,''),output=new URL('../test-results/',import.meta.url).pathname;
let browser,server,count=0;const errors=[],failed=[];const check=(condition,message)=>{assert.ok(condition,message);count++;console.log('PASS '+message);};
await mkdir(output,{recursive:true});
try{
 if(!process.env.VICE_TEST_URL){server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5177','--strictPort'],{stdio:'ignore'});let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'Preview ready');}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1280,height:720}});page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url())});
 await page.goto(url+'/?quality=draft');await page.waitForFunction(()=>window.__VICE_GAME__,undefined,{timeout:120000});const state=()=>page.evaluate(()=>window.__VICE_GAME__.snapshot());
 check(!(await state()).started&&await page.locator('#begin-game').isVisible(),'default app opens the campaign start screen');
 await page.screenshot({path:output+'game-start.png',timeout:120000});await page.locator('#begin-game').click();
 let s=await state();check(s.started&&!s.paused&&s.district==='resort'&&s.occupied&&s.mission.id==='resort-delivery','entering the game starts a real district mission in the sports car');
 check(s.colliders>50,'district architecture and parked cars have physical collision bodies');
 const start=s.position;await page.keyboard.down('w');await page.waitForFunction(p=>{const s=window.__VICE_GAME__.snapshot();return Math.hypot(s.position[0]-p[0],s.position[2]-p[2])>3;},start,{timeout:90000});await page.keyboard.up('w');check((await state()).speed>0,'W accelerates the physical car and changes its world position');
 await page.keyboard.press('r');await page.keyboard.press('e');check(!(await state()).occupied,'E exits the stopped car into third-person walking');
 const foot=(await state()).position;await page.keyboard.down('w');await page.waitForFunction(p=>{const s=window.__VICE_GAME__.snapshot();return Math.hypot(s.position[0]-p[0],s.position[2]-p[2])>1;},foot);await page.keyboard.up('w');check(!(await state()).occupied,'on-foot controls move the actual avatar');
 await page.keyboard.press('e');check((await state()).occupied,'E boards the nearby vehicle again');
 await page.keyboard.press('c');check((await state()).cameraMode===1,'camera control changes the driving perspective');await page.keyboard.press('c');await page.keyboard.press('c');
 await page.locator('#open-garage').click();check((await state()).paused&&await page.locator('#game-menu').isVisible(),'garage pauses gameplay and opens vehicle customization');
 await page.locator('[data-paint="#ba5545"]').click();check((await state()).color==='#ba5545'&&await page.evaluate(()=>JSON.parse(localStorage.getItem('vice-horizon-campaign-v1')).color)==='#ba5545','paint changes are persisted in browser storage');
 await page.locator('#upgrade-engine').click();check((await state()).upgrade===0,'garage blocks an upgrade when the player lacks cash');await page.locator('#close-menu').click();
 await page.locator('#open-map').click();check(await page.locator('[data-travel]').count()===5,'map exposes all five playable scene districts');
 for(const [i,id]of[[1,'towers'],[2,'gellhorn'],[4,'murals']]){await page.locator('[data-travel="'+i+'"]').click();check((await state()).district===id,'travel loads playable '+id);await page.locator('#close-menu').click();await page.screenshot({path:output+'game-'+id+'.png',timeout:120000});await page.locator('#open-map').click();}
 await page.locator('[data-travel="3"]').click();await page.locator('[data-mission="keys-race"]').click();check((await state()).marine&&!((await state()).paused)&&(await state()).mission.id==='keys-race','Keys race starts in a controllable center-console boat');
 const boat=(await state()).position;await page.keyboard.down('w');await page.waitForFunction(p=>{const s=window.__VICE_GAME__.snapshot();return Math.hypot(s.position[0]-p[0],s.position[2]-p[2])>5;},boat);await page.keyboard.down('Shift');await page.waitForFunction(()=>window.__VICE_GAME__.snapshot().nitro<95);await page.keyboard.up('Shift');await page.keyboard.up('w');
 check((await state()).nitro<100&&(await state()).speed>3,'boat acceleration and nitro affect physical motion and consume boost');
 await page.screenshot({path:output+'game-keys.png',timeout:120000});await page.locator('#open-map').click();await page.locator('[data-mission="keys-escape"]').click();check((await state()).heat===2,'escape mission activates the pursuit system');
 await page.keyboard.press('Escape');check((await state()).paused,'Escape pauses the game');const elapsed=(await state()).mission.elapsed;await page.waitForTimeout(400);check((await state()).mission.elapsed===elapsed,'paused mission timers do not advance');
 await page.locator('#close-menu').click();await page.locator('#game-sound').click();check(await page.locator('#game-sound').textContent()==='SOUND OFF','audio can be muted from the HUD');
 await page.reload();await page.waitForFunction(()=>window.__VICE_GAME__,undefined,{timeout:120000});await page.locator('#begin-game').click();check((await state()).district==='keys'&&(await state()).color==='#ba5545','refresh restores the saved district and garage paint');
 await page.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.setDefaultTimeout(90000);mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url+'/?quality=draft&district=gellhorn');await mobile.waitForFunction(()=>window.__VICE_GAME__,undefined,{timeout:120000});await mobile.locator('#begin-game').tap();
 check(await mobile.locator('.touch-drive').isVisible()&&await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile play has touch controls that fit the viewport');
 const before=await mobile.evaluate(()=>window.__VICE_GAME__.snapshot().position);const client=await mobile.context().newCDPSession(mobile),box=await mobile.locator('[data-drive="forward"]').boundingBox();await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});
 await mobile.waitForFunction(p=>{const s=window.__VICE_GAME__.snapshot();return Math.hypot(s.position[0]-p[0],s.position[2]-p[2])>1;},before);await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});check(true,'touch acceleration moves the vehicle');
 await mobile.screenshot({path:output+'game-mobile.png',timeout:120000});
 check(errors.length===0,'no game JavaScript or shader errors: '+errors.join('; '));check(failed.length===0,'game assets load without HTTP failures: '+failed.join('; '));console.log('\n'+count+' campaign browser checks passed.');
}finally{await browser?.close();server?.kill('SIGTERM');}
