import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Duplex, PassThrough } from 'node:stream';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import { destination, postJson } from '../src/net/policy.ts';
import { WebSocketWire } from '../src/net/websocket.ts';
test('HTTP transport encodes OAuth forms while preserving JSON ticket requests',async t=>{
 const sent:{headers:Record<string,string>;body:string}[]=[];
 const mocked=t.mock.method(https,'request',(options:{headers:Record<string,string>},callback:Function)=>{
  const request=new EventEmitter() as EventEmitter & {setTimeout:Function;end:Function};
  request.setTimeout=()=>{};
  request.end=(body:string)=>{
   sent.push({headers:options.headers,body});
   const response=Object.assign(new PassThrough(),{statusCode:200});
   callback(response);response.end('{"ticket":"test"}');
  };
  return request;
 });
 syncBuiltinESMExports();
 try{
  await postJson(new URL('https://127.0.0.1/oauth/token'),['127.0.0.1'],new URLSearchParams({subject_token:'a+b &=é'}));
  await postJson(new URL('https://127.0.0.1/api/auth/websocket-ticket'),['127.0.0.1'],{},'private-bearer');
  assert.equal(sent[0]!.headers['Content-Type'],'application/x-www-form-urlencoded');
  assert.equal(new URLSearchParams(sent[0]!.body).get('subject_token'),'a+b &=é');
  assert.equal(sent[0]!.headers['Content-Length'],Buffer.byteLength(sent[0]!.body));
  assert.equal(sent[1]!.headers['Content-Type'],'application/json');
  assert.equal(sent[1]!.headers.Authorization,'Bearer private-bearer');
  assert.equal(sent[1]!.body,'{}');
 }finally{mocked.mock.restore();syncBuiltinESMExports();}
});
test('outbound policy denies unlisted hosts and cleartext credentials, pins DNS lookup',async()=>{
 await assert.rejects(destination(new URL('https://127.0.0.1/x'),[]),/denied/);
 await assert.rejects(destination(new URL('http://127.0.0.1/x'),['127.0.0.1'],true),/HTTPS/);
 await assert.rejects(destination(new URL('https://user:pass@localhost/x'),['localhost']),/denied/);
 const allowed=await destination(new URL('https://127.0.0.1/x'),['127.0.0.1'],true);
 assert.equal(allowed.hostname,'127.0.0.1');assert.equal(typeof allowed.lookup,'function');
});
test('WebSocket masks client frames and validates/assembles server text',()=>{
 const output:Buffer[]=[];const socket=new Duplex({read(){},write(chunk,_encoding,done){output.push(Buffer.from(chunk));done();}});
 const wire=new WebSocketWire(socket,Buffer.alloc(0)),messages:string[]=[];wire.on('message',s=>messages.push(s));
 wire.send('Hi');const frame=output[0]!;assert.equal(frame[0],129);assert.equal(frame[1]!&128,128);
 assert.equal(frame[6]!^frame[2]!,72);assert.equal(frame[7]!^frame[3]!,105);
 wire.accept(Buffer.from([1,2,72,101]));wire.accept(Buffer.from([128,3,108,108,111]));assert.deepEqual(messages,['Hello']);
 wire.accept(Buffer.from([137,1,1]));assert.equal(output.at(-1)![0],138);
 wire.accept(Buffer.from([129,128]));assert.equal(socket.destroyed,true);
});
