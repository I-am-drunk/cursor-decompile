import { mountInference } from '../inference/settings-ui.ts';
import { liveSettings } from './live-view.ts';
import { sections } from './schema.ts';
import type { Settings, Section } from './schema.ts';
const root=document.querySelector<HTMLElement>('#settings-app')!, notice=document.querySelector<HTMLElement>('#settings-notice')!;
let state:Settings, busy=false;
const current=():Section=>{const name=location.pathname.split('/')[2];return sections.includes(name as Section)?name as Section:'account';};
export async function settingsApi<T>(path:string,method='GET',data?:unknown):Promise<T>{
  const response=await fetch(path,{method,headers:{'Content-Type':'application/json','X-Local-Request':'1'},...(data===undefined?{}:{body:JSON.stringify(data)})});
  const result=await response.json();if(!response.ok)throw Error(result.error??result.message??'Request failed.');return result as T;
}
function render(){root.innerHTML=liveSettings(state,current());void showIdentity();if(current()==='inference')void mountInference(document.querySelector('#inference-status')!,settingsApi,state.inference.projectId).catch(e=>{notice.textContent=e.message;});}
async function showIdentity(){
 const status=await settingsApi<{identity:{email:string;id:string}|null}>('/api/auth/status');
 const target=document.querySelector('#identity');if(!target)return;
 if(!status.identity){location.assign('/login');return;}
 const text=document.createElement('p');text.textContent=`Signed in as ${status.identity.email}`;
 const button=document.createElement('button');button.type='button';button.textContent='Sign out';
 button.addEventListener('click',()=>{void settingsApi('/api/auth/logout','POST',{}).then(()=>location.assign('/login')).catch(e=>{notice.textContent=e.message;});});target.replaceChildren(text,button);
}
root.addEventListener('click',e=>{
  const a=(e.target as Element).closest<HTMLAnchorElement>('nav a');if(!a||e instanceof MouseEvent&&(e.metaKey||e.ctrlKey))return;
  e.preventDefault();if(busy)return;history.pushState(null,'',a.href);notice.textContent='';render();
});
root.addEventListener('submit',e=>{
  if((e.target as HTMLElement).id!=='preferences')return;e.preventDefault();if(busy)return;
  const section=current(),data=new FormData(e.target as HTMLFormElement),values:Record<string,unknown>={};
  for(const [key,value] of data){if(key==='credential'&&!value)continue;values[key]=value;}
  for(const el of (e.target as HTMLFormElement).querySelectorAll<HTMLInputElement>('input[type=checkbox]'))values[el.name]=el.checked;
  if(section==='mcp')values.allowedHosts=String(values.allowedHosts).split(',').map(v=>v.trim()).filter(Boolean);
  if(section==='automations'){values.retentionDays=Number(values.retentionDays);values.concurrency=Number(values.concurrency);}
  if(section==='inference'){if(values.url===state.inference.url)delete values.url;if(values.credentialKind===state.inference.credentialKind)delete values.credentialKind;}
  busy=true;notice.textContent='Saving…';
  void settingsApi<Settings>('/api/settings','PATCH',{section,values,revision:state.revision}).then(result=>{state=result;render();notice.textContent='Saved to disk.';}).catch(e=>{notice.textContent=e.message;}).finally(()=>{busy=false;});
});
window.addEventListener('popstate',()=>{if(state)render();});
void settingsApi<Settings>('/api/settings').then(result=>{state=result;render();}).catch(e=>{notice.textContent=e.message;});
