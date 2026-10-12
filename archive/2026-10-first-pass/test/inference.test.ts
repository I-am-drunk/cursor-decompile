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
 const requests:{path:string;body:unknown;token:string}[]=[];
 const bridge=new T3Bridge(settings,{connect:async()=>wire,post:async(url,_hosts,body,token='')=>{
  requests.push({path:url.pathname,body,token});return url.pathname.endsWith('bearer')?{sessionToken:'PRIVATE-BEARER',expiresAt:'2099-01-01T00:00:00Z'}:{token:'PRIVATE-WS'};
 }});return {bridge,settings,wire,requests};
}
test('T3 uses actual auth endpoints, instance models, start command and streamed messages',async()=>{
 const {bridge,requests,wire}=await fixture();await bridge.pair();
 assert.deepEqual(requests.map(r=>r.path),['/api/auth/bootstrap/bearer','/api/auth/ws-token']);
 assert.equal(requests[1]!.token,'PRIVATE-BEARER');assert.doesNotMatch(JSON.stringify(bridge.state),/PRIVATE/);
 const [model]=await bridge.models();assert.equal(model!.instanceId,'provider-one');
 const events:TurnEvent[]=[];
 await bridge.turn({runId:'run-id',modelId:model!.id,prompt:'Hello',title:'Test'},async e=>{events.push(e);},new AbortController().signal);
 const commands=wire.sent.filter(m=>m.tag==='orchestration.dispatchCommand');assert.equal(commands.length,1);
 assert.equal(commands[0]!.payload!.type,'thread.turn.start');
 assert.deepEqual(commands[0]!.payload!.modelSelection,{instanceId:'provider-one',model:'real-model'});
 assert.equal(events[0]!.text,'Real transport shape');assert.equal(events.at(-1)!.status,'succeeded');
 assert.ok(wire.sent.some(m=>m._tag==='Ack'));await bridge.disconnect();
});
test('incompatible versions and unavailable catalogs fail visibly without invented defaults',async()=>{
 assert.throws(()=>parseConfig({...config,environment:{serverVersion:'9.9.9'}}),/Incompatible/);
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
