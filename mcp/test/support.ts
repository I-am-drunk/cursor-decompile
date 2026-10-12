import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Store } from '../../src/store.ts';
import { SettingsStore } from '../../src/settings/store.ts';
import { McpRegistry } from '../../src/mcp/registry.ts';
import { ProviderRegistry } from '../../src/inference/provider.ts';
import { RunEngine } from '../../src/inference/runtime.ts';
import { Management } from '../service.ts';
export async function service(){
 const path=join(await mkdtemp(join(tmpdir(),'mcp-test-')),'data'),store=new Store(path),settings=new SettingsStore(path+'.settings'),registry=new McpRegistry(path+'.mcp'),providers=new ProviderRegistry();
 providers.add({id:'fixture',models:async()=>[{id:'fixture-model',providerId:'fixture',instanceId:'one',slug:'fixture-model',name:'Test only',capabilities:null}],estimate:async()=>null,turn:async(input,emit,signal)=>{
  await emit({kind:'message',id:'answer',sequence:1,text:'Explicit test fixture'});
  if(input.prompt==='hold')await new Promise<void>(resolve=>{if(signal.aborted)resolve();else signal.addEventListener('abort',()=>resolve(),{once:true});});
  await emit({kind:'status',id:'end',sequence:2,text:'Done',status:signal.aborted?'cancelled':'succeeded'});
 }});store.adapter=new RunEngine(store,providers);return new Management(store,settings,registry,providers);
}
