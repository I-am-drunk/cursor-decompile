import { EventEmitter } from 'node:events';
import type { Wire } from '../src/net/websocket.ts';
export const config={environment:{serverVersion:'0.0.45'},providers:[{instanceId:'provider-one',driver:'codex',enabled:true,installed:true,auth:{status:'authenticated'},models:[{slug:'real-model',name:'Environment Model',capabilities:null}]}]};
export class FixtureWire extends EventEmitter implements Wire {
 sent:{_tag:string;id?:string;tag?:string;payload?:Record<string,unknown>;requestId?:string;headers?:unknown[]}[]=[];
 hold=false;version='0.0.45';thread='';closed=false;replay:unknown[]=[];
 send(text:string){
  const m=JSON.parse(text);this.sent.push(m);if(m._tag!=='Request')return;
  if(!Array.isArray(m.headers))throw Error('T3 requires Request.headers to be an array.');
  const send=(data:unknown)=>queueMicrotask(()=>{if(!this.closed)this.emit('message',JSON.stringify(data));});
  const exit=(value:unknown)=>send({_tag:'Exit',requestId:m.id,exit:{_tag:'Success',value}});
  if(m.tag==='server.getConfig')exit({...config,environment:{serverVersion:this.version}});
  else if(m.tag==='orchestration.subscribeShell')send({_tag:'Chunk',requestId:m.id,values:[{kind:'snapshot',snapshot:{projects:[{id:'project-one',title:'Existing project'}]}}]});
  else if(m.tag==='orchestration.dispatchCommand'){this.thread=m.payload.threadId;exit({sequence:1});}
  else if(m.tag==='orchestration.replayEvents')exit(this.replay);
  else if(m.tag==='orchestration.subscribeThread'){
   send({_tag:'Chunk',requestId:m.id,values:[{kind:'snapshot',snapshot:{snapshotSequence:1,thread:{messages:[],latestTurn:{state:'running'}}}}]});
   if(!this.hold)send({_tag:'Chunk',requestId:m.id,values:[
    {kind:'event',event:{sequence:2,aggregateId:m.payload.threadId,eventId:'e1',type:'thread.message-sent',payload:{messageId:'m1',role:'assistant',text:'Real transport shape'}}},
    {kind:'event',event:{sequence:3,aggregateId:m.payload.threadId,eventId:'e2',type:'thread.session-set',payload:{session:{status:'ready',activeTurnId:null}}}}
   ]});
  }
 }
 close(){if(!this.closed){this.closed=true;this.emit('close');}}
}
