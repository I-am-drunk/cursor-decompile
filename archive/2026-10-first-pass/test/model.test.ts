import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { draft, parseAutomation, validate, validCron } from '../src/automations/model.ts';
import type { Automation } from '../src/automations/model.ts';
import { Store } from '../src/store.ts';
const definition = (): Automation => ({ ...draft(),name:'Daily review',prompt:'Review changes.',
  enabled:true,triggers:[{id:'trigger',kind:'Schedule',event:'Cron',value:'0 9 * * 1-5'}] });
test('activation validation, URLs and cron bounds',()=>{
  assert.deepEqual(validate(definition()),[]);
  for (const expression of ['60 9 * * *','0 24 * * *','* * 0 * *','* * * 13 *','*/0 * * * *','* * * *']) assert.equal(validCron(expression),false,expression);
  for (const expression of ['0 9 * * 1-5','*/15 0-23 * * 0,6','0 0 1 1 *']) assert.equal(validCron(expression),true,expression);
  assert.ok(validate({...draft(),enabled:true}).length>=3);
  assert.ok(validate({...definition(),tools:[{id:'m',kind:'MCP',name:'test',url:'https://secret:pw@example.com/mcp'}]}).length);
  assert.ok(validate({...definition(),repositories:['bad-path']}).length);
});
test('payload validation rejects malformed nested values and duplicate IDs',()=>{
  for (const bad of [null,{}, {...definition(),triggers:[null]}, {...definition(),tools:[{kind:'MCP'}]}, {...definition(),revision:-1}])
    assert.throws(()=>parseAutomation(bad));
  const a=definition(); a.triggers.push({...a.triggers[0]!});
  assert.throws(()=>parseAutomation(a),/Duplicate/);
});
test('store isolates definitions, persists and serializes revision conflicts',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'automations-')); t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=new Store(join(dir,'data.json'));
  const a=await store.save(definition()), b=await store.save({...definition(),name:'Second'});
  a.model='new-model'; a.tools.push({id:'m',kind:'MCP',name:'one',url:'https://example.com/mcp'});
  const attempts=await Promise.allSettled([store.save(a),store.save(a)]);
  assert.equal(attempts.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(attempts.filter(r=>r.status==='rejected').length,1);
  const read=await new Store(store.file).read();
  assert.deepEqual(read.automations.find(v=>v.id===b.id),b);
  assert.equal(read.automations.find(v=>v.id===a.id)?.revision,2);
  await assert.rejects(store.remove(a.id,1),/Changed elsewhere/);
  await store.remove(a.id,2); assert.equal((await store.read()).automations.length,1);
});
test('no adapter means no invented execution or run records',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'automations-')); t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=new Store(join(dir,'data.json')), a=await store.save(definition());
  await assert.rejects(store.start(a.id),/not connected/);
  assert.deepEqual((await store.read()).runs,[]);
});
test('execution boundary receives exact per-automation configuration',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'automations-')); t.after(()=>rm(dir,{recursive:true,force:true}));
  let received: Automation | undefined;
  const store=new Store(join(dir,'data.json'),{start:async a=>{
    received=structuredClone(a); a.tools.length=0;
    return {id:'run',automationId:a.id,name:a.name,status:'succeeded',createdAt:new Date().toISOString(),output:'Test adapter result',model:a.model};
  }});
  const a=await store.save({...definition(),repositories:['owner/repo'],model:'chosen',
    tools:[{id:'one',kind:'MCP',name:'server',url:'https://example.com/mcp'}]});
  await store.start(a.id);
  assert.deepEqual(received,a);
  assert.equal((await store.read()).automations[0]?.tools.length,1);
  assert.equal((await store.read()).runs[0]?.model,'chosen');
});
test('corrupt state is never silently overwritten',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'automations-')); t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=new Store(join(dir,'data.json')); await writeFile(store.file,'broken');
  await assert.rejects(store.save(definition()));
  await assert.rejects(store.read());
});
