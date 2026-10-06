import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';

const url = process.env.VICE_TEST_URL || 'http://127.0.0.1:5174';
const output = new URL('../test-results/', import.meta.url).pathname;
await mkdir(output, { recursive: true });
let server, browser;
const errors = [], failures = []; let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; console.log(`PASS ${message}`); };
try {
  if (!process.env.VICE_TEST_URL) {
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], { stdio: ['ignore', 'pipe', 'pipe'] });
    let log = ''; server.stdout.on('data', b => log += b); server.stderr.on('data', b => log += b);
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw new Error(`Preview server failed: ${log}`);
      try { const response = await fetch(url); if (response.ok) break; } catch { /* Wait for server startup. */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 740 }, acceptDownloads: true });
  const watch = p => {
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
  };
  watch(page);
  // Software-rendered CI uses Low; High is explicitly tested later.
  await page.addInitScript(() => { if (!localStorage.getItem('vice-horizon-save-v1')) localStorage.setItem('vice-horizon-save-v1', JSON.stringify({ settings: { quality: 'low', volume: 0 } })); });
  await page.goto(url + '/?mode=prototype');
  await page.waitForFunction(() => window.__VICE_HORIZON__, undefined, { timeout: 90000 });
  await page.waitForSelector('#loading', { state: 'detached' });
  const snapshot = () => page.evaluate(() => window.__VICE_HORIZON__.snapshot());
  const ready = await snapshot();
  check(ready.buildings >= 740 && ready.palms >= 700 && ready.detailedCar, 'world and detailed GLB car load');
  check(ready.traffic === 28 && ready.pedestrians === 90, 'traffic and civilian populations exist');
  await page.screenshot({ path: output + '01-landing.png' });
  await page.getByRole('button', { name: 'ENTER THE CITY', exact: true }).click();
  check((await snapshot()).playing, 'enter city starts playable mode');
  const initial = (await snapshot()).position;
  await page.keyboard.down('w');
  await page.waitForFunction(z => window.__VICE_HORIZON__.snapshot().position.z < z - 2, initial.z, { timeout: 45000 });
  await page.keyboard.up('w');
  check((await snapshot()).speed > 1, 'keyboard input accelerates the physical car');
  await page.screenshot({ path: output + '02-driving.png' });
  await page.keyboard.press('r');
  await page.waitForFunction(() => Math.abs(window.__VICE_HORIZON__.snapshot().speed) < .1, undefined, { timeout: 15000 });
  await page.keyboard.press('e'); await page.waitForFunction(() => !window.__VICE_HORIZON__.snapshot().driving, undefined, { timeout: 15000 });
  check(!(await snapshot()).driving, 'exit car switches to walking');
  const foot = (await snapshot()).position;
  await page.keyboard.down('w');
  await page.waitForFunction(p => Math.hypot(window.__VICE_HORIZON__.snapshot().position.x - p.x, window.__VICE_HORIZON__.snapshot().position.z - p.z) > 1, foot, { timeout: 30000 });
  await page.keyboard.up('w'); check(!(await snapshot()).driving, 'walking moves the player independently');
  await page.keyboard.press('e'); await page.waitForFunction(() => window.__VICE_HORIZON__.snapshot().driving, undefined, { timeout: 15000 });
  check((await snapshot()).driving, 'nearby player can re-enter the car');
  await page.keyboard.press('j'); await page.waitForFunction(() => window.__VICE_HORIZON__.snapshot().mission === 'coast', undefined, { timeout: 15000 });
  check(await page.locator('#objective').isVisible(), 'chapter displays the active objective');
  await page.keyboard.press('m'); await page.waitForSelector('#full-map');
  check((await snapshot()).paused, 'world map pauses simulation');
  await page.screenshot({ path: output + '03-world-map.png' });
  await page.locator('[data-action="district"][data-index="4"]').click();
  await page.getByRole('button', { name: 'TRAVEL HERE' }).click();
  await page.waitForFunction(() => window.__VICE_HORIZON__.snapshot().completed === 1, undefined, { timeout: 15000 });
  check((await snapshot()).cash === 2450, 'reaching chapter destination awards exactly one reward');
  check(await page.evaluate(() => JSON.parse(localStorage.getItem('vice-horizon-save-v1')).missions.completed === 1), 'chapter progress persists locally');
  await page.keyboard.press('Escape'); await page.waitForSelector('.panel-pause');
  const pausedPosition = (await snapshot()).position;
  await page.keyboard.down('w'); await page.waitForTimeout(300); await page.keyboard.up('w');
  check(JSON.stringify((await snapshot()).position) === JSON.stringify(pausedPosition), 'pause blocks driving input and motion');
  await page.getByRole('button', { name: 'YOUR GARAGE' }).click();
  await page.locator('[data-action="vehicle"][data-index="1"]').click();
  await page.locator('[data-action="paint"]').nth(3).click();
  check((await snapshot()).vehicle === 1 && await page.locator('#garage-preview').isVisible(), 'garage switches vehicle and renders 3D preview');
  await page.screenshot({ path: output + '04-garage.png' });
  await page.getByRole('button', { name: 'TAKE A DRIVE' }).click();
  await page.keyboard.press('p'); await page.waitForSelector('#photo-ui:not(.hidden)');
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'SAVE PHOTO' }).click();
  const download = await downloadPromise; await download.saveAs(output + '05-photo.png');
  check((await stat(output + '05-photo.png')).size > 10000, 'photo mode exports a rendered PNG');
  await page.getByRole('button', { name: 'BACK TO THE CITY' }).click();
  await page.keyboard.press('m'); await page.waitForSelector('#full-map');
  await page.locator('[data-action="district"][data-index="7"]').click(); await page.getByRole('button', { name: 'TRAVEL HERE' }).click();
  await page.waitForFunction(() => window.__VICE_HORIZON__.snapshot().position.z > 2500, undefined, { timeout: 15000 });
  check((await snapshot()).position.x > 590, 'fast travel reaches the island region');
  await page.screenshot({ path: output + '06-the-keys.png' });
  await page.keyboard.press('Escape'); await page.waitForSelector('.panel-pause'); await page.getByRole('button', { name: 'SETTINGS', exact: true }).click();
  await page.locator('[data-setting="time"]').selectOption('night');
  await page.locator('[data-setting="weather"]').selectOption('rain');
  await page.locator('[data-setting="quality"]').selectOption('high');
  await page.locator('[data-setting="traffic"]').uncheck();
  const settings = (await snapshot()).settings;
  check(settings.time === 'night' && settings.weather === 'rain' && settings.quality === 'high' && !settings.traffic, 'graphics, time, weather and traffic controls apply');
  await page.getByRole('button', { name: 'Close dialog' }).click(); await page.waitForTimeout(1500);
  await page.screenshot({ path: output + '07-night-rain-high.png' });
  await page.close();
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); watch(mobile);
  await mobile.addInitScript(() => localStorage.setItem('vice-horizon-save-v1', JSON.stringify({ settings: { quality: 'low', volume: 0 } })));
  await mobile.goto(url + '/?mode=prototype'); await mobile.waitForFunction(() => window.__VICE_HORIZON__, undefined, { timeout: 90000 }); await mobile.waitForSelector('#loading', { state: 'detached' });
  check(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile landing fits the viewport');
  await mobile.screenshot({ path: output + '08-mobile-landing.png' });
  await mobile.getByRole('button', { name: 'ENTER THE CITY', exact: true }).tap();
  check(await mobile.locator('[data-touch="gas"]').isVisible(), 'mobile gameplay provides touch controls');
  await mobile.screenshot({ path: output + '09-mobile-game.png' });
  check(errors.length === 0, `no browser JavaScript or shader errors (${errors.join('; ')})`);
  check(failures.length === 0, `no failed asset requests (${failures.join('; ')})`);
  console.log(`\n${checks} browser checks passed. Screenshots: ${output}`);
} finally {
  await browser?.close(); server?.kill('SIGTERM');
}
