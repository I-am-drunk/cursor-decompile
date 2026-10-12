import { randomUUID } from 'node:crypto';
import { JsonFile } from '../persistence.ts';
import { RequestError } from '../store.ts';
export type ConnectionState='connected'|'disconnected'|'needs auth'|'missing'|'error';
export interface McpServer {
 id:string;revision:number;name:string;transport:'stdio'|'http';url:string;command:string;args:string[];
 auth:'none'|'bearer'|'header'|'oauth2';headerName:string;scope:'user'|'workspace';enabled:boolean;
 credentialPresent:boolean;envKeys:string[];
}
export interface PrivateServer {entry:McpServer;credential:string;env:Record<string,string>}
export interface Connection {state:ConnectionState;message:string;tools:string[]}
export interface McpClient {probe(server:PrivateServer):Promise<Connection>}
export class McpRegistry {
 disk:JsonFile<{servers:PrivateServer[]}>;connections=new Map<string,Connection>();client?:McpClient;
 constructor(file:string,client?:McpClient){this.disk=new JsonFile(file,()=>({servers:[]}));this.client=client;}
 async list(){return (await this.disk.read()).servers.map(s=>({...s.entry,connection:this.status(s.entry)})).sort((a,b)=>a.name.localeCompare(b.name));}
 status(entry:McpServer):Connection{return !entry.enabled?{state:'disconnected',message:'Disabled',tools:[]}:this.connections.get(entry.id)??{state:entry.auth!=='none'&&!entry.credentialPresent?'needs auth':'disconnected',message:'Not connected',tools:[]};}
 async resolve(ref:{serverId?:string;name:string;scope?:string}){
  const all=await this.list(),name=ref.name.toLowerCase();
  const entry=ref.serverId?all.find(s=>s.id===ref.serverId):all.find(s=>s.name.toLowerCase()===name&&s.scope===ref.scope)??all.find(s=>s.name.toLowerCase()===name);
  return entry?{entry,connection:entry.connection}:{entry:null,connection:{state:'missing' as const,message:'Server not in this registry. Set up or pick another.',tools:[]}};
 }
 async remove(id:string,revision:number){await this.disk.change(s=>{const old=s.servers.find(p=>p.entry.id===id);if(!old)throw new RequestError(404,'Server not found');if(old.entry.revision!==revision)throw new RequestError(409,'Server changed. Reload.');s.servers=s.servers.filter(p=>p!==old);});this.connections.delete(id);}
 async save(raw:unknown):Promise<McpServer>{
  if(!raw||typeof raw!=='object')throw new RequestError(400,'Expected server configuration.');
  const value=raw as Record<string,unknown>;
  return this.disk.change(s=>{
   const old=s.servers.find(p=>p.entry.id===value.id);
   if(value.id&&!old)throw new RequestError(404,'Server not found');
   if(old&&value.revision!==old.entry.revision)throw new RequestError(409,'Server changed. Reload.');
   const entry=parseEntry(value,old?.entry),credential=value.credential===undefined?old?.credential??'':value.credential;
   if(typeof credential!=='string'||credential.length>16384)throw new RequestError(400,'Invalid credential.');
   const env=value.env===undefined?old?.env??{}:parseEnv(value.env);
   entry.credentialPresent=!!credential;entry.envKeys=Object.keys(env);entry.revision=(old?.entry.revision??0)+1;
   if(s.servers.some(p=>p!==old&&p.entry.scope===entry.scope&&p.entry.name.toLowerCase()===entry.name.toLowerCase()))throw new RequestError(409,'Server name already exists in this scope.');
   s.servers=[...s.servers.filter(p=>p!==old),{entry,credential,env}];this.connections.delete(entry.id);return entry;
  });
 }
 async probe(id:string){
  const server=(await this.disk.read()).servers.find(s=>s.entry.id===id);
  if(!server)return {state:'missing',message:'Server not found',tools:[]} satisfies Connection;
  let result=this.status(server.entry);
  if(server.entry.enabled&&!(server.entry.auth!=='none'&&!server.credential)){
   try{result=this.client?await this.client.probe(server):{state:'disconnected',message:'Start the SDK-enabled MCP entrypoint to connect.',tools:[]};}
   catch{result={state:'error',message:'MCP connection failed.',tools:[]};}
  }
  const current=(await this.disk.read()).servers.find(s=>s.entry.id===id);
  if(!current||current.entry.revision!==server.entry.revision)return {state:'disconnected',message:'Configuration changed during probe; retry.',tools:[]} satisfies Connection;
  this.connections.set(id,result);return result;
 }
}
function parseEnv(raw:unknown):Record<string,string>{
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.entries(raw).length>32||Object.entries(raw).some(([k,v])=>!/^\w+$/.test(k)||typeof v!=='string'||v.length>8192))throw new RequestError(400,'Invalid explicit environment.');
 return raw as Record<string,string>;
}
function parseEntry(v:Record<string,unknown>,old?:McpServer):McpServer{
 const e={id:old?.id??randomUUID(),revision:0,name:'',transport:'http',url:'',command:'',args:[],auth:'none',headerName:'Authorization',scope:'user',enabled:true,credentialPresent:false,envKeys:[],...old} as McpServer;
 for(const key of ['name','transport','url','command','args','auth','headerName','scope','enabled'] as const)if(v[key]!==undefined)(e as unknown as Record<string,unknown>)[key]=v[key];
 if(typeof e.name!=='string'||!e.name.trim()||e.name.length>120||!['stdio','http'].includes(e.transport)||!['none','bearer','header','oauth2'].includes(e.auth)||!['user','workspace'].includes(e.scope)||typeof e.enabled!=='boolean')throw new RequestError(400,'Invalid registry entry.');
 if(typeof e.headerName!=='string'||!/^[A-Za-z0-9-]{1,80}$/.test(e.headerName))throw new RequestError(400,'Invalid header name.');
 if(typeof e.url!=='string'||e.url.length>2048||typeof e.command!=='string'||e.command.length>1024||!Array.isArray(e.args)||e.args.length>32||e.args.some(a=>typeof a!=='string'||a.length>4096))throw new RequestError(400,'Invalid transport configuration.');
 if(e.transport==='http'){
  let url:URL;try{url=new URL(e.url);}catch{throw new RequestError(400,'Invalid server URL.');}
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.hash||e.auth!=='none'&&url.protocol!=='https:')throw new RequestError(400,'Use HTTPS for credentials; no embedded URL credentials.');
 }else if(!e.command.trim())throw new RequestError(400,'Executable required.');
 return e;
}
