import { randomUUID } from 'node:crypto';
import type { T3Bridge } from './t3.ts';
import type { TurnEvent } from './provider.ts';
type Message={id?:string;messageId?:string;role:string;text:string};
type Event={sequence:number;aggregateId:string;eventId:string;type:string;payload:{role?:string;text?:string;messageId?:string;session?:{status:string;activeTurnId:string|null;lastError?:string};activity?:{id:string;summary:string}}};
type Item={kind:string;event?:Event;snapshot?:{snapshotSequence:number;thread:{messages:Message[];latestTurn?:{state:string}|null}}};
export async function followTurn(bridge:T3Bridge,threadId:string,command:object,emit:(e:TurnEvent)=>Promise<void>,signal:AbortSignal){
 if(signal.aborted)throw Error('Run cancelled before dispatch.');
 let sequence=0,active=false,finished=false,chain=Promise.resolve(),stop=()=>{};
 let complete!:()=>void,fail!:(e:Error)=>void;
 const done=new Promise<void>((resolve,reject)=>{complete=resolve;fail=reject;});
 const finish=async(status:'succeeded'|'failed'|'cancelled',text:string)=>{
  if(finished)return;finished=true;await emit({sequence,kind:'status',id:'terminal',text,status});complete();
 };
 const message=async(m:Message)=>{if(m.role!=='assistant'||typeof m.text!=='string')return;active=true;await emit({sequence,kind:'message',id:m.id??m.messageId??'assistant',text:m.text});};
 const event=async(e:Event)=>{
  if(e.aggregateId!==threadId||e.sequence<=sequence||finished)return;sequence=e.sequence;
  if(e.type==='thread.message-sent')await message(e.payload as Message);
  if(e.payload.activity)await emit({sequence,kind:'activity',id:e.payload.activity.id,text:e.payload.activity.summary});
  const s=e.payload.session;if(!s)return;
  if(s.status==='running')active=true;
  if(s.status==='error')await finish('failed',s.lastError??'Provider failed.');
  if(s.status==='interrupted')await finish('cancelled','Cancelled by provider.');
  if(active&&s.status==='ready'&&!s.activeTurnId)await finish('succeeded','Turn completed.');
 };
 const consume=(raw:unknown)=>{chain=chain.then(async()=>{
  if(finished)return;const item=raw as Item;if(item.kind==='event'&&item.event)await event(item.event);
  if(item.kind==='snapshot'&&item.snapshot){const snap=item.snapshot;sequence=Math.max(sequence,snap.snapshotSequence);
   for(const m of snap.thread.messages)await message(m);
   const s=snap.thread.latestTurn?.state;if(s==='completed')await finish('succeeded','Turn completed.');if(s==='error')await finish('failed','Provider failed.');if(s==='interrupted')await finish('cancelled','Cancelled by provider.');
  }
 }).catch(e=>{fail(e);});};
 const abort=()=>{void bridge.rpc!.call('orchestration.dispatchCommand',{type:'thread.turn.interrupt',commandId:randomUUID(),threadId,createdAt:new Date().toISOString()}).then(()=>finish('cancelled','Cancellation accepted by environment.')).catch(fail);};
 signal.addEventListener('abort',abort,{once:true});
 const timeout=setTimeout(()=>{fail(Error('Run observation timed out; remote execution may still be active.'));},15*60*1000);
 void done.catch(()=>{});
 try{
  try{await bridge.rpc!.call('orchestration.dispatchCommand',command);}catch(e){if(!bridge.rpc!.closed)throw e;}
  for(let attempt=0;attempt<3&&!finished;attempt++){
   if(bridge.rpc!.closed){await bridge.pair();const replay=await bridge.rpc!.call('orchestration.replayEvents',{fromSequenceExclusive:sequence});if(!Array.isArray(replay))throw Error('Incompatible replay response.');for(const e of replay)await event(e as Event);}
   if(finished)break;
   const subscription=bridge.rpc!.request('orchestration.subscribeThread',{threadId},consume);stop=subscription.cancel;
   try{await Promise.race([done,subscription.promise.then(()=>{if(!finished)throw Error('Thread stream ended early.');})]);break;}
   catch(e){stop();if(finished||!bridge.rpc!.closed||attempt===2)throw e;}
  }
  await done;await chain;
 }finally{clearTimeout(timeout);signal.removeEventListener('abort',abort);stop();}
}
