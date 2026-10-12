// Optional visual verification: use an existing Playwright install, no runtime dependency.
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createApp } from '../src/server.ts';
import { Store } from '../src/store.ts';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const facts = JSON.parse(await readFile(new URL('../src/settings/ui-facts.json', import.meta.url), 'utf8'));
const checks = [];
const dir = await mkdtemp(join(tmpdir(), 'visual-')), server = createApp(new Store(join(dir, 'data.json')));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const out = new URL('../docs/verification/screenshots/', import.meta.url);
await mkdir(out, { recursive: true });
let browser;
try {
 browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true, args: ['--no-sandbox'] });
 const context = await browser.newContext({ viewport: { width: 1270, height: 764 }, deviceScaleFactor: 2 });
 assert.equal((await context.request.post(base + '/api/auth/register', { headers: { 'X-Local-Request': '1' }, data: { email: 'visual@example.invalid', password: 'local-visual-verification' } })).status(), 200);
 const page = await context.newPage(), errors = [], measurements = {};
 page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });

 page.setDefaultTimeout(10000);
 const capture = async name => {
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(1260, 750);
  assert.doesNotMatch(await page.locator('body').innerText(), /cursor/i);
  measurements[name] = await page.evaluate(() => Object.fromEntries(['aside','h1','h2','.card','.setting-row','input','.brand','.destination','.side-nav .destination:nth-child(2)','.chat-gate'].map(selector => {
   const el = document.querySelector(selector); if (!el) return [selector, null];
   const r = el.getBoundingClientRect(), s = getComputedStyle(el);
   return [selector, { x:r.x, y:r.y, width:r.width, height:r.height, fontSize:s.fontSize, lineHeight:s.lineHeight, padding:s.padding, gap:s.gap, background:s.backgroundColor }];
  })));
  await page.screenshot({ path: new URL(name + '.png', out).pathname });
 };
 for (const section of ['', 'linear', 'mcp', 'accounts', 'general']) {
  await page.goto(base + '/settings' + (section ? '/' + section : ''));
  await page.locator('nav a[aria-current=page]').waitFor();
  if (section === 'accounts') await page.getByText('visual@example.invalid').waitFor();
  if (section === 'mcp') await page.getByText('No MCP servers configured').waitFor();
  assert.deepEqual(await page.locator('nav a').allTextContents(), ['Linear connection','MCP connectors','Accounts','General']);
  await capture('settings-' + (section || 'index'));
  // Compare only retained geometry, not removed reference sections or synthetic identity.
  for (const [selector, target, dimensions, styles] of [
   ['aside','st-side',['x','y','width','height'],['background-color']],
   ['h1','st-title',['x','y','height'],['font-size','font-weight','line-height','font-family']],
   ['h2','st-privacy-head',['x','y','width','height'],['padding']],
   ['.card','st-profile',['x','width'],['border-radius','background-color']],
   ['.setting-row','st-email-row',['x','width','height'],['padding','gap']],
   ['.setting-label','st-email-label',['x','width'],['font-size','line-height']],
   ...(section === 'general' ? [['input','st-first',['x','width','height'],['font-size','line-height','border-radius','padding']]] : []),
  ]) {
   const fact = facts.find(f => f.id === 'settings-account:' + target);
   const actual = await page.locator(selector).first().evaluate((el, keys) => {
    const rect = el.getBoundingClientRect(), style = getComputedStyle(el);
    return { rect: Object.fromEntries(keys.dimensions.map(k => [k,rect[k]])), style: Object.fromEntries(keys.styles.map(k => [k,style.getPropertyValue(k)])) };
   }, { dimensions, styles });
   for (const key of dimensions) { assert.ok(Math.abs(actual.rect[key] - fact.value.rect[key]) < .1, `${section} ${selector} ${key}: ${actual.rect[key]} != ${fact.value.rect[key]}`); checks.push(`${section || 'index'} ${fact.id} rect.${key}`); }
   for (const key of styles) { assert.equal(actual.style[key],fact.value.style[key],`${section} ${selector} ${key}`); checks.push(`${section || 'index'} ${fact.id} style.${key}`); }
  }
 }
 await page.goto(base + '/chat');
 await page.getByRole('link', { name: 'Connect to Linear' }).waitFor();
 await capture('chat-disconnected');
 const centered = await page.locator('.chat-gate').evaluate(el => {
  const a = el.getBoundingClientRect(), b = el.querySelector('h1').getBoundingClientRect();
  return { dx: Math.abs(a.x+a.width/2-b.x-b.width/2), dy: Math.abs(a.y+a.height/2-b.y-b.height/2), underline:getComputedStyle(el.querySelector('span')).textDecorationLine };
 });
 assert.ok(centered.dx < 1 && centered.dy < 1);assert.equal(centered.underline,'underline');
 assert.equal(await page.getByRole('link',{name:'New Chat',exact:true}).getAttribute('aria-current'),'page');
 await page.getByRole('link', { name: 'Connect to Linear' }).click();
 await page.waitForURL(base + '/settings/linear');
 await page.goto(base + '/automations?state=upgrade');
 await page.locator('.shell-sidebar').waitFor();
 await capture('sidebar-expanded');
 await page.locator('[data-act=collapse]').click();
 await page.waitForTimeout(250);
 await capture('sidebar-rail');
 {
  assert.equal(measurements['sidebar-expanded'].aside.width, 280);
  assert.equal(measurements['sidebar-rail'].aside.width, 44);
  const selectedRow = '.side-nav .destination:nth-child(2)';
  assert.equal(measurements['sidebar-expanded'][selectedRow].y,77);
  assert.equal(measurements['sidebar-expanded'][selectedRow].height,32);
  assert.equal(measurements['sidebar-rail'][selectedRow].y,80);
  assert.equal(measurements['sidebar-rail'][selectedRow].height,26);
  await page.getByRole('link',{name:'Automations',exact:true}).focus();
  await page.getByRole('link',{name:'Automations',exact:true}).hover();
  await page.getByRole('link',{name:'Automations',exact:true}).dispatchEvent('dragover');
  assert.equal(await page.locator('.sidebar-surface').evaluate(el => el.getBoundingClientRect().width),44);
  await page.getByRole('button', { name: 'Open sidebar' }).click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('aside').evaluate(el => el.getBoundingClientRect().width), 280);
 }
 assert.deepEqual(errors, []);
 await writeFile(new URL('measurements.json', out), JSON.stringify({ capturedAt:new Date().toISOString(), comparisonCount:checks.length, checks, viewport:{width:1270,height:764,devicePixelRatio:2}, browser:browser.version(), measurements }, null, 2) + '\n');
 console.log('Visual captures and browser checks passed.');
} finally { await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive:true, force:true }); }
