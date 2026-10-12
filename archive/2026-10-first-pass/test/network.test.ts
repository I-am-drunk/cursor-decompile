import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Duplex } from 'node:stream';
import { destination } from '../src/net/policy.ts';
import { WebSocketWire } from '../src/net/websocket.ts';
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
