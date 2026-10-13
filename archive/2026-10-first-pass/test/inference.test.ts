import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SettingsStore } from '../src/settings/store.ts';
import { T3Bridge } from '../src/inference/t3.ts';
import { parseConfig } from '../src/inference/catalog.ts';
import type { TurnEvent } from '../src/inference/provider.ts';
import { FixtureWire,config } from './t3-fixture.ts';
async function fixture(wire=new FixtureWire()){
 const settings=new SettingsStore(join(await mkdtemp(join(tmpdir(),'t3-')),'settings'));
 await settings.update({section:'inference',revision:0,values:{url:'https://environment.example',projectId:'project-one',credential:'BOOTSTRAP'}});
 const requests:{path:string;body:unknown;token:string}[]=[],connections:URL[]=[];
 const bridge=new T3Bridge(settings,{connect:async url=>{connections.push(url);return wire;},post:async(url,_hosts,body,token='')=>{
  requests.push({path:url.pathname,body,token});return url.pathname==='/oauth/token'?{access_token:'PRIVATE-BEARER',token_type:'Bearer',expires_in:3600}:{ticket:`PRIVATE-WS-${requests.length}`};
 }});return {bridge,settings,wire,requests,connections};
}
test('T3 uses actual auth endpoints, instance models, start command and streamed messages',async()=>{
 const {bridge,requests,wire,connections}=await fixture();await bridge.pair();
 assert.deepEqual(requests.map(r=>r.path),['/oauth/token','/api/auth/websocket-ticket']);
 assert.equal(connections[0]!.protocol,'wss:');
 assert.equal(connections[0]!.searchParams.get('orchestrationProtocol'),'2');
 assert.equal(connections[0]!.searchParams.get('wsTicket'),'PRIVATE-WS-2');
 assert.equal(connections[0]!.searchParams.has('wsToken'),false);
 assert.equal(requests[1]!.token,'PRIVATE-BEARER');assert.doesNotMatch(JSON.stringify(bridge.state),/PRIVATE/);
 const form=requests[0]!.body;
 assert.ok(form instanceof URLSearchParams);
 assert.deepEqual(Object.fromEntries(form),{
  grant_type:'urn:ietf:params:oauth:grant-type:token-exchange',subject_token:'BOOTSTRAP',
  subject_token_type:'urn:t3:params:oauth:token-type:environment-bootstrap',
  requested_token_type:'urn:ietf:params:oauth:token-type:access_token',
 });
 const [model]=await bridge.models();assert.equal(model!.instanceId,'provider-one');
 const events:TurnEvent[]=[];
 await bridge.turn({runId:'run-id',modelId:model!.id,prompt:'Hello',title:'Test'},async e=>{events.push(e);},new AbortController().signal);
 const commands=wire.sent.filter(m=>m.tag==='orchestration.dispatchCommand');assert.equal(commands.length,1);
 assert.equal(commands[0]!.payload!.type,'thread.turn.start');
 assert.deepEqual(commands[0]!.payload!.modelSelection,{instanceId:'provider-one',model:'real-model'});
 const start=commands[0]!.payload!;
 assert.equal(start.commandId,'run-id');assert.equal(start.interactionMode,'default');
 assert.deepEqual(start.message && (start.message as {attachments:unknown[]}).attachments,[]);
 assert.deepEqual((start.bootstrap as {createThread:object}).createThread,{
  projectId:'project-one',title:'Test',modelSelection:start.modelSelection,runtimeMode:'approval-required',
  interactionMode:'default',branch:null,worktreePath:null,createdAt:start.createdAt,
 });
 assert.ok(wire.sent.filter(m=>m._tag==='Request').every(m=>Array.isArray(m.headers)));
 assert.equal(events[0]!.text,'Real transport shape');assert.equal(events.at(-1)!.status,'succeeded');
 assert.ok(wire.sent.some(m=>m._tag==='Ack'));await bridge.disconnect();
});
test('incompatible versions and unavailable catalogs fail visibly without invented defaults',async()=>{
 assert.throws(()=>parseConfig({...config,environment:{serverVersion:'9.9.9'}}),/Incompatible/);
 assert.throws(()=>parseConfig({...config,environment:{serverVersion:'0.0.22'}}),/Incompatible/);
 assert.deepEqual(parseConfig({...config,providers:[]}).models,[]);
 const wire=new FixtureWire();wire.version='9.9.9';const {bridge}=await fixture(wire);
 await assert.rejects(bridge.pair(),/Incompatible/);assert.equal(bridge.state.status,'incompatible');assert.deepEqual(await bridge.models(),[]);
});
test('cancel dispatches thread.turn.interrupt and does not send another start',async()=>{
 const wire=new FixtureWire();wire.hold=true;const {bridge}=await fixture(wire);await bridge.pair();
 const controller=new AbortController(),events:TurnEvent[]=[];
 const pending=bridge.turn({runId:'cancel',modelId:(await bridge.models())[0]!.id,prompt:'Wait',title:'Wait'},async e=>{events.push(e);},controller.signal);
 await new Promise(r=>setTimeout(r,15));controller.abort();await pending;
 assert.equal(wire.sent.filter(m=>m.payload?.type==='thread.turn.start').length,1);
 assert.equal(wire.sent.filter(m=>m.payload?.type==='thread.turn.interrupt').length,1);
 assert.equal(events.at(-1)!.status,'cancelled');await bridge.disconnect();
});
test('connection loss replays events without duplicate execution',async()=>{
 const wire=new FixtureWire();wire.hold=true;const {bridge}=await fixture(wire);await bridge.pair();
 const replacement=new FixtureWire();replacement.hold=true;
 bridge.transport.connect=async()=>replacement;
 const events:TurnEvent[]=[];
 const pending=bridge.turn({runId:'replay',modelId:(await bridge.models())[0]!.id,prompt:'Once',title:'Once'},async e=>{events.push(e);},new AbortController().signal);
 await new Promise(r=>setTimeout(r,15));
 replacement.replay=[{sequence:2,aggregateId:wire.thread,eventId:'e1',type:'thread.message-sent',payload:{role:'assistant',messageId:'m',text:'Replayed'}},{sequence:3,aggregateId:wire.thread,eventId:'e2',type:'thread.session-set',payload:{session:{status:'ready',activeTurnId:null}}}];
 wire.close();await pending;
 assert.equal([...wire.sent,...replacement.sent].filter(m=>m.payload?.type==='thread.turn.start').length,1);
 assert.equal(events.filter(e=>e.text==='Replayed').length,1);await bridge.disconnect();
});
test('selected model persists and run transcript reaches disk through adapter',async()=>{
 const {Store}=await import('../src/store.ts'),{RunEngine}=await import('../src/inference/runtime.ts'),{ProviderRegistry}=await import('../src/inference/provider.ts'),{draft}=await import('../src/automations/model.ts');
 const {bridge}=await fixture();await bridge.pair();const model=(await bridge.models())[0]!;
 const store=new Store(join(await mkdtemp(join(tmpdir(),'run-')),'state'));
 const registry=new ProviderRegistry();registry.add(bridge);store.adapter=new RunEngine(store,registry);
 const a=await store.save({...draft(),name:'Turn',model:model.id,prompt:'Hello',triggers:[{id:'t',kind:'Schedule',event:'Cron',value:'0 9 * * *'}]});
 assert.equal((await new Store(store.file).read()).automations[0]!.model,model.id);
 const run=await store.start(a.id);assert.equal(run.status,'running');
 for(let i=0;i<50&&(await store.read()).runs[0]!.status==='running';i++)await new Promise(r=>setTimeout(r,10));
 const final=(await store.read()).runs[0]!;assert.equal(final.status,'succeeded');assert.equal(final.output,'Real transport shape');await bridge.disconnect();
});
test('expired pairing fails visibly instead of inventing a model catalog',async()=>{
 const {bridge}=await fixture();bridge.transport.post=async()=>{throw Error('Pairing expired or revoked. Pair again.');};
 await assert.rejects(bridge.pair(),/expired/);assert.equal(bridge.state.status,'needs auth');assert.deepEqual(await bridge.models(),[]);
});
test('bearer pairing mints a fresh ticket per connection without exchanging the bearer',async()=>{
 const {bridge,settings,requests}=await fixture();
 await settings.update({section:'inference',revision:1,values:{credentialKind:'bearer',credential:'DIRECT-BEARER'}});
 const urls:URL[]=[];
 bridge.transport.connect=async url=>{urls.push(url);return new FixtureWire();};
 await bridge.pair();await bridge.pair();
 assert.deepEqual(requests.map(r=>r.path),['/api/auth/websocket-ticket','/api/auth/websocket-ticket']);
 assert.ok(requests.every(r=>r.token==='DIRECT-BEARER'));
 assert.notEqual(urls[0]!.searchParams.get('wsTicket'),urls[1]!.searchParams.get('wsTicket'));
 assert.doesNotMatch(JSON.stringify(bridge.state),/PRIVATE-WS|DIRECT-BEARER/);
 await bridge.disconnect();
});
test('malformed bootstrap and ticket responses fail before opening a socket',async()=>{
 for(const response of [
  {access_token:'private',token_type:'DPoP',expires_in:3600},
  {access_token:'private',token_type:'Bearer',expires_in:-1},
  {access_token:'private',token_type:'Bearer',expires_in:Infinity},
  {access_token:'',token_type:'Bearer',expires_in:3600},
 ]){
  const {bridge}=await fixture();let opened=false;
  bridge.transport.post=async()=>response;
  bridge.transport.connect=async()=>{opened=true;return new FixtureWire();};
  await assert.rejects(bridge.pair(),/Incompatible bootstrap/);assert.equal(opened,false);
 }
 const {bridge,settings}=await fixture();let opened=false;
 await settings.update({section:'inference',revision:1,values:{credentialKind:'bearer',credential:'DIRECT'}});
 bridge.transport.post=async()=>({token:'legacy-token'});
 bridge.transport.connect=async()=>{opened=true;return new FixtureWire();};
 await assert.rejects(bridge.pair(),/Incompatible WebSocket ticket/);assert.equal(opened,false);
});
