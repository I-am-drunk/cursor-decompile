import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema,CallToolRequestSchema,ListResourcesRequestSchema,ReadResourceRequestSchema,ListResourceTemplatesRequestSchema,ListPromptsRequestSchema,GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Management } from './service.ts';
import { tools } from './tools.ts';
interface Shape {type?:string;properties?:Record<string,Shape>;required?:string[];enum?:string[];minimum?:number;items?:Shape;additionalProperties?:boolean}
function validate(schema:Shape,value:unknown){
 if(schema.type==='object'){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Expected object.');const v=value as Record<string,unknown>;
  for(const key of schema.required??[])if(v[key]===undefined)throw Error(`Missing ${key}.`);
  for(const [key,item] of Object.entries(v)){const property=schema.properties?.[key];if(property)validate(property,item);else if(schema.additionalProperties===false)throw Error(`Unknown argument ${key}.`);}
 }else if(schema.type==='array'){if(!Array.isArray(value))throw Error('Expected array.');if(schema.items)for(const v of value)validate(schema.items,v);}
 else if(schema.type==='integer'){if(!Number.isSafeInteger(value)||Number(value)<(schema.minimum??-Infinity))throw Error('Invalid revision.');}
 else if(schema.type&&typeof value!==schema.type)throw Error(`Expected ${schema.type}.`);
 if(schema.enum&&!schema.enum.includes(String(value)))throw Error('Invalid option.');
}
export function createMcpServer(service:Management){
 const server=new Server({name:'workspace-automations',version:'1.0.0'},{capabilities:{tools:{},resources:{},prompts:{}}});
 server.setRequestHandler(ListToolsRequestSchema,async()=>({tools}));
 server.setRequestHandler(CallToolRequestSchema,async request=>{
  try{const tool=tools.find(t=>t.name===request.params.name);if(!tool)throw Error('Unknown tool.');
   const args=request.params.arguments??{};validate(tool.inputSchema as Shape,args);
   const value=await service.call(tool.name,args);return {content:[{type:'text',text:JSON.stringify(value)}]};
  }catch(e){return {isError:true,content:[{type:'text',text:(e as Error).message}]};}
 });
 server.setRequestHandler(ListResourceTemplatesRequestSchema,async()=>({resourceTemplates:['automations','runs','models'].map(kind=>({name:kind,uriTemplate:`workspace://${kind}/{id}`,mimeType:'application/json'}))}));
 server.setRequestHandler(ListResourcesRequestSchema,async()=>{
  const state=await service.store.read(),models=await service.providers.models();
  return {resources:[...state.automations.map(a=>({uri:`workspace://automations/${a.id}`,name:a.name})),...state.runs.map(r=>({uri:`workspace://runs/${r.id}`,name:r.name})),...models.map(m=>({uri:`workspace://models/${m.id}`,name:m.name}))].map(r=>({...r,mimeType:'application/json'}))};
 });
 server.setRequestHandler(ReadResourceRequestSchema,async request=>{
  const uri=new URL(request.params.uri),id=decodeURIComponent(uri.pathname.slice(1));let value:unknown;
  if(uri.protocol!=='workspace:')throw Error('Unknown resource scheme.');
  if(uri.hostname==='automations')value=await service.automation(id);
  else if(uri.hostname==='runs')value=await service.call('runs_get',{id});
  else if(uri.hostname==='models')value=(await service.providers.models()).find(m=>m.id===id);
  if(!value)throw Error('Resource not found.');return {contents:[{uri:request.params.uri,mimeType:'application/json',text:JSON.stringify(value)}]};
 });
 server.setRequestHandler(ListPromptsRequestSchema,async()=>({prompts:[{name:'create-automation',description:'Guide a safe, explicit automation setup.',arguments:[{name:'task',description:'What the automation should do',required:true}]}]}));
 server.setRequestHandler(GetPromptRequestSchema,async request=>{
  if(request.params.name!=='create-automation'||!request.params.arguments?.task)throw Error('Supply create-automation and task.');
  return {messages:[{role:'user',content:{type:'text',text:`Help create an automation for: ${request.params.arguments.task}\nRead models_list and settings_get first. Ask which discovered model and trigger to use; never invent either. Create disabled, review prompt and scoped MCP tool grants, then ask before enabling or triggering a real run. Schedules are configuration only until a scheduler is connected.`}}]};
 });
 return server;
}
