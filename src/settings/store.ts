import { JsonFile } from '../persistence.ts';
import { RequestError } from '../store.ts';
import { defaultSettings, sections } from './schema.ts';
import type { Settings, Section } from './schema.ts';
interface PrivateSettings { value:Settings; secrets:Record<string,string> }
export class SettingsStore {
  disk:JsonFile<PrivateSettings>;
  constructor(file:string){this.disk=new JsonFile(file,()=>({value:defaultSettings(),secrets:{}}));}
  async read():Promise<Settings>{return (await this.disk.read()).value;}
  async secret(name:string):Promise<string>{return (await this.disk.read()).secrets[name]??'';}
  async setSecret(name:string,value:string){await this.disk.change(s=>{if(value)s.secrets[name]=value;else delete s.secrets[name];});}
  async update(input:unknown):Promise<Settings>{
    if(!input||typeof input!=='object')throw new RequestError(400,'Expected settings update.');
    const p=input as Record<string,unknown>;
    if(typeof p.section!=='string'||!sections.includes(p.section as Section)||!p.values||typeof p.values!=='object'||Array.isArray(p.values))throw new RequestError(400,'Unknown settings section.');
    return this.disk.change(s=>{
      if(p.revision!==s.value.revision)throw new RequestError(409,'Settings changed. Reload before saving.');
      const section=p.section as Section, values=p.values as Record<string,unknown>, next=structuredClone(s.value);
      const target=next[section] as unknown as Record<string,unknown>;
      for(const [key,value] of Object.entries(values)){
        if(key==='credential'&&['inference','integrations'].includes(section)){
          if(typeof value!=='string'||value.length>16384)throw new RequestError(400,'Invalid credential.');
          if(value)s.secrets[section]=value;else delete s.secrets[section];
          target.credentialPresent=!!value;continue;
        }
        if(!Object.hasOwn(target,key)||key==='credentialPresent')throw new RequestError(400,'Unknown or read-only setting.');
        if(Array.isArray(target[key])){
          if(!Array.isArray(value)||value.length>32||value.some(v=>typeof v!=='string'||!/^([a-z0-9.-]+|\[[a-f0-9:]+\])$/i.test(v)))throw new RequestError(400,'Invalid allowed hosts.');
        }else if(typeof value!==typeof target[key])throw new RequestError(400,'Invalid setting type.');
        if(typeof value==='string'&&value.length>2048)throw new RequestError(400,'Setting is too long.');
        target[key]=value;
      }
      validate(next);next.revision++;s.value=next;return next;
    });
  }
}
function validate(s:Settings){
  if(!['system','light','dark'].includes(s.account.theme)||!s.account.displayName.trim())throw new RequestError(400,'Invalid account preferences.');
  try{new Intl.DateTimeFormat('en',{timeZone:s.automations.timezone});}catch{throw new RequestError(400,'Unknown timezone.');}
  for(const [value,min,max] of [[s.automations.retentionDays,1,3650],[s.automations.concurrency,1,32]])
    if(!Number.isInteger(value)||value!<min!||value!>max!)throw new RequestError(400,'Automation defaults out of range.');
  if(s.inference.url){
    let url:URL;try{url=new URL(s.inference.url);}catch{throw new RequestError(400,'Invalid environment URL.');}
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.hash||url.search)throw new RequestError(400,'Use an HTTP(S) environment URL without credentials or query.');
  }
}
