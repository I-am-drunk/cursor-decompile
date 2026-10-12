import type { T3Bridge } from '../src/inference/t3.ts';
import { randomUUID } from 'node:crypto';
import { Store,RequestError } from '../src/store.ts';
import { draft } from '../src/automations/model.ts';
import type { Trigger } from '../src/automations/model.ts';
import { SettingsStore } from '../src/settings/store.ts';
import { McpRegistry } from '../src/mcp/registry.ts';
import { ProviderRegistry } from '../src/inference/provider.ts';
export class Management {
 bridge?:T3Bridge;ownerId:()=>Promise<string>=async()=>'local-owner';
 store:Store;settings:SettingsStore;registry:McpRegistry;providers:ProviderRegistry;
 constructor(store:Store,settings:SettingsStore,registry:McpRegistry,providers:ProviderRegistry){this.store=store;this.settings=settings;this.registry=registry;this.providers=providers;}
 async automation(id:string){const a=(await this.store.read()).automations.find(a=>a.id===id);if(!a)throw new RequestError(404,'Automation not found.');return a;}
 async call(name:string,args:Record<string,unknown>){
  const id=String(args.id??'');
  switch(name){
   case 'automations_list':return (await this.store.read()).automations;
   case 'automations_get':return this.automation(id);
   case 'automations_create':return this.store.save({...draft(),...args.definition as object,id:'',revision:0,createdAt:'',userId:await this.ownerId()});
   case 'automations_update':{const old=await this.automation(id);return this.store.save({...old,...args.patch as object,id:old.id,revision:args.revision});}
   case 'automations_delete':await this.store.remove(id,Number(args.revision));return {deleted:true};
   case 'automations_duplicate':{const old=await this.automation(id);return this.store.save({...old,id:'',revision:0,createdAt:'',name:String(args.name??`Copy of ${old.name}`),enabled:false});}
   case 'automations_enable':case 'automations_disable':{const old=await this.automation(id);return this.store.save({...old,enabled:name.endsWith('_enable'),revision:args.revision});}
   case 'triggers_add':case 'triggers_update':case 'triggers_remove':return this.trigger(name,args);
   case 'runs_list':return (await this.store.read()).runs.filter(r=>!args.automationId||r.automationId===args.automationId);
   case 'runs_get':{const run=(await this.store.read()).runs.find(r=>r.id===id);if(!run)throw new RequestError(404,'Run not found.');return run;}
   case 'runs_trigger':return this.store.start(id);
   case 'runs_cancel':await this.store.cancel(id);return {cancellationRequested:true};
   case 'models_list':return this.providers.models();
   case 'settings_get':return this.settings.read();
   case 'settings_update':{
    if((await this.store.read()).runs.some(r=>r.status==='running')&&['inference','mcp'].includes(String(args.section)))throw new RequestError(409,'Finish or cancel active runs first.');
    const value=await this.settings.update(args);
    if(args.section==='inference')await this.bridge?.disconnect();return value;
   }
   case 'inference_pair':if(!this.bridge)throw Error('Inference unavailable');await this.bridge.pair();return this.bridge.state;
   case 'inference_status':return this.bridge?.state??{status:'unavailable'};
   case 'mcp_servers_list':return this.registry.list();
   case 'mcp_servers_save':return this.registry.save(args.server);
   case 'mcp_servers_delete':await this.registry.remove(id,Number(args.revision));return {deleted:true};
   case 'mcp_servers_probe':return this.registry.probe(id);
   default:throw new RequestError(404,'Unknown tool.');
  }
 }
 async trigger(name:string,args:Record<string,unknown>){
  const old=await this.automation(String(args.id??'')),triggerId=String(args.triggerId??'');
  let triggers=old.triggers;
  if(name==='triggers_add')triggers=[...triggers,{...args.trigger as Trigger,id:randomUUID()}];
  else{
   if(!triggers.some(t=>t.id===triggerId))throw new RequestError(404,'Trigger not found.');
   triggers=name==='triggers_remove'?triggers.filter(t=>t.id!==triggerId):triggers.map(t=>t.id===triggerId?{...t,...args.trigger as Trigger,id:t.id}:t);
  }
  return this.store.save({...old,triggers,revision:Number(args.revision)});
 }
}
