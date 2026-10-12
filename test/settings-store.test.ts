import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SettingsStore } from '../src/settings/store.ts';
import { liveSettings } from '../src/settings/live-view.ts';
import { sections } from '../src/settings/schema.ts';
test('all settings sections persist, redact credentials and reject stale writes',async()=>{
 const file=join(await mkdtemp(join(tmpdir(),'settings-')),'prefs.json'),s=new SettingsStore(file);
 let value=await s.read();
 for(const [section,values] of Object.entries({account:{displayName:'<script>',theme:'dark'},inference:{url:'https://example.com',credential:'TOP-SECRET'},integrations:{linearEnabled:true,credential:'LINEAR-SECRET'},mcp:{allowStdio:true,allowedHosts:['localhost']},automations:{timezone:'America/Toronto',retentionDays:45,concurrency:2}}))value=await s.update({section,values,revision:value.revision});
 assert.deepEqual(await new SettingsStore(file).read(),value);assert.equal(value.revision,5);
 assert.doesNotMatch(JSON.stringify(value),/TOP-SECRET|LINEAR-SECRET/);
 assert.equal(await s.secret('inference'),'TOP-SECRET');assert.equal((await stat(file)).mode&0o777,0o600);
 for(const section of sections)assert.doesNotMatch(liveSettings(value,section),/<script>/);
 await assert.rejects(s.update({section:'account',values:{displayName:'stale'},revision:0}),/Reload/);
 const before=await readFile(file,'utf8');
 await assert.rejects(s.update({section:'inference',values:{credential:'REPLACE',unknown:1},revision:5}));
 assert.equal(await readFile(file,'utf8'),before);
 for(const [section,values] of [['automations',{concurrency:0}],['inference',{url:'http://user:pass@example.com'}],['automations',{timezone:'not/a-zone'}]])await assert.rejects(s.update({section,values,revision:5}));
});
test('settings HTTP route saves and reloads without exposing credentials',async()=>{
 const {createApp}=await import('../src/server.ts'),{Store}=await import('../src/store.ts');
 const path=join(await mkdtemp(join(tmpdir(),'settings-http-')),'data');
 const server=createApp(new Store(path));await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
 const address=server.address();assert.ok(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}`;
 try{
  assert.equal((await fetch(base+'/settings/inference')).status,200);
  assert.equal((await fetch(base+'/settings/live-app.ts')).status,200);
  const result=await fetch(base+'/api/settings',{method:'PATCH',headers:{'Content-Type':'application/json','X-Local-Request':'1'},body:JSON.stringify({section:'inference',values:{credential:'PRIVATE'},revision:0})});
  assert.equal(result.status,200);assert.doesNotMatch(await result.text(),/PRIVATE/);
  const state=await (await fetch(base+'/api/settings')).json();assert.equal(state.inference.credentialPresent,true);
  assert.equal((await fetch(base+'/api/settings',{method:'PATCH',body:'{}'})).status,403);
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
