import { draft } from './model.ts';
import type { Automation } from './model.ts';
export function savedEditorFixture():Automation {
  return {...draft(),id:'editor-fixture',revision:1,
    name:'C-AUTOMATIONS TEST 2026-10-12 A - disabled',
    prompt:'Return only the word OK. Do not change files or make external network calls.',
    repositories:['I-am-drunk/cursor-decompile'],branch:'main',ownerName:'You',
    modelParameters:{fast:'false'},createdAt:'2026-10-12T07:36:06.000Z',
    triggers:[{id:'annual',kind:'Schedule',event:'Cron',value:'0 0 1 1 *'}]};
}
export interface McpConfig {
  name: string; type: 'url' | 'command'; url: string; command: string;
  args: string[]; headers: Record<string,string>; env: Record<string,string>;
}
export interface EditorModel {
  id: string; name: string; defaults: Record<string,string>;
  parameters: { id: string; name: string; boolean: boolean; options: {value:string;label:string}[] }[];
}
export interface McpProvider { id:string; name:string; description:string }
export const blankMcp = (): McpConfig => ({name:'',type:'url',url:'',command:'',args:[],headers:{},env:{}});
export function serializeMcp(c: McpConfig): string {
  const config=c.type==='url'?{url:c.url,...(Object.keys(c.headers).length?{headers:c.headers}:{})}:
    {command:c.command,...(c.args.length?{args:c.args}:{}),...(Object.keys(c.env).length?{env:c.env}:{})};
  return JSON.stringify({mcpServers:{[c.name.trim()||'my-server']:config}},null,2);
}
const record=(v:unknown): v is Record<string,unknown> => !!v && typeof v==='object' && !Array.isArray(v);
const strings=(v:unknown): v is Record<string,string> => record(v) && Object.values(v).every(x=>typeof x==='string');
export function parseMcp(text: string): McpConfig {
  const root:unknown=JSON.parse(text);
  if(!record(root)||!record(root.mcpServers)||Object.keys(root.mcpServers).length!==1) throw Error('Provide exactly one MCP server.');
  const [name,value]=Object.entries(root.mcpServers)[0]!;
  if(!record(value)) throw Error('Invalid MCP configuration.');
  if(Object.keys(value).some(k=>!['url','command','args','headers','env'].includes(k)) ||
    ('url' in value && 'command' in value)) throw Error('Unsupported or ambiguous MCP configuration fields.');
  const c={...blankMcp(),name};
  if(typeof value.command==='string') {c.type='command';c.command=value.command;}
  else if(typeof value.url==='string') c.url=value.url;
  else throw Error('Provide a server URL or command.');
  if(value.args!==undefined && (!Array.isArray(value.args)||!value.args.every(x=>typeof x==='string'))) throw Error('Arguments must be strings.');
  if(value.headers!==undefined&&!strings(value.headers)) throw Error('Headers must have string values.');
  if(value.env!==undefined&&!strings(value.env)) throw Error('Environment must have string values.');
  c.args=(value.args as string[]|undefined)??[];c.headers=(value.headers as Record<string,string>|undefined)??{};
  c.env=(value.env as Record<string,string>|undefined)??{};return c;
}
export function validateMcp(c:McpConfig): void {
  if(!c.name.trim()||c.name.length>200) throw Error('Enter an MCP server name.');
  if(c.type==='command') {if(!c.command.trim()) throw Error('Enter a command.');}
  else {const u=new URL(c.url);if(!['https:','http:'].includes(u.protocol)||u.username||u.password) throw Error('Enter an HTTP(S) URL without embedded credentials.');}
}
export function modelSuffix(m:EditorModel,values:Record<string,string>):string {
  return m.parameters.filter(p=>p.name!=='Context').map(p=>p.options.find(v=>v.value===values[p.id])?.label??'')
    .filter(v=>v&&v!=='false').join(' ');
}
