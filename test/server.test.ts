import { signIn } from './http-helper.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { createApp } from '../src/server.ts';
import { Store } from '../src/store.ts';
import { draft } from '../src/automations/model.ts';
test('HTTP server serves original UI and protects mutation and private files',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'automations-')), server=createApp(new Store(join(dir,'state.json')));
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  t.after(async()=>{await new Promise<void>(r=>server.close(()=>r()));await rm(dir,{recursive:true,force:true});});
  const origin=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  for(const path of ['/codebase','/codebases','/chat','/search','/agents','/editor']) {
    const page=await fetch(origin+path,{redirect:'manual'});
    assert.equal(page.status,404);assert.match(await page.text(),/Page not found/);
  }
  const send=await signIn(origin);
  for(const path of ['/codebase','/codebases','/chat','/search']) {
    const page=await send(path);assert.equal(page.status,404);assert.match(await page.text(),/Back to Automations/);
  }
  for(const path of ['/dashboard','/dashboard/settings','/dashboard/integrations','/dashboard/spending']){
    const settings=await send(path);assert.equal(settings.status,404);assert.match(await settings.text(),/Page not found/);
  }
  assert.equal((await send('/dashboard/unknown')).status,404);
  assert.equal((await send('/api/settings',{method:'POST',headers:{'x-local-request':'1'},body:'{}'})).status,404);
  assert.equal((await send('/reference/settings/navigation-2026-10-12/settings-account.json')).status,404);
  const page=await send('/automations/new'); assert.equal(page.status,200);
  assert.match(page.headers.get('content-security-policy')!,/frame-ancestors 'none'/);
  assert.match(await page.text(),/\/app.ts/);
  assert.match(await (await send('/app.ts')).text(),/function render/);
  for (const path of ['/reference/automations/routes.har','/store.ts','/package.json','/api/unknown']) assert.equal((await send(path)).status,404);
  assert.equal((await send('/api/automations',{method:'POST',body:'{}'})).status,403);
  const headers={'x-local-request':'1','content-type':'application/json',origin};
  const connection=await send('/api/configurations',{method:'POST',headers,body:JSON.stringify({
    text:JSON.stringify({mcpServers:{test:{url:'https://example.com/mcp',headers:{Authorization:'secret-fixture'}}}})})});
  assert.equal(connection.status,200);const {ref}=await connection.json();
  assert.equal((await send(`/api/configurations/${ref}`)).status,403);
  const detail=await send(`/api/configurations/${ref}`,{headers});assert.equal(detail.status,200);
  assert.equal((await detail.json()).headers.Authorization,'secret-fixture');
  assert.doesNotMatch(await (await send('/api/state')).text(),/secret-fixture/);
  assert.equal((await send('/api/automations',{method:'POST',headers:{...headers,origin:'https://attacker.invalid'},body:'{}'})).status,403);
  assert.equal((await send('/api/automations',{method:'POST',headers,body:'{'})).status,400);
  assert.equal((await send('/api/automations',{method:'POST',headers,body:' '.repeat(66000)})).status,413);
  const saved=await send('/api/automations',{method:'POST',headers,body:JSON.stringify({...draft(),name:'Local'})});
  assert.equal(saved.status,200); const item=await saved.json(); assert.ok(item.id);
  assert.equal((await send(`/api/automations/${item.id}/runs`,{method:'POST',headers,body:'{}'})).status,400);
  assert.equal((await (await send('/api/state')).json()).automations.length,1);
  assert.equal((await send(`/api/automations/${item.id}?revision=99`,{method:'DELETE',headers})).status,409);
  assert.equal((await send(`/api/automations/${item.id}?revision=1`,{method:'DELETE',headers})).status,200);
  assert.equal((await (await send('/api/state')).json()).automations.length,0);
});
