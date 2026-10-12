// Optional browser gate. Reuses an installed Playwright; no product dependency.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createApp } from '../src/server.ts';
import { Store } from '../src/store.ts';
import { draft } from '../src/automations/model.ts';
if(!process.env.PLAYWRIGHT_MODULE)throw Error('Set PLAYWRIGHT_MODULE to an installed playwright-core/index.mjs.');
const { chromium }=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const dir=await mkdtemp(join(tmpdir(),'automations-browser-')),store=new Store(join(dir,'state.json'));
const automation=await store.save({...draft(),name:'Schedule QA'}),server=createApp(store);
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
 browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1270,height:764}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/codebases','/codebase','/chat','/search']){
  const r=await page.request.get(base+path);assert.equal(r.status(),404);assert.match(await r.text(),/Page not found/);
 }
 await page.goto(base+'/login');
 const signed=await page.request.post(base+'/api/auth/register',{headers:{'X-Local-Request':'1'},data:{email:'qa@example.invalid',password:'qa-local-passphrase'}});
 assert.equal(signed.status(),200);
 await page.goto(base+'/automations/'+automation.id);
 await page.click('[data-act=tr-add]');await page.click('[data-act=sc-scheduled]');
 await page.click('[data-act="sc-preset:2"]');
 await page.locator('[name=sc-time]').fill('10:25');await page.locator('[name=sc-day]').selectOption('2');
 await page.click('[aria-label="Select timezone"]');await page.fill('[name=sc-search]','Tokyo');await page.click('[data-act="sc-zone-pick:Asia/Tokyo"]');
 await page.click('[data-act=save]');await page.waitForFunction(()=>document.querySelector('[data-act=save]')?.disabled);
 await page.reload();assert.equal(await page.locator('[name=sc-time]').inputValue(),'10:25');
 assert.match(await page.locator('.sc-zone').textContent(),/Asia\/Tokyo/);
 const saved=await store.read();assert.equal(saved.automations[0].triggers[0].value,'25 10 * * 2');
 await page.click('[data-act=collapse]');
 assert.equal(await page.locator('.sidebar-surface').evaluate(e=>e.getBoundingClientRect().width),44);
 assert.equal(await page.locator('a[aria-label=Automations] svg').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await page.mouse.move(500,400);await page.locator('a[aria-label=Automations]').hover();
 assert.equal(await page.locator('.sidebar-surface').evaluate(e=>e.getBoundingClientRect().width),280);
 await page.mouse.move(500,400);assert.equal(await page.locator('.sidebar-surface').evaluate(e=>e.getBoundingClientRect().width),44);
 await page.locator('a[aria-label=Automations]').dispatchEvent('dragover');assert.equal(await page.locator('.drag-hover').count(),1);
 await page.locator('a[aria-label=Automations]').dispatchEvent('drop');assert.equal(await page.locator('.drag-hover').count(),0);
 await page.click('[data-act^="sc-open:"]');await page.click('[data-act="sc-preset:3"]');
 assert.equal(await page.locator('.sc-custom').evaluate(e=>e.getBoundingClientRect().width),340);
 await page.fill('[name=sc-cron]','bad');await page.click('[data-act=sc-apply]');assert.equal(await page.locator('.sc-error').count(),1);
 await page.keyboard.press('Escape');assert.equal(await page.locator('.sc-custom').count(),1);
 await page.fill('[name=sc-cron]','0 9 * * 1-5');await page.click('[data-act=sc-apply]');assert.equal(await page.locator('.sc-custom').count(),0);
 await page.click('[data-act=save]');await page.waitForFunction(()=>document.querySelector('[data-act=save]')?.disabled);
 await page.locator('a[aria-label="Run History"]').click();assert.match(page.url(),/automations\/runs/);
 assert.equal(await page.locator('body.collapsed').count(),1);
 assert.equal(await page.locator('a[aria-label="Run History"]').getAttribute('aria-current'),'page');
 await page.keyboard.press('Escape');await page.mouse.move(500,400);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('a[aria-label=Automations] svg').evaluate(e=>getComputedStyle(e).visibility),'visible');
 await page.locator('a[aria-label=Automations]').click();assert.match(page.url(),/\/automations$/);
 assert.deepEqual(errors,[]);
 console.log('Browser checks passed: persistence, presets, custom cron, timezone, compact navigation, hover/drag, mobile icons and 404s.');
} finally {
 await browser?.close();await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true});
}
