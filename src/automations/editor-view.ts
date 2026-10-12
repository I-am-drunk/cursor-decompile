import type { Automation } from './model.ts';
import type { EditorModel, McpConfig, McpProvider } from './editor-state.ts';
import { modelSuffix } from './editor-state.ts';
import { btn, esc, icon } from './view.ts';
import { presetRow, presetWarning } from './preset-view.ts';
import { connectionWarning, linearRow } from './connection-view.ts';
export function editorToolbar(a:Automation,dirty:boolean):string {
  return `<div class="ed-toolbar">${btn('Save','save','ed-save',`${dirty?'':'disabled'} data-evidence="ed-save"`)}
    ${btn(`▷ Test`,'test','outline','data-evidence="ed-test"')}
    ${btn(icon('menu'),`row:${a.id}`,'icon','aria-label="More actions"')}</div>`;
}
export function savedEditor(a:Automation,model:string,errors:string[],titleEditing=false,fixture=false,preview?:{id:string;value:string}):string {
  const repo=a.repositories[0]?.split('/').at(-1)||'No repository';
  const multiple=a.triggers.filter(t=>t.kind==='Schedule').length>1;
  const requiresConnection=a.triggers.some(t=>t.kind==='Linear');
  return `<div class="ed-header"><div class="ed-title-line">${titleEditing?
    `<input name="name" aria-label="Automation name" value="${esc(a.name)}" maxlength="200">`:
    btn(`<span data-evidence="ed-name">${esc(a.name||'Untitled Automation')}</span>${icon('edit')}`,'edit-title','ed-title',`aria-label="Edit automation name" data-evidence="ed-title"`)}</div>
    <div class="ed-meta" data-evidence="ed-meta">
      ${btn('<span></span>','toggle-enabled',`ed-switch ${a.enabled?'on':''}`,`role="switch" aria-checked="${a.enabled}" aria-label="Toggle automation enabled state" data-evidence="ed-switch"`)}
      <span>${a.enabled?'Active':'Inactive'}</span><i></i>
      <div class="ed-environment">${btn(`${esc(repo)} ⌄`,'repos','ed-small')}${btn(`${esc(a.branch||'main')} ⌄`,'edit-branch','ed-small')}${btn('♧ ⌄','about','ed-small','aria-label="Cloud environment"')}</div>
      <i></i><span class="muted">By ${esc(a.ownerName||'You')}</span></div>
    <div class="tabs ed-tabs" role="tablist" aria-label="Automation detail sections" data-evidence="ed-tabs">
      ${btn('Settings','ed-settings','','role="tab" aria-selected="true"')}${btn('Run History',`ed-runs:${a.id}`,'','role="tab" aria-selected="false"')}</div></div>
    <div class="ed-body">${errors.length?`<div class="validation" role="alert">${errors.map(esc).join('<br>')}</div>`:''}
    <section class="ed-section ed-triggers"><h3 data-evidence="ed-trigger-title">Triggers</h3><div class="ed-card" data-evidence="ed-trigger-card">
      ${a.triggers.map(t=>t.kind==='Linear'?linearRow(t):t.schedule?presetRow(t,fixture,preview?.id===t.id?preview.value:undefined):`<div class="ed-trigger-row tr-row" data-evidence="tr-existing-row"><span class="tr-clock">${icon('clock')}</span><div class="ed-trigger-main"><span class="${t.kind==='Schedule'?'tr-schedule-label':''}" data-evidence="tr-existing-label">${t.kind==='Schedule'?'Custom schedule':esc(t.kind)}</span>
      ${btn(`<span data-evidence="tr-existing-cron-label">${esc(t.value)}</span>${icon('chevron')}`,`${t.kind==='Schedule'?'tr-cron':'trigger'}:${t.id}`,'ed-cron',`aria-haspopup="menu" aria-expanded="false" data-evidence="tr-existing-cron" ${t.value==='0 0 1 1 *'?'data-reference-cron':''}`)}<span class="muted">${fixture&&t.value==='0 0 1 1 *'?'Next run Thu, Dec 31, 7:00 p.m. EST':esc(t.event)}</span></div>
      ${btn(icon('close'),`remove-trigger:${t.id}`,'icon','aria-label="Remove trigger"')}</div>`).join('')}
      <div class="ed-add-wrap">${btn(`${icon('plus')}<span data-evidence="tr-add-label">Add Trigger</span>`,'tr-add','ed-add','role="combobox" aria-label="Add Trigger" aria-haspopup="dialog" aria-expanded="false" data-evidence="ed-add-trigger"')}</div></div><div class="ed-caption ${multiple||requiresConnection?'has-warning':''}">${requiresConnection?presetWarning(connectionWarning):multiple?presetWarning():''}</div></section>
    <section class="ed-section"><h3 data-evidence="ed-prompt-title">Agent Instructions</h3><div class="ed-prompt-card" data-evidence="ed-prompt-card">
      <textarea name="prompt" aria-label="Agent Instructions" placeholder="Type @ for tools, / for commands..." data-evidence="ed-prompt">${esc(a.prompt)}</textarea>
      <div class="ed-prompt-footer" data-evidence="ed-prompt-footer">${btn(`${esc(model)} ⌄`,'ed-models','ed-model','data-evidence="ed-model"')}</div></div><div class="ed-caption"></div></section>
    <section class="ed-section"><h3 data-evidence="ed-tools-title">Tools</h3><div class="ed-card ed-tools" data-evidence="ed-tools-card">
      ${a.tools.map(t=>`<div class="ed-tool-row">${btn(esc(t.name),`ed-tool:${t.id}`,'grow')}${btn(icon('close'),`remove-tool:${t.id}`,'icon','aria-label="Remove tool"')}</div>`).join('')}
      ${btn(`${icon('plus')}<span>Add Tool or MCP</span>`,'ed-tools','ed-add','data-evidence="ed-add-tools"')}</div><div class="ed-caption">${!fixture&&a.id?`<a href="/settings/mcp?automation=${encodeURIComponent(a.id)}">Manage registry and per-automation MCP grants</a>`:''}</div></section></div>`;
}
export function toolsMenu(a:Automation,submenu=false):string {
  const groups=[['Built-in',['Memories']],['MCP',['MCP Server']],['Slack',['Send to Slack','Read Public Slack Channels']],
    ['Microsoft Teams',['Send to Microsoft Teams','Read Microsoft Teams Channels']],['Source Control',['Open Pull Request','Comment on Pull Request','Request Reviewers']]] as const;
  const content=groups.map(([label,items])=>`<section><h3>${label}</h3>${items.map(name=>{
    const added=a.tools.some(t=>t.name===name);
    return btn(`<span class="ed-menu-icon">${name==='MCP Server'?'◇':'○'}</span><span>${name}</span>${name==='MCP Server'?'<span>›</span>':added?'<small>Added</small>':''}`,
      name==='MCP Server'?'ed-mcp-menu':`ed-add-tool:${name}`,'',`role="menuitem" ${added?'disabled':''}`);
  }).join('')}</section>`).join('<hr>');
  const connections=a.tools.filter(t=>t.kind==='MCP');
  return `<div class="ed-pop ed-tools-menu" role="menu" aria-label="Tools" tabindex="-1" data-evidence="et-menu"><div class="ed-tools-inner">${content}</div></div>`+
    (submenu?`<div class="ed-pop ed-mcp-menu" role="menu" aria-label="MCP Server" tabindex="-1" data-evidence="em-menu">
      ${btn('New Connection','ed-browse','','role="menuitem" data-evidence="em-new"')}
      ${connections.length?connections.map(t=>btn(esc(t.name),`ed-tool:${t.id}`,'','role="menuitem"')).join(''):btn('No MCP servers configured','none','','disabled role="menuitem" data-evidence="em-empty"')}</div>`:'');
}
export function browseMcp(providers:McpProvider[],query:string):string {
  const shown=providers.filter(p=>`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
  return `<dialog class="ed-browse ${query&&shown.length>0&&shown.length<=9?'short':''}" aria-labelledby="browse-title" data-evidence="eb-dialog"><div class="ed-browse-inner">
    <header data-evidence="eb-header"><h2 id="browse-title">Browse MCPs</h2>${btn(icon('close'),'ed-close','icon','aria-label="Close"')}</header>
    <div class="ed-browse-search"><span>${icon('search')}</span><input name="provider-search" placeholder="Search anything" value="${esc(query)}" data-evidence="eb-search"></div>
    <div class="ed-browse-scroll" data-evidence="eb-scroll"><div class="ed-provider-grid">${shown.map(p=>
      `<button class="ed-provider ${p.name==='Custom MCP'?'custom':''}" data-act="${p.name==='Custom MCP'?'ed-custom':'ed-provider:'+p.id}" ${p.name==='Custom MCP'?'data-evidence="eb-custom"':['provider-1','provider-2'].includes(p.id)?`data-evidence="eb-${p.id}"`:p.name==='Linear'?'data-evidence="lc-provider"':''}>
        <span class="provider-icon" aria-hidden="true">${p.name==='Custom MCP'?'+':esc(p.name.slice(0,1))}</span>
        <span class="provider-copy"><span>${esc(p.name)}</span><span>${esc(p.description.replace(/\bCursor\b/g,'Workspace'))}</span></span>${p.name==='Custom MCP'?'':'<span>›</span>'}
      </button>`).join('')}${shown.length?'':'<p>No results found</p>'}</div></div></div></dialog>`;
}
const mcpInput=(name:string,value:string,placeholder:string,attrs='')=>
  `<input name="${name}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${attrs}>`;
export function mcpForm(c:McpConfig,isJson:boolean,jsonText:string,error:string,jsonHeight=156):string {
  const row=(label:string,html:string)=>`<div class="mcp-row"><label>${label}</label><div>${html}</div></div>`;
  const pairs=(kind:'headers'|'env')=>[...Object.entries(c[kind]),['','']].map(([k,v],i)=>
    `<div class="mcp-pair">${mcpInput(`${kind}-key-${i}`,k!,'Key',i?'':'data-evidence="mc-key"')}${mcpInput(`${kind}-value-${i}`,v!,'Value',i?'':'data-evidence="mc-value"')}</div>`).join('');
  const fields=row('Name *',mcpInput('mcp-name',c.name,'my-mcp-server','data-evidence="mc-name"'))+
    row('Type',`<div class="mcp-type" data-evidence="mc-type">${btn('URL','ed-mcp-type:url',c.type==='url'?'selected':'')}${btn('Command','ed-mcp-type:command',c.type==='command'?'selected':'')}</div>`)+
    (c.type==='url'?row('Server URL *',mcpInput('mcp-url',c.url,'https://...','data-evidence="mc-url"'))+row('Headers',pairs('headers')):
      row('Command *',mcpInput('mcp-command',c.command,'npx','data-evidence="mc-command"'))+
      row('Arguments',[...c.args,''].map((a,i)=>mcpInput(`arg-${i}`,a,'Argument',i?'':'data-evidence="mc-argument"')).join(''))+row('Environment',pairs('env')));
  return `<dialog class="ed-custom" aria-labelledby="mcp-title" data-evidence="mc-dialog">
    <header data-evidence="mc-header"><h2 id="mcp-title">Add a Custom MCP</h2>${btn(icon('close'),'ed-close','icon','aria-label="Close"')}</header>
    <form id="mcp-form"><div class="mcp-content ${isJson?`mcp-json-height-${jsonHeight}`:''}" data-evidence="mc-content">
      ${isJson?`<textarea name="mcp-json" aria-label="MCP JSON" data-evidence="mc-json">${esc(jsonText)}</textarea>`:fields}
      ${error?`<p class="validation" role="alert">${esc(error)}</p>`:''}</div>
      <div class="mcp-divider"></div><footer data-evidence="mc-footer">${btn(isJson?'Edit Form':'Edit JSON','ed-mcp-json','','data-evidence="mc-toggle"')}
        <span></span>${btn('Cancel','ed-close','','data-evidence="mc-cancel"')}${btn('Add MCP','ed-commit-mcp','primary','data-evidence="mc-submit"')}</footer></form></dialog>`;
}
export function modelMenu(models:EditorModel[],active:string,values:Record<string,string>,query:string,optionsFor:string):string {
  const shown=models.filter(m=>m.name.toLowerCase().includes(query.toLowerCase()));
  const rows=shown.map((m,i)=>{
    const suffix=modelSuffix(m,m.id===active?values:m.defaults);
    const badge=m.id==='grok-4.7'&&active!==m.id?'<small>NEW</small>':'';
    const choice=btn(`${esc(m.name)} <span class="muted">${esc(suffix)}</span>${badge}`,`ed-select-model:${m.id}`,'ed-model-choice');
    const edit=btn('›',`ed-model-options:${m.id}`,'ed-model-options-button',`aria-label="Edit ${esc(m.name)} options"`);
    return `<div class="ed-model-row" role="menuitem" tabindex="0" data-model="${m.id}" data-evidence="mp-item-${i}">${choice}${edit}</div>`;
  }).join('');
  const selected=models.find(m=>m.id===optionsFor);
  let options='';
  if(selected) options=`<div class="ed-pop ed-model-options" role="menu" data-evidence="mo-menu">${selected.parameters.map(p=>{
    const title=p.boolean?'Options':p.name;
    const choices=p.boolean?
      btn(`${values[p.id]==='true'?'✓':'　'} ${p.name}`,`ed-param:${p.id}:${values[p.id]==='true'?'false':'true'}`,'',`role="menuitemcheckbox" aria-checked="${values[p.id]==='true'}" data-evidence="mo-${p.id}"`):
      p.options.map(o=>btn(`${values[p.id]===o.value?'✓':'　'} ${esc(o.label)}`,`ed-param:${p.id}:${o.value}`,'',`role="menuitem" data-evidence="mo-${p.id}-${o.value}"`)).join('');
    return `<section><h3>${esc(title)}</h3>${choices}</section>`;
  }).join('')}</div>`;
  return `<div class="ed-pop ed-model-menu" role="menu" data-evidence="mp-menu">
    <div class="ed-model-search"><input name="ed-model-search" placeholder="Search models" value="${esc(query)}" data-evidence="mp-search"></div>
    <div class="ed-model-list">${rows||'<p>No results found</p>'}</div></div>${options}`;
}
