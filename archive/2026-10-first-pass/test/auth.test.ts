import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AuthStore, cookieToken,sessionCookie } from '../src/auth/store.ts';
import { createApp } from '../src/server.ts';
import { Store } from '../src/store.ts';
test('local account hashes password and sessions, survives restart, expires and logs out',async()=>{
 const file=join(await mkdtemp(join(tmpdir(),'auth-')),'account'),auth=new AuthStore(file);
 const first=await auth.register('Test@Example.invalid','password-fixture-123');
 assert.equal(first.identity.email,'test@example.invalid');assert.ok(first.identity.id);
 assert.doesNotMatch(await readFile(file,'utf8'),/password-fixture-123/);
 assert.ok(!(await readFile(file,'utf8')).includes(first.token));assert.equal((await stat(file)).mode&0o777,0o600);
 assert.deepEqual(await new AuthStore(file).identify(first.token),first.identity);
 assert.equal(cookieToken(sessionCookie(first.token)),first.token);
 await assert.rejects(auth.register('other@example.invalid','password-fixture-123'),/already exists/);
 await assert.rejects(auth.login('test@example.invalid','wrong-password-fixture'),/Invalid/);
 await auth.logout(first.token);assert.equal(await auth.identify(first.token),null);
 const signed=await auth.login('test@example.invalid','password-fixture-123');
 await auth.disk.change(s=>{s.sessions.forEach(t=>{t.expires=0;});});assert.equal(await auth.identify(signed.token),null);
});
test('signed-out gate, registration cookie, CSRF and logout protect product APIs',async()=>{
 const file=join(await mkdtemp(join(tmpdir(),'auth-http-')),'data'),server=createApp(new Store(file));
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address!=='string');
 const base=`http://127.0.0.1:${address.port}`,headers={'Content-Type':'application/json','X-Local-Request':'1'};
 try{
  assert.equal((await fetch(base+'/api/state')).status,401);
  const gate=await fetch(base+'/automations',{redirect:'manual'});assert.equal(gate.status,303);assert.equal(gate.headers.get('location'),'/login');
  assert.match(await (await fetch(base+'/login')).text(),/autocomplete="current-password"/);
  const credentials=JSON.stringify({email:'local@example.invalid',password:'local-test-password'});
  assert.equal((await fetch(base+'/api/auth/register',{method:'POST',headers:{...headers,origin:'https://attacker.invalid'},body:credentials})).status,403);
  const response=await fetch(base+'/api/auth/register',{method:'POST',headers,body:credentials});assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie')!;assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
  const signed={...headers,Cookie:cookie.split(';')[0]!};
  assert.equal((await fetch(base+'/api/settings',{headers:signed})).status,200);
  assert.equal((await fetch(base+'/api/auth/logout',{method:'POST',headers:signed,body:'{}'})).status,200);
  assert.equal((await fetch(base+'/api/settings',{headers:signed})).status,401);
  for(let i=0;i<10;i++)await fetch(base+'/api/auth/login',{method:'POST',headers,body:'{}'});
  assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers,body:credentials})).status,429);
 }finally{await new Promise<void>(r=>server.close(()=>r()));}
});
