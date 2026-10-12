import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport,DEFAULT_INHERITED_ENV_VARS } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,isAbsolute } from 'node:path';
import type { McpClient,PrivateServer,Connection } from '../src/mcp/registry.ts';
import { SettingsStore } from '../src/settings/store.ts';
import { pinnedFetch } from './pinned-fetch.ts';
export class SdkMcpClient implements McpClient {
 settings:SettingsStore;
 constructor(settings:SettingsStore){this.settings=settings;}
 async probe(server:PrivateServer):Promise<Connection>{
  const {entry,credential,env}=server,settings=await this.settings.read();
  if(entry.auth!=='none'&&!credential)return {state:'needs auth',message:'Credential required.',tools:[]};
  if(entry.transport==='stdio'&&(!settings.mcp.allowStdio||!isAbsolute(entry.command)))return {state:'error',message:'Local execution must be enabled and the executable path absolute.',tools:[]};
  const cwd=await mkdtemp(join(tmpdir(),'workspace-mcp-')),client=new Client({name:'workspace-registry',version:'1.0.0'});
  const headers:Record<string,string>=entry.auth==='none'?{}:{[entry.auth==='header'?entry.headerName:'Authorization']:entry.auth==='header'?credential:`Bearer ${credential}`};
  const transport=entry.transport==='stdio'?new StdioClientTransport({command:entry.command,args:entry.args,cwd,stderr:'pipe',env:{...Object.fromEntries(DEFAULT_INHERITED_ENV_VARS.map(k=>[k,''])),...env},maxBufferSize:1048576}):new StreamableHTTPClientTransport(new URL(entry.url),{requestInit:{headers},fetch:pinnedFetch(settings.mcp.allowedHosts,entry.auth!=='none'),reconnectionOptions:{maxRetries:0,maxReconnectionDelay:0,initialReconnectionDelay:0,reconnectionDelayGrowFactor:1}});
  if(transport instanceof StdioClientTransport)transport.stderr?.on('data',()=>{});
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   const tools=await Promise.race([(async()=>{
    await client.connect(transport);const names:string[]=[];let cursor:string|undefined;
    do{const page=await client.listTools(cursor?{cursor}:{});names.push(...page.tools.map(t=>t.name));cursor=page.nextCursor;if(names.length>1000)throw Error('Too many tools');}while(cursor);
    return names;
   })(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Timeout')),10000);})]);
   return {state:'connected',message:'Handshake and tool discovery succeeded (probe connection closed).',tools};
  }catch(e){const error=e as {code?:number;name?:string};return {state:error.code===401||error.code===403||error.name==='UnauthorizedError'?'needs auth':'error',message:'Handshake failed or timed out. Check configuration and authorization.',tools:[]};}
  finally{clearTimeout(timer);await client.close().catch(()=>{});await transport.close().catch(()=>{});await rm(cwd,{recursive:true,force:true});}
 }
}
