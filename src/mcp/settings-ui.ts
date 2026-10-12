import { esc } from '../automations/view.ts';
import type { McpServer,Connection } from './registry.ts';
import type { State,Tool } from '../automations/model.ts';
type Api=<T>(path:string,method?:string,data?:unknown)=>Promise<T>;
const input=(name:string,value:string)=>`<label class="setting-row"><span>${name}</span><input name="${name}" value="${esc(value)}"></label>`;
const select=(name:string,values:string[],value:string)=>`<label class="setting-row"><span>${name}</span><select name="${name}">${values.map(v=>`<option ${v===value?'selected':''}>${v}</option>`).join('')}</select></label>`;
export async function mountMcp(root:HTMLElement,api:Api,automationId:string){
 let selected:McpServer|undefined;
 const list=await api<(McpServer&{connection:Connection})[]>('/api/mcp-servers');
 const notice=document.createElement('p');notice.setAttribute('role','status');
 root.innerHTML=`<h2>Configured connectors</h2><p>Connect tools for your automations. Tool invocation from runs is not available yet.</p><div>${list.map(s=>`<section class="card live-settings"><h3>${esc(s.name)} · ${esc(s.connection.state)}</h3><p>${esc(s.connection.message)}</p><p>${s.connection.tools.map(esc).join(', ')}</p><button type="button" data-edit="${s.id}">Edit</button> <button type="button" data-probe="${s.id}">Test connection${s.transport==='stdio'?' (execute command)':''}</button> <button type="button" data-delete="${s.id}">Delete</button></section>`).join('') || '<p>No MCP connectors yet. Add a custom server below.</p>'}</div><div id="registry-form"></div><div id="bindings"></div>`;
 root.append(notice);
 const formRoot=root.querySelector<HTMLElement>('#registry-form')!;
 const draw=()=>{formRoot.innerHTML=`<form class="card live-settings" id="server-form"><h3>${selected?'Edit server':'Add custom server'}</h3>${input('name',selected?.name??'')}${select('transport',['http','stdio'],selected?.transport??'http')}${input('url',selected?.url??'')}${input('command',selected?.command??'')}${input('args',JSON.stringify(selected?.args??[]))}${select('scope',['user','workspace'],selected?.scope??'user')}${select('auth',['none','bearer','header','oauth2'],selected?.auth??'none')}${input('headerName',selected?.headerName??'Authorization')}<label class="setting-row"><span>Credential (blank preserves)</span><input name="credential" type="password" autocomplete="new-password"></label><label class="setting-row"><span>Explicit environment JSON (blank preserves)</span><input name="env" placeholder='{"PATH":"/usr/bin"}'></label><label><input type="checkbox" name="enabled" ${selected?.enabled===false?'':'checked'}> Enabled</label><p>Stored environment keys: ${selected?.envKeys.map(esc).join(', ')||'none'}. OAuth token can be supplied; OAuth authorization flow is not implemented.</p><button type="submit">Save server</button></form>`;};draw();
 root.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(b=>b.onclick=()=>{selected=list.find(s=>s.id===b.dataset.edit);draw();});
 root.querySelectorAll<HTMLButtonElement>('[data-probe]').forEach(b=>b.onclick=()=>{b.disabled=true;void api(`/api/mcp-servers/${b.dataset.probe}/probe`,'POST',{}).then(()=>mountMcp(root,api,automationId)).catch(e=>{notice.textContent=e.message;}).finally(()=>{b.disabled=false;});});
 root.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(b=>b.onclick=()=>{const item=list.find(s=>s.id===b.dataset.delete)!;void api(`/api/mcp-servers/${item.id}?revision=${item.revision}`,'DELETE').then(()=>mountMcp(root,api,automationId)).catch(e=>{notice.textContent=e.message;});});
 formRoot.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target as HTMLFormElement));
  try{const value:Record<string,unknown>={...data,enabled:data.enabled==='on',args:JSON.parse(String(data.args)),...(selected?{id:selected.id,revision:selected.revision}:{}),...(data.env?{env:JSON.parse(String(data.env))}:{})};if(!data.credential)delete value.credential;if(!data.env)delete value.env;
   void api('/api/mcp-servers','POST',value).then(()=>mountMcp(root,api,automationId)).catch(e=>{notice.textContent=e.message;});
  }catch{notice.textContent='Arguments and environment must be valid JSON.';}
 });
 if(automationId)await mountBindings(root.querySelector('#bindings')!,api,automationId,list,notice);
}
async function mountBindings(root:Element,api:Api,id:string,servers:McpServer[],notice:HTMLElement){
 const automation=(await api<State>('/api/state')).automations.find(a=>a.id===id);
 if(!automation){root.textContent='Automation not found.';return;}
 const bindings=await api<{tool:Tool;connection:Connection}[]>(`/api/automations/${id}/mcp`);
 root.innerHTML=`<section class="live-settings"><h2>MCP for ${esc(automation.name)}</h2>${bindings.map(b=>`<p>${esc(b.tool.name)}: ${esc(b.connection.state)} · ${esc(b.connection.message)} <button type="button" data-unbind="${esc(b.tool.id)}">Remove binding</button></p>`).join('')}<form id="binding-form"><label>Registry server <select name="serverId">${servers.map(s=>`<option value="${s.id}">${esc(s.name)} (${s.scope})</option>`).join('')}</select></label>${input('allowedTools','')}${select('approval',['ask','auto'],'ask')}<p>Grant comma-separated tool names, or * for all. Blank grants none.</p><button>Save binding</button></form></section>`;
 const save=async(tools:Tool[])=>{await api('/api/automations','POST',{...automation,tools});notice.textContent='Binding saved.';await mountBindings(root,api,id,servers,notice);};
 root.querySelectorAll<HTMLButtonElement>('[data-unbind]').forEach(b=>b.onclick=()=>{void save(automation.tools.filter(t=>t.id!==b.dataset.unbind)).catch(e=>{notice.textContent=e.message;});});
 root.querySelector('form')!.addEventListener('submit',e=>{
  e.preventDefault();const data=new FormData(e.target as HTMLFormElement),server=servers.find(s=>s.id===data.get('serverId'));if(!server)return;
  const old=automation.tools.find(t=>t.serverId===server.id),allowed=String(data.get('allowedTools')??'').trim();
  const tool:Tool={id:old?.id??crypto.randomUUID(),kind:'MCP',name:server.name,url:'',serverId:server.id,scope:server.scope,allowedTools:allowed==='*'?'all':allowed.split(',').map(s=>s.trim()).filter(Boolean),approval:data.get('approval')==='auto'?'auto':'ask'};
  void save([...automation.tools.filter(t=>t.id!==tool.id),tool]).catch(e=>{notice.textContent=e.message;});
 });
}
