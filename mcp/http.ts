import { createServer } from 'node:http';
import { randomUUID,timingSafeEqual } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './server.ts';
import type { Management } from './service.ts';
export function createMcpHttp(service:Management,token:string){
 if(token.length<32)throw Error('MCP_TOKEN must contain at least 32 characters.');
 const sessions=new Map<string,{transport:StreamableHTTPServerTransport;lastUsed:number}>();
 const server=createServer(async(req,res)=>{
  const deny=(status:number,message:string)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify({error:message}));};
  const supplied=req.headers.authorization?.replace(/^Bearer /,'')??'';
  if(Buffer.byteLength(supplied)!==Buffer.byteLength(token)||!timingSafeEqual(Buffer.from(supplied),Buffer.from(token)))return deny(401,'MCP bearer authorization required.');
  const host=req.headers.host??'';
  if(!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)||req.headers.origin&&req.headers.origin!==`http://${host}`)return deny(403,'Origin denied.');
  if(req.url!=='/mcp')return deny(404,'Not found.');
  for(const [id,s] of sessions)if(s.lastUsed<Date.now()-600000){sessions.delete(id);void s.transport.close();}
  try{
   let body:unknown;
   if(req.method==='POST'){
    const chunks:Buffer[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1048576)return deny(413,'Request too large.');chunks.push(chunk);}
    try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{return deny(400,'Invalid JSON.');}
   }
   const id=req.headers['mcp-session-id'];if(id&&typeof id!=='string')return deny(400,'Invalid session.');
   let state=id?sessions.get(id):undefined;
   if(id&&!state)return deny(404,'Unknown MCP session.');
   if(!state){
    if(req.method!=='POST'||(body as {method?:string})?.method!=='initialize')return deny(400,'Initialize a session first.');
    if(sessions.size>=32)return deny(429,'Too many MCP sessions.');
    const transport=new StreamableHTTPServerTransport({sessionIdGenerator:()=>randomUUID(),onsessioninitialized:id=>{sessions.set(id,{transport,lastUsed:Date.now()});}});
    const mcp=createMcpServer(service);await mcp.connect(transport);transport.onclose=()=>{if(transport.sessionId)sessions.delete(transport.sessionId);};state={transport,lastUsed:Date.now()};
   }
   state.lastUsed=Date.now();await state.transport.handleRequest(req,res,body);
  }catch{if(!res.headersSent)deny(500,'MCP request failed.');else res.end();}
 });
 server.on('close',()=>{for(const s of sessions.values())void s.transport.close();sessions.clear();});return server;
}
