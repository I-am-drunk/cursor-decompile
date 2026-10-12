import { randomUUID } from 'node:crypto';
import type { Automation, Run } from '../automations/model.ts';
import type { ExecutionAdapter, Store } from '../store.ts';
import { ProviderRegistry } from './provider.ts';
import type { TurnEvent } from './provider.ts';
export class RunEngine implements ExecutionAdapter {
 store:Store;providers:ProviderRegistry;active=new Map<string,AbortController>();
 constructor(store:Store,providers:ProviderRegistry){this.store=store;this.providers=providers;}
 async start(a:Automation):Promise<Run>{if(a.tools.some(t=>t.kind==='MCP'))throw Error('MCP invocation in runs is not wired. No run was started.');return {id:randomUUID(),automationId:a.id,name:a.name,status:'running',createdAt:new Date().toISOString(),output:'',model:a.model};}
 afterStart(run:Run,a:Automation){
  const controller=new AbortController();this.active.set(run.id,controller);
  const messages=new Map<string,string>();
  const emit=async(event:TurnEvent)=>{await this.store.change(state=>{
   const current=state.runs.find(r=>r.id===run.id);if(!current)return;
   if(event.kind!=='status'){messages.set(event.id,event.text);current.output=[...messages.values()].join('\n\n').slice(-1048576);}
   if(event.status){current.status=event.status;current.completedAt=new Date().toISOString();}
  });};
  void this.providers.forModel(a.model).then(provider=>provider.turn({runId:run.id,modelId:a.model,prompt:a.prompt,title:a.name},emit,controller.signal)).catch(async e=>{
   await this.store.change(state=>{const current=state.runs.find(r=>r.id===run.id);if(!current)return;current.status='failed';current.completedAt=new Date().toISOString();current.failure={code:'provider_unavailable',title:'Provider unavailable',message:(e as Error).message};});
  }).finally(()=>{this.active.delete(run.id);});
 }
 async cancel(run:Run){const controller=this.active.get(run.id);if(!controller)throw Error('Run is not active in this process.');controller.abort();}
}
