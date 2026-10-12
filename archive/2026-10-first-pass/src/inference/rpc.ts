import type { Wire } from '../net/websocket.ts';
interface Pending {resolve:(v:unknown)=>void;reject:(e:Error)=>void;chunk?:(v:unknown)=>void;timer?:ReturnType<typeof setTimeout>}
// Effect 4.0.0-beta.59 RpcSerialization.layerJson; NOT JSON-RPC 2.0.
export class T3Rpc {
 wire:Wire;next=0;pending=new Map<string,Pending>();closed=false;
 constructor(wire:Wire){this.wire=wire;wire.on('message',text=>this.receive(text));wire.on('close',()=>this.fail(Error('Environment disconnected.')));}
 request(tag:string,payload:unknown,chunk?:(v:unknown)=>void){
  const id=String(++this.next);
  const promise=new Promise<unknown>((resolve,reject)=>{
   const timer=chunk?undefined:setTimeout(()=>{this.pending.delete(id);this.wire.send(JSON.stringify({_tag:'Interrupt',requestId:id}));reject(Error(`Environment RPC timed out: ${tag}`));},15000);
   this.pending.set(id,{resolve,reject,...(chunk?{chunk}:{}),...(timer?{timer}:{})});
   try{if(this.closed)throw Error('Environment disconnected.');this.wire.send(JSON.stringify({_tag:'Request',id,tag,payload,headers:[]}));}catch(e){this.pending.delete(id);clearTimeout(timer);reject(e);}
  });
  return {promise,cancel:()=>{const p=this.pending.get(id);if(!p)return;clearTimeout(p.timer);this.pending.delete(id);if(!this.closed)this.wire.send(JSON.stringify({_tag:'Interrupt',requestId:id}));p.resolve(undefined);}};
 }
 call(tag:string,payload:unknown={}){return this.request(tag,payload).promise;}
 receive(text:string){
  try{const data=JSON.parse(text);for(const m of Array.isArray(data)?data:[data]){
   if(m._tag==='Pong')continue;if(m._tag==='Defect'||m._tag==='ClientProtocolError')throw Error('Incompatible environment RPC response.');
   const p=this.pending.get(m.requestId);if(!p)continue;
   if(m._tag==='Chunk'&&Array.isArray(m.values)){for(const value of m.values)p.chunk?.(value);this.wire.send(JSON.stringify({_tag:'Ack',requestId:m.requestId}));}
   else if(m._tag==='Exit'){clearTimeout(p.timer);this.pending.delete(m.requestId);if(m.exit?._tag==='Success')p.resolve(m.exit.value);else p.reject(Error('Environment rejected the command. Check its permissions and provider status.'));}
   else throw Error('Incompatible environment RPC envelope.');
  }}catch(e){this.fail(e instanceof Error?e:Error('Invalid RPC response'));this.wire.close();}
 }
 fail(error:Error){this.closed=true;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();}
 close(){this.fail(Error('Environment disconnected.'));this.wire.close();}
}
