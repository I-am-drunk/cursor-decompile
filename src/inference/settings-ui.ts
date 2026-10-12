import { esc } from '../automations/view.ts';
export async function mountInference(container:HTMLElement,api:<T>(path:string,method?:string,data?:unknown)=>Promise<T>,projectId:string){
 const status=await api<{status:string;message:string;projects:{id:string;title:string}[]}>('/api/inference');
 const models=await api<{id:string;name:string;instanceId:string}[]>('/api/models');
 container.innerHTML=`<p role="status">${esc(status.status)}: ${esc(status.message)}</p><p>Pairing sends the saved credential to the configured environment. HTTPS and an explicit destination allowlist are required.</p><button type="button" data-connect>Pair / reconnect</button> <button type="button" data-disconnect>Disconnect</button><label class="setting-row"><span>Environment project</span><select name="projectId" form="preferences"><option value="">Select a discovered project</option>${status.projects.map(p=>`<option value="${esc(p.id)}" ${p.id===projectId?'selected':''}>${esc(p.title)}</option>`).join('')}</select></label><p>${models.length} available models</p><ul>${models.map(m=>`<li>${esc(m.name)} · ${esc(m.instanceId)}</li>`).join('')}</ul>`;
 for(const [selector,path] of [['[data-connect]','pair'],['[data-disconnect]','disconnect']])container.querySelector(selector!)?.addEventListener('click',()=>{
  container.querySelectorAll('button').forEach(b=>{b.disabled=true;});
  void api('/api/inference/'+path,'POST',{}).catch(()=>{}).then(()=>mountInference(container,api,projectId));
 });
}
