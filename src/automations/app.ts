import { ScheduleController } from './schedule-controller.ts';
import { installSidebar } from '../shell/sidebar.ts';
import { draft, emptyState, events, triggerKinds, validate } from './model.ts';
import type { Automation, Run, State, Tool, Trigger, TriggerKind } from './model.ts';
import { btn, dialog, editor, esc, field, gate, chatGate, notFound, icon, link, list, runs, runSummary, shell } from './view.ts';
import { referenceAutomation, referenceRun, referenceTime } from './row-data.ts';
import { EditorController } from './editor-controller.ts';
import { TriggerController } from './trigger-controller.ts';
import { RunFilterController } from './run-filter-controller.ts';
import { unsavedDialog } from './preset-view.ts';
import { editorToolbar, savedEditor } from './editor-view.ts';
import { modelSuffix, savedEditorFixture } from './editor-state.ts';
import type { EditorModel, McpProvider } from './editor-state.ts';
let state: State = emptyState(), form: Automation = draft(), models: {id:string;name:string}[] = [];
let dirty = false, scope = 'mine', page = 1, query = '', runQuery = '', searchOpen = false;
let titleEditing=false, missingRoute=false;
let errors: string[] = [], pendingPath = '', editId = '', modal = '', busy = false, returnFocus: HTMLElement | null = null;
const app = document.querySelector<HTMLDivElement>('#app')!, overlays = document.querySelector<HTMLDivElement>('#overlays')!;
const params = () => new URLSearchParams(location.search);
const routeId = () => location.pathname.split('/')[2] ?? '';
const referenceFixture = () => params().get('fixture') === 'observed-failure';
const editorFixture = () => params().get('fixture') === 'saved-editor';
function toast(message: string) { document.querySelector('#toast')!.textContent = message; }
async function api<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json', 'X-Local-Request':'1' },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status})`);
  return result as T;
}
function openModal(kind: string, id = '') {
  scheduleUi.close();
  runFilter.close();
  triggerUi.close();
  if(editUi.panel)editUi.close();
  if (!modal) returnFocus = document.activeElement as HTMLElement;
  modal = kind; editId = id; renderModal();
}
function closeModal() { modal = ''; overlays.innerHTML = ''; returnFocus?.focus(); }
const scheduleUi=new ScheduleController({form:()=>form,render,changed:()=>{dirty=true;app.querySelector('[data-act=save]')?.removeAttribute('disabled');},
  closeOther:()=>{runFilter.close();triggerUi.close();editUi.close();closeModal();},overlays});
const editUi=new EditorController({form:()=>form,render,changed:()=>{dirty=true;},
  closeOther:()=>{scheduleUi.close();runFilter.close();triggerUi.close();closeModal();},notify:toast,overlays,api});
const triggerUi=new TriggerController({form:()=>form,render,changed:()=>{dirty=true;},
  closeOther:()=>{scheduleUi.close();runFilter.close();editUi.close();closeModal();},notify:toast,overlays,fixture:editorFixture});
const runFilter=new RunFilterController({value:()=>params().get('status')??'',render,overlays,
  closeOther:()=>{triggerUi.close();editUi.close();closeModal();},notify:toast,
  setValue:values=>{const url=new URL(location.href);if(values.length)url.searchParams.set('status',values.join(','));else url.searchParams.delete('status');history.replaceState(null,'',url);}});
function activateDialog() {
  const d=overlays.querySelector('dialog')!;
  d.addEventListener('cancel',e=>{e.preventDefault();closeModal();pendingPath='';});
  d.showModal();
}
function render() {
  const focused = document.activeElement as HTMLInputElement;
  const name = focused?.name, selection = focused?.selectionStart;
  const id = routeId(), isRuns = id === 'runs';
  const names=Object.fromEntries(models.map(m=>[m.id,m.name]));
  const selected=editUi.models.find(m=>m.id===form.model);
  const selectedName=selected?`${selected.name} ${modelSuffix(selected,form.modelParameters??(form.model==='composer-2.5'?{fast:'false'}:selected.defaults))}`.trim():names[form.model]??(form.model||'Select model');
  let content: string;
  if (location.pathname === '/chat') content = chatGate();
  else if (params().get('state') === 'loading') content = '<div class="page" role="status">Loading…</div>';
  else if (params().get('state') === 'error') content = `<div class="page" role="alert">Could not load automations. ${btn('Retry','retry','outline')}</div>`;
  else if (params().get('state') === 'upgrade') content = gate();
  else if (missingRoute) content=notFound();
  else if (isRuns) content = runs(runRows(), params().get('scope') ?? 'team', runQuery, params().get('status') ?? '', searchOpen,names,referenceFixture()?referenceTime:Date.now());
  else if (id&&id!=='new') content = savedEditor(form,selectedName,errors,titleEditing,editorFixture(),triggerUi.preview());
  else if (id) content = savedEditor(form,selectedName,errors,true,false);
  else content = list(state.automations, scope, query, page,names);
  const markup = shell(content, isRuns ? 'Run History' : id ? form.name || 'New Automation' : '',id&&!isRuns&&!missingRoute?editorToolbar(form,dirty):'');
  if (app.querySelector('main')) { const template=document.createElement('template');template.innerHTML=markup;app.querySelector('main')!.replaceWith(template.content.querySelector('main')!); } else app.innerHTML=markup;
  app.querySelectorAll<HTMLAnchorElement>('.side-nav a').forEach(a=>{const active=a.pathname==='/automations';a.classList.toggle('selected',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if (referenceFixture() && id==='evidence-automation') {
    app.querySelectorAll<HTMLInputElement>('.ed-header input,.ed-body textarea,.ed-header button,.ed-body button,.ed-toolbar button').forEach(e=>{e.disabled=true;});
  }
  if (name) { const next = app.querySelector<HTMLInputElement>(`[name="${name}"]`); next?.focus();
    if (selection !== null && next && ['text','search'].includes(next.type)) next.setSelectionRange(selection,selection); }
}
function runRows(): Run[] {
  if (referenceFixture()) return [referenceRun()];
  if (params().get('fixture') === 'runs') return (['running','succeeded','failed','skipped'] as const).map((status,i)=>({
    id:`fixture-${i}`,automationId:'fixture',name:`Example ${status} run`,status,
    createdAt:new Date(Date.now()-i*3600000).toISOString(),output:'Synthetic UI fixture. No agent was executed.',model:'composer-2.5',fixture:true,
  }));
  const id = params().get('automation');
  return state.runs.filter(r=>!id||r.automationId===id);
}
function loadRoute() {
  scheduleUi.close();
  runFilter.reset();
  triggerUi.reset();
  const id = routeId();
  missingRoute=!/^\/automations(?:\/[\w-]+)?$/.test(location.pathname)&&location.pathname!=='/';
  if (id && id !== 'runs' && id !== 'new') {
    const found = editorFixture() && id==='editor-fixture' ? savedEditorFixture() :
      referenceFixture() && id==='evidence-automation' ? referenceAutomation() : state.automations.find(a=>a.id===id);
    if (!found) missingRoute=true;
    else form = structuredClone(found);
  } else if (id === 'new') form = {...draft(),model:''};
  errors = []; dirty = false; titleEditing=false; render();
}
function navigate(path: string, force = false) {
  if (dirty && !force) { pendingPath = path; openModal('unsaved'); return; }
  editUi.close(); closeModal(); history.pushState(null,'',path); loadRoute();
}
async function save() {
  errors = validate(form); if (errors.length) { closeModal(); render(); return; }
  if (busy) return; busy = true;
  try {
    const payload=editorFixture()?{...form,id:'',revision:0,createdAt:''}:form;
    const saved = await api<Automation>('/api/automations','POST',payload);
    state.automations = [...state.automations.filter(a=>a.id!==saved.id),saved];
    form = saved; dirty = false;
    const destination = pendingPath || `/automations/${saved.id}`; pendingPath = '';
    navigate(destination,true); toast('Saved locally.');
  } catch (e) { errors = [(e as Error).message]; closeModal(); render(); }
  finally { busy = false; }
}
const value = (name: string) => (overlays.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value ?? '');
const options = (values: readonly string[], selected: string) => values.map(v=>`<option ${v===selected?'selected':''}>${esc(v)}</option>`).join('');
function renderModal() {
  if(modal==='unsaved'){overlays.innerHTML=unsavedDialog();activateDialog();return;}
  if (modal==='run') {
    const run=runRows().find(r=>r.id===editId);
    if (!run) {closeModal();toast('Run not found.');return;}
    overlays.innerHTML=runSummary(run);activateDialog();return;
  }
  if (modal==='run-menu') {
    const run=runRows().find(r=>r.id===editId); if (!run) return;
    overlays.innerHTML=`<div class="run-menu" role="menu" aria-label="Row actions" tabindex="-1" data-evidence="rm-menu"><div class="run-menu-items">
      ${btn(`<span class="menu-icon">${icon('eye')}</span><span data-evidence="rm-view-label">View details</span>`,`run:${run.id}`,'','role="menuitem" data-evidence="rm-view"')}
      ${btn(`<span class="menu-icon">${icon('edit')}</span><span data-evidence="rm-edit-label">Edit Automation</span>`,`view-automation:${run.automationId}`,'','role="menuitem" data-evidence="rm-edit"')}</div></div>`;
    const menu=overlays.firstElementChild as HTMLElement, rect=returnFocus!.getBoundingClientRect();
    menu.style.left=`${Math.max(12,Math.min(rect.left,innerWidth-menu.offsetWidth-12))}px`;
    menu.style.top=`${Math.min(rect.bottom+4,innerHeight-menu.offsetHeight-8)}px`;
    menu.focus();return;
  }
  let html = '', title = '', footer = '';
  const apply = (action: string) => btn('Cancel','dismiss','outline')+btn('Done',action,'primary');
  if (modal === 'trigger') {
    const t = form.triggers.find(t=>t.id===editId) ?? {kind:'Schedule',event:'Cron',value:''};
    title = 'Add Trigger'; html = `<label class="field">Trigger<select name="trigger-kind">${options(triggerKinds,t.kind)}</select></label>
      <label class="field">Event<select name="trigger-event">${options(events[t.kind],t.event)}</select></label>
      ${field('Configuration (cron or event filter)','trigger-value',t.value,'placeholder="0 9 * * 1-5"')}
      <p>Schedules are stored, not executed. Webhook URLs require a connected execution adapter.</p>`;
    footer = apply('commit-trigger');
  } else if (modal === 'tool') {
    const t = form.tools.find(t=>t.id===editId) ?? {kind:'MCP',name:'',url:''};
    title = 'Add Tool or MCP'; html = `<label class="field">Tool<select name="tool-kind">${options(['MCP','Memories','Slack'],t.kind)}</select></label>
      ${field('Server or tool name','tool-name',t.name)}${field('MCP server URL','tool-url',t.url,'placeholder="https://example.com/mcp"')}
      <p>Not connected. Credentials are never collected here. An execution adapter must resolve authentication and tool access.</p>`;
    footer = apply('commit-tool');
  } else if (modal === 'models') {
    title = 'Model'; html = `${field('Search models','model-search')}<div class="menu">${models.map(m=>
      btn(esc(m.name),`model:${m.id}`,`model-item ${form.model===m.id?'selected':''}`)).join('')}</div>
      <p>Captured catalog subset; actual picker visibility and selection persistence on the reference are UNVERIFIED.</p>`;
  } else if (modal === 'repos') {
    title = 'Repositories'; html = `${field('Repositories (comma-separated owner/repository)','repositories',form.repositories.join(', '))}
      <p>Leave blank for no repository. Multiple repositories remain scoped to this automation.</p>`;
    footer = apply('commit-repos');
  } else if (modal === 'row') {
    title = 'Row actions'; html = `<div class="menu">${btn('Edit Details',`edit:${editId}`)}${btn('Duplicate',`duplicate:${editId}`)}
      ${btn('Copy as JSON',`copy:${editId}`)}<hr>${btn('Delete',`delete:${editId}`,'danger')}</div>`;
  } else if (modal === 'delete') {
    title = 'Delete automation?'; html = '<p>This removes the local definition. Existing run records are retained.</p>';
    footer = btn('Cancel','dismiss','outline')+btn('Delete',`confirm-delete:${editId}`,'primary');
  } else if (modal === 'filters') {
    title = 'Filter by'; html = `<div class="menu"><h3>Status</h3>${['running','failed','succeeded','skipped'].map(s=>
      btn(s[0]!.toUpperCase()+s.slice(1),`status:${s}`,params().get('status')===s?'selected':'')).join('')}
      <hr>${btn('Clear all filters','status:')}</div><p>Automation filtering is available from its editor's Run History link. Trigger/tool filters remain UNVERIFIED.</p>`;
  } else if (modal === 'unsaved') {
    title = 'Unsaved Changes'; html = '<p>Save or discard changes before continuing.</p>';
    footer = btn('Keep Editing','dismiss','outline')+btn('Discard','discard','outline')+btn('Save','save','primary');
  } else if (modal) {
    title = modal === 'upgrade' ? 'Local preview — no checkout' : 'Original local implementation';
    html = `<p>No remote account, billing, MCP or agent execution is connected. Definitions are saved on this machine.</p>
      <p>Observed: upgrade gate, Run History and a real plan-restricted failed-run summary.
      Automation-list rows remain extracted, not screenshot-certified.</p><div class="menu">
      ${link('Settings','/settings','button')}
      ${link('Local automation list','/automations','button')}${link('Captured upgrade state','/automations?state=upgrade','button')}
      ${link('Observed empty Run History','/automations/runs','button')}${link('Synthetic run states','/automations/runs?fixture=runs','button')}
      ${link('Reference-derived failed run','/automations/runs?fixture=observed-failure','button')}
      ${link('Reference-derived saved editor','/automations/editor-fixture?fixture=saved-editor','button')}
      ${link('Captured trigger controls','/automations/editor-fixture?fixture=saved-editor&controls=triggers','button')}
      ${link('Preset and validation captures','/automations/editor-fixture?fixture=saved-editor&controls=presets','button')}
      ${link('Unconnected Linear and MCP','/automations/editor-fixture?fixture=saved-editor&controls=connections','button')}
      ${link('Run filter acceptance','/automations/runs?fixture=observed-failure&controls=filters','button')}
      ${link('Loading state (design)','/automations?state=loading','button')}${link('Error state (design)','/automations?state=error','button')}
      ${btn('Export layout measurements','export')}</div>`;
  } else { closeModal(); return; }
  overlays.innerHTML = dialog(title,html,footer);
  activateDialog();
}
async function action(command: string) {
  if(scheduleUi.handle(command))return;
  if(!editorFixture()&&command==='tr-add'){scheduleUi.handle('sc-add');return;}
  if(runFilter.handle(command))return;
  if(triggerUi.handle(command))return;
  if(await editUi.handle(command))return;
  const [kind, id = ''] = command.split(':');
  if(kind==='edit-title'){titleEditing=true;render();app.querySelector<HTMLInputElement>('[name="name"]')?.focus();return;}
  if(kind==='toggle-enabled'){form.enabled=!form.enabled;dirty=true;render();return;}
  if(kind==='edit-branch'){toast('Branch context is stored with this local definition. Repository authorization is not connected.');return;}
  if(kind==='ed-settings')return;
  if(kind==='ed-runs'){navigate(`/automations/runs?automation=${form.id}`);return;}
  if (kind === 'dismiss') { pendingPath=''; closeModal(); }
  else if (kind === 'collapse') return;
  else if (kind === 'export') await exportMeasurements();
  else if (['models','repos','filters','unsaved'].includes(kind!)) openModal(kind!);
  else if (['trigger','tool','row','run','run-menu','delete'].includes(kind!)) openModal(kind!,id);
  else if (kind === 'scope') { scope=id; page=1; render(); }
  else if (kind === 'prev' || kind === 'next') { page=Math.max(1,page+(kind==='next'?1:-1)); render(); }
  else if (kind === 'edit') navigate(`/automations/${id}`);
  else if (kind === 'view-automation') navigate(`/automations/${id}${referenceFixture()?'?fixture=observed-failure':''}`);
  else if (kind === 'save') await save();
  else if (kind === 'discard') { const path=pendingPath; pendingPath=''; navigate(path,true); }
  else if (kind === 'retry') navigate('/automations',true);
  else if (kind === 'run-search') { searchOpen=true; render(); app.querySelector<HTMLInputElement>('[name="run-search"]')?.focus(); }
  else if (kind === 'status' || kind === 'run-scope') {
    const url = new URL(location.href), key=kind==='status'?'status':'scope';
    if (id) url.searchParams.set(key,id); else url.searchParams.delete(key);
    history.replaceState(null,'',url); closeModal(); render();
  } else if (kind === 'model') { form.model=id; dirty=true; closeModal(); render(); }
  else if (kind === 'remove-trigger' || kind === 'remove-tool') {
    if (kind === 'remove-trigger') form.triggers=form.triggers.filter(t=>t.id!==id);
    else form.tools=form.tools.filter(t=>t.id!==id);
    dirty=true; render();
  }
  else if (kind === 'commit-trigger') {
    const t: Trigger = {id:editId==='new'?crypto.randomUUID():editId,kind:value('trigger-kind') as TriggerKind,event:value('trigger-event'),value:value('trigger-value').trim()};
    form.triggers=[...form.triggers.filter(v=>v.id!==t.id),t]; dirty=true; closeModal(); render();
  } else if (kind === 'commit-tool') {
    const t: Tool = {id:editId==='new'?crypto.randomUUID():editId,kind:value('tool-kind') as Tool['kind'],name:value('tool-name').trim()||value('tool-kind'),url:value('tool-url').trim()};
    if (t.kind!=='MCP') t.url='';
    form.tools=[...form.tools.filter(v=>v.id!==t.id),t]; dirty=true; closeModal(); render();
  } else if (kind === 'commit-repos') {
    form.repositories=[...new Set(value('repositories').split(',').map(v=>v.trim()).filter(Boolean))];
    dirty=true; closeModal(); render();
  } else if (kind === 'copy') {
    await navigator.clipboard.writeText(JSON.stringify(state.automations.find(a=>a.id===id),null,2));
    closeModal(); toast('Copied local definition.');
  } else if (kind === 'duplicate') {
    const a=state.automations.find(a=>a.id===id); if (!a) return;
    navigate('/automations/new',true); form={...structuredClone(a),id:'',revision:0,createdAt:'',name:`Copy of ${a.name}`,enabled:false}; dirty=true; render();
  } else if (kind === 'confirm-delete') {
    const a=state.automations.find(a=>a.id===id); if (!a) return;
    await api(`/api/automations/${id}?revision=${a.revision}`,'DELETE');
    state.automations=state.automations.filter(a=>a.id!==id); closeModal(); render();
  } else if(kind==='cancel-run'){await api(`/api/runs/${id}/cancel`,'POST',{});toast('Cancellation requested.');
  } else if (kind === 'test') {
    if (dirty) { toast('Save changes before testing.'); return; }
    await api(`/api/automations/${form.id}/runs`,'POST',{});
    state=await api<State>('/api/state'); navigate(`/automations/runs?automation=${form.id}`);
  }
}
document.addEventListener('click',e=>{
  const target=(e.target as Element).closest<HTMLElement>('[data-act],a[data-nav]');
  if (!target) return;
  if (target instanceof HTMLAnchorElement) {
    if ((e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey) return;
    e.preventDefault(); navigate(target.getAttribute('href')!); return;
  }
  if (target.dataset.act) void action(target.dataset.act).catch(e=>toast((e as Error).message));
});
document.addEventListener('input',e=>{
  const input=e.target as HTMLInputElement;
  if(scheduleUi.input(input))return;
  if(triggerUi.input(input))return;
  if(editUi.input(input))return;
  if (input.name === 'list-search') { query=input.value; page=1; render(); return; }
  if (input.name === 'run-search') { runQuery=input.value; render(); return; }
  if (input.name === 'model-search') {
    overlays.querySelectorAll<HTMLButtonElement>('.model-item').forEach(b=>{b.hidden=!b.textContent?.toLowerCase().includes(input.value.toLowerCase());}); return;
  }
  if (input.name === 'trigger-kind') {
    const select=overlays.querySelector<HTMLSelectElement>('[name="trigger-event"]')!;
    select.innerHTML=options(events[input.value as TriggerKind], ''); return;
  }
  if (!app.contains(input)) return;
  if (input.name === 'name' || input.name === 'prompt') {
    form[input.name]=input.value;dirty=true;
    app.querySelector<HTMLButtonElement>('[data-act="save"]')?.removeAttribute('disabled');
  }
  else if (input.name === 'enabled') { form.enabled=input.checked; dirty=true; }
  else if (input.name === 'scope') { form.scope=input.value as Automation['scope']; dirty=true; }
});
document.addEventListener('submit',e=>{
  if((e.target as HTMLElement).id==='mcp-form'){e.preventDefault();void editUi.handle('ed-commit-mcp').catch(e=>toast((e as Error).message));}
});
window.addEventListener('beforeunload',e=>{if (dirty) {e.preventDefault(); e.returnValue='';}});
window.addEventListener('popstate',()=>{
  if (dirty) {
    pendingPath=location.pathname+location.search;
    history.pushState(null,'',form.id?`/automations/${form.id}`:'/automations/new'); openModal('unsaved');
  } else loadRoute();
});
document.addEventListener('keydown',e=>{
  if (e.altKey && e.shiftKey && e.code==='KeyE') {e.preventDefault();void exportMeasurements();return;}
  if(scheduleUi.key(e))return;
  if(runFilter.key(e))return;
  if(triggerUi.key(e))return;
  if(editUi.key(e))return;
  if(titleEditing&&(e.key==='Enter'||e.key==='Escape')){e.preventDefault();titleEditing=false;render();return;}
  const target=e.target as HTMLElement;
  if (target.matches('.run-data') && (e.key==='Enter'||e.key===' ')) {
    e.preventDefault();void action(target.dataset.act!);return;
  }
  if (modal==='run-menu') {
    if(e.key==='Escape'){e.preventDefault();closeModal();return;}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();const buttons=[...overlays.querySelectorAll<HTMLButtonElement>('button')];
      const current=buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next=current<0?(e.key==='ArrowDown'?0:buttons.length-1):(current+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
      buttons[next]?.focus();return;
    }
  }
  if ((e.metaKey||e.ctrlKey) && e.key==='s' && routeId() && routeId()!=='runs') {
    e.preventDefault(); void save();
  }
});
document.addEventListener('pointerdown',e=>{
  scheduleUi.pointer(e.target as Node);
  runFilter.pointer(e.target as Node);
  triggerUi.pointer(e.target as Node);
  editUi.pointer(e.target as Node);
  if(modal==='run-menu'&&!overlays.contains(e.target as Node)&&!returnFocus?.contains(e.target as Node)) closeModal();
});
async function boot() {
  app.innerHTML=shell('<div class="page" role="status">Loading…</div>');
  try {
    const loaded=await Promise.all([api<State>('/api/state'),api<typeof models>(editorFixture()||referenceFixture()?'/catalog.json':'/api/models'),
      api<EditorModel[]>('/editor-models.json'),api<McpProvider[]>('/mcp-catalog.json')]);
    [state,models]=loaded;editUi.models=editorFixture()?loaded[2]:models.map(m=>({...m,defaults:{},parameters:[]}));editUi.providers=loaded[3];
    loadRoute();
  } catch(e) {
    app.innerHTML=shell(`<div class="page" role="alert">${esc((e as Error).message)} ${btn('Retry','reload','outline')}</div>`);
  }
}
async function exportMeasurements() {
  const captureState=params().get('controls')==='filters'?runFilter.captureState():
    params().get('controls')==='connections'?(editUi.panel?editUi.captureConnectionState():triggerUi.captureConnectionState()):
    params().get('controls')==='presets'?(modal==='unsaved'?'unsaved-dialog':triggerUi.capturePresetState()):
    triggerUi.panel?triggerUi.captureState():editUi.panel?editUi.captureState():
    params().get('controls')==='triggers'?triggerUi.captureState():editorFixture()?'saved-editor':
    modal==='run-menu'?'failed-run-menu':modal==='run'?'failed-run-summary':referenceFixture()?'failed-run-list':routeId()==='runs'?'runs':'upgrade';
  if(!runFilter.open&&!triggerUi.panel&&!editUi.panel&&modal!=='run'&&modal!=='run-menu'&&modal!=='unsaved') closeModal();
  await new Promise<void>(r=>requestAnimationFrame(()=>r()));
  const build=await api<{hash:string}>('/api/build');
  const elements=[...document.querySelectorAll<HTMLElement>('[data-evidence]')].map(e=>{
    const rect=e.getBoundingClientRect(), computed=getComputedStyle(e);
    return {id:e.dataset.evidence,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
      text:e.textContent,value:'value' in e?(e as HTMLInputElement).value:null,
      attributes:Object.fromEntries([...e.attributes].map(a=>[a.name,a.value])),
      style:Object.fromEntries([...computed,'border-radius','padding','margin'].map(k=>[k,computed.getPropertyValue(k)]))};
  });
  const measurement={buildHash:build.hash,captureState,captureDate:new Date().toISOString(),url:location.href,
    viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},elements,
    focus:(document.activeElement as HTMLElement)?.dataset.evidence??null};
  const url=URL.createObjectURL(new Blob([JSON.stringify(measurement,null,2)],{type:'application/json'}));
  const anchor=document.createElement('a'); anchor.href=url;
  anchor.download=`local-automations-${captureState}.json`; anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener('click',e=>{if ((e.target as Element).closest('[data-act="reload"]')) void boot();});
installSidebar();
void boot();

setInterval(()=>{if(location.pathname==='/automations/runs'&&!referenceFixture()&&!params().has('fixture'))void api<State>('/api/state').then(s=>{state=s;render();if(modal==='run')renderModal();}).catch(()=>{});},1500);
