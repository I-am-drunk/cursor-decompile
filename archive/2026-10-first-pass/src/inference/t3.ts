import { randomUUID } from 'node:crypto';
import { SettingsStore } from '../settings/store.ts';
import { postJson } from '../net/policy.ts';
import { connectWire } from '../net/websocket.ts';
import type { Wire } from '../net/websocket.ts';
import { T3Rpc } from './rpc.ts';
import { parseConfig, T3_REVISION } from './catalog.ts';
import type { InferenceProvider, ProviderModel, TurnInput, TurnEvent } from './provider.ts';
import { followTurn } from './turn.ts';
export interface T3Transport {post:typeof postJson;connect:(url:URL,hosts:string[])=>Promise<Wire>}
export class T3Bridge implements InferenceProvider {
 id='t3';settings:SettingsStore;transport:T3Transport;rpc?:T3Rpc;
 state:{status:string;message:string;version?:string;revision:string}={status:'disconnected',message:'Pair an environment.',revision:T3_REVISION};
 catalog:ProviderModel[]=[];projects:{id:string;title:string}[]=[];connecting?:Promise<void>;
 constructor(settings:SettingsStore,transport:T3Transport={post:postJson,connect:connectWire}){this.settings=settings;this.transport=transport;}
 async models(){return this.state.status==='connected'?this.catalog:[];}
 async estimate(){return null;}
 async pair(){if(this.connecting)return this.connecting;this.connecting=this.connect().finally(()=>{this.connecting=undefined;});return this.connecting;}
 async connect(){
  this.rpc?.close();this.catalog=[];this.projects=[];this.state={...this.state,status:'connecting',message:'Connecting…'};
  try{
   const s=await this.settings.read();if(!s.inference.url)throw Error('Configure the environment URL first.');
   const base=new URL(s.inference.url),hosts=s.mcp.allowedHosts;
   let stored:{origin:string;token:string;expiresAt:string}|null=null;
   const text=await this.settings.secret('t3Session');if(text)stored=JSON.parse(text);
   if(!stored||stored.origin!==base.origin||!Number.isFinite(Date.parse(stored.expiresAt))||Date.parse(stored.expiresAt)<=Date.now()){
    const credential=await this.settings.secret('inference');if(!credential)throw Error('Pairing credential required.');
    const result=s.inference.credentialKind==='bearer'?{access_token:credential,token_type:'Bearer',expires_in:3600}:
     await this.transport.post(new URL('/oauth/token',base),hosts,new URLSearchParams({
      grant_type:'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token:credential,subject_token_type:'urn:t3:params:oauth:token-type:environment-bootstrap',
      requested_token_type:'urn:ietf:params:oauth:token-type:access_token',
     }));
    if(typeof result.access_token!=='string'||!result.access_token||result.token_type!=='Bearer'||
     typeof result.expires_in!=='number'||!Number.isFinite(result.expires_in)||result.expires_in<=0)throw Error('Incompatible bootstrap response.');
    const expiry=Date.now()+result.expires_in*1000;
    if(!Number.isFinite(expiry)||expiry>8640000000000000)throw Error('Incompatible bootstrap expiry.');
    stored={origin:base.origin,token:result.access_token,expiresAt:new Date(expiry).toISOString()};
    await this.settings.setSecret('t3Session',JSON.stringify(stored));
   }
   const access=await this.transport.post(new URL('/api/auth/websocket-ticket',base),hosts,{},stored.token);
   if(typeof access.ticket!=='string'||!access.ticket)throw Error('Incompatible WebSocket ticket response.');
   const url=new URL('/ws',base);url.protocol=url.protocol==='https:'?'wss:':'ws:';
   url.searchParams.set('orchestrationProtocol','2');url.searchParams.set('wsTicket',access.ticket);
   const rpc=new T3Rpc(await this.transport.connect(url,hosts));this.rpc=rpc;
   rpc.wire.on('close',()=>{if(this.rpc===rpc&&this.state.status==='connected')this.state={...this.state,status:'disconnected',message:'Environment disconnected. Reconnect to refresh models.'};});
   const config=parseConfig(await rpc.call('server.getConfig'));this.catalog=config.models;
   await new Promise<void>((resolve,reject)=>{
    const timer=setTimeout(()=>{sub.cancel();reject(Error('Environment snapshot timed out.'));},15000);
    const sub=rpc.request('orchestration.subscribeShell',{},raw=>{
     const item=raw as {kind:string;snapshot?:{projects?:{id:string;title:string}[]}};
     if(item.kind!=='snapshot')return;
     clearTimeout(timer);sub.cancel();
     if(!Array.isArray(item.snapshot?.projects)){reject(Error('Incompatible project catalog.'));return;}
     this.projects=item.snapshot.projects.map(p=>({id:p.id,title:p.title}));resolve();
    });sub.promise.catch(e=>{clearTimeout(timer);reject(e);});
   });
   this.state={...this.state,status:'connected',message:`Connected: ${this.catalog.length} discovered models.`,version:config.version};
  }catch(e){if((e as Error).message.includes('expired'))await this.settings.setSecret('t3Session','');this.rpc?.close();this.catalog=[];const message=(e as Error).message;
   this.state={...this.state,status:message.includes('Incompatible')?'incompatible':message.includes('expired')||message.includes('credential')?'needs auth':'error',message};throw e;
  }
 }
 async disconnect(){this.rpc?.close();this.rpc=undefined;this.catalog=[];this.projects=[];await this.settings.setSecret('t3Session','');this.state={...this.state,status:'disconnected',message:'Disconnected.'};}
 async turn(input:TurnInput,emit:(e:TurnEvent)=>Promise<void>,signal:AbortSignal){
  if(!this.rpc||this.rpc.closed)await this.pair();
  const model=this.catalog.find(m=>m.id===input.modelId);if(!model)throw Error('Selected model is no longer available.');
  const projectId=(await this.settings.read()).inference.projectId;
  if(!this.projects.some(p=>p.id===projectId))throw Error('Select an existing environment project in Settings.');
  const createdAt=new Date().toISOString(),threadId=randomUUID();
  const selection={instanceId:model.instanceId,model:model.slug};
  // One idempotent start command; reconnects replay events, never resubmit a turn.
  const command={type:'thread.turn.start',commandId:input.runId,threadId,createdAt,runtimeMode:'approval-required',interactionMode:'default',
   message:{messageId:randomUUID(),role:'user',text:input.prompt,attachments:[]},modelSelection:selection,
   bootstrap:{createThread:{projectId,title:input.title,modelSelection:selection,runtimeMode:'approval-required',interactionMode:'default',branch:null,worktreePath:null,createdAt}}};
  await followTurn(this,threadId,command,emit,signal);
 }
}
