import { EventEmitter } from 'node:events';
import { randomBytes, createHash } from 'node:crypto';
import { request as http } from 'node:http';
import { request as https } from 'node:https';
import type { Duplex } from 'node:stream';
import { destination } from './policy.ts';
export interface Wire {send(text:string):void;close():void;on(event:'message',cb:(text:string)=>void):unknown;on(event:'close',cb:()=>void):unknown}
export class WebSocketWire extends EventEmitter implements Wire {
 socket:Duplex;buffer:Buffer=Buffer.alloc(0);fragments:Buffer[]=[];size=0;fragmented=false;
 constructor(socket:Duplex,head:Buffer){super();this.socket=socket;socket.on('data',(b:Buffer)=>this.accept(b));socket.on('error',()=>this.close());socket.on('close',()=>this.emit('close'));if(head.length)queueMicrotask(()=>this.accept(head));}
 send(text:string){this.frame(1,Buffer.from(text));}
 frame(opcode:number,data:Buffer){
  if(data.length>1048576)throw Error('WebSocket message too large');
  const extra=data.length<126?0:data.length<=65535?2:8,header=Buffer.alloc(2+extra+4),mask=randomBytes(4);
  header[0]=0x80|opcode;header[1]=0x80|(extra===0?data.length:extra===2?126:127);
  if(extra===2)header.writeUInt16BE(data.length,2);if(extra===8)header.writeBigUInt64BE(BigInt(data.length),2);mask.copy(header,2+extra);
  const payload=Buffer.from(data);for(let i=0;i<payload.length;i++)payload[i]=payload[i]!^mask[i%4]!;
  this.socket.write(Buffer.concat([header,payload]));
 }
 close(){this.socket.destroy();}
 accept(chunk:Buffer){
  this.buffer=Buffer.concat([this.buffer,chunk]);if(this.buffer.length>2097152){this.close();return;}
  try{while(this.buffer.length>=2){
   const a=this.buffer[0]!,b=this.buffer[1]!,opcode=a&15,fin=!!(a&128);let length=b&127,offset=2;
   if(a&112||b&128)throw Error('Unsupported WebSocket frame');
   if(length===126){if(this.buffer.length<4)return;length=this.buffer.readUInt16BE(2);offset=4;}
   if(length===127){if(this.buffer.length<10)return;const n=this.buffer.readBigUInt64BE(2);if(n>1048576n)throw Error('Frame too large');length=Number(n);offset=10;}
   if(length>1048576||opcode>=8&&(!fin||length>125))throw Error('Invalid frame');if(this.buffer.length<offset+length)return;
   const data=this.buffer.subarray(offset,offset+length);this.buffer=this.buffer.subarray(offset+length);
   if(opcode===8){this.close();return;}if(opcode===9){this.frame(10,data);continue;}if(opcode===10)continue;
   if(opcode!==1&&opcode!==0||opcode===0&&!this.fragmented||opcode===1&&this.fragmented)throw Error('Invalid text frame');
   this.fragments.push(data);this.size+=data.length;if(this.size>1048576)throw Error('Message too large');this.fragmented=!fin;
   if(fin){const text=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(this.fragments));this.fragments=[];this.size=0;this.emit('message',text);}
  }}catch{this.close();}
 }
}
export async function connectWire(url:URL,hosts:string[]):Promise<Wire>{
 const target=new URL(url);target.protocol=target.protocol==='wss:'?'https:':'http:';
 const options=await destination(target,hosts,true),key=randomBytes(16).toString('base64');
 return new Promise((resolve,reject)=>{
  const req=(target.protocol==='https:'?https:http)({...options,headers:{Connection:'Upgrade',Upgrade:'websocket','Sec-WebSocket-Version':'13','Sec-WebSocket-Key':key}});
  const timer=setTimeout(()=>req.destroy(Error('WebSocket connection timed out')),15000);
  req.on('upgrade',(response,socket,head)=>{
   clearTimeout(timer);const expected=createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
   if(response.headers['sec-websocket-accept']!==expected||response.headers.upgrade?.toLowerCase()!=='websocket'){socket.destroy();reject(Error('Invalid WebSocket handshake'));return;}
   resolve(new WebSocketWire(socket,head));
  });req.on('response',response=>{response.resume();clearTimeout(timer);reject(Error(`WebSocket rejected (${response.statusCode}); pair again.`));});
  req.on('error',()=>{clearTimeout(timer);reject(Error('WebSocket connection failed'));});req.end();
 });
}
