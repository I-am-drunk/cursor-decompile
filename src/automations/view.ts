import type { Automation, Run } from './model.ts';
import { runDuration, runTime, shortAge } from './row-data.ts';
import { parseRunStatuses } from './run-filter-state.ts';
export const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const icon = (name: string): string => {
  const paths: Record<string, string> = {
    send: '<path d="M2 2.5h12L8 14V7.5L2 2.5Z"/>',
    automation: '<rect x="1.5" y="4.5" width="13" height="10" rx="2"/><path d="M8 1v3.5M5.5 8v3m5-3v3"/>',
    gear: '<path d="M6 1h4l1 3 3 1v4l-3 1-1 3H6l-1-3-3-1V5l3-1Z"/><circle cx="8" cy="7" r="2"/>',
    person: '<circle cx="8" cy="5" r="3"/><path d="M2 15v-2a6 6 0 0 1 12 0v2"/>',
    search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 4 4"/>',
    clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4v4H5"/>',
    warning: '<path d="M8 2 15 14H1ZM8 6v4M8 12v.2"/>',
    plug: '<path d="M5 2v4m6-4v4M4 6h8v3a4 4 0 0 1-8 0ZM8 13v3"/>',
    chevron: '<path d="m3 6 5 5 5-5"/>',
    filter: '<path d="M2 4h12M4 8h8M6 12h4"/>',
    bot: '<rect x="3" y="5" width="10" height="9" rx="2"/><path d="M8 1v4M6 8v3m4-3v3"/>',
    plus: '<path d="M8 2v12M2 8h12"/>', arrow: '<path d="M4 12 12 4M4 4h8v8"/>',
    menu: '<circle cx="3" cy="8" r=".7"/><circle cx="8" cy="8" r=".7"/><circle cx="13" cy="8" r=".7"/>',
    code: '<path d="m5 4-4 4 4 4m6-8 4 4-4 4M9 2 7 14"/>',
    check: '<path d="m3 8 3 3 7-7"/>', close: '<path d="m4 4 8 8M12 4l-8 8"/>',
    sidebar: '<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M6 3v10"/>',
    eye: '<path d="M1 8q7-10 14 0-7 10-14 0Z"/><circle cx="8" cy="8" r="2"/>',
    edit: '<path d="M8 3H2v11h11V8M7 9l1-3 5-5 2 2-5 5-3 1Z"/>',
  };
  return `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">${paths[name] ?? paths.bot}</svg>`;
};
export const btn = (label: string, act: string, cls = '', attrs = '') =>
  `<button type="button" class="${esc(cls)}" data-act="${esc(act)}" ${attrs}>${label}</button>`;
export const link = (label: string, path: string, cls = '') =>
  `<a class="${cls}" href="${esc(path)}" data-nav>${label}</a>`;
export const field = (label: string, name: string, value = '', attrs = '') =>
  `<label class="field">${label}<input name="${name}" value="${esc(value)}" ${attrs}></label>`;
export function shell(content: string, crumb = '', toolbar = ''): string {
  const destination=(name: string, glyph: string, path: string) =>
    `<a href="${path}" ${path.startsWith('/automations')?'data-nav':''} aria-label="${name}" title="${name}" class="destination ${name===(crumb==='Run History'?'Run History':'Automations')?'selected':''}"><span class="rail-icon">${icon(glyph)}</span><span class="side-label">${name}</span></a>`;
  return `<aside data-evidence="sidebar" class="shell-sidebar" aria-label="Main navigation"><div class="sidebar-surface">
    <div class="brand">${btn(icon('sidebar'), 'collapse', 'icon', 'aria-label="Collapse sidebar" aria-expanded="true"')}${btn(icon('search'), 'sidebar-search', 'icon side-label', 'aria-label="Search" disabled')}</div>
    <nav class="side-nav">${destination('New Chat','send','/chat')}${destination('Automations','automation','/automations')}</nav>
    <div class="no-agents side-label">No Agents Yet</div><div class="account">
      ${destination('Settings','gear','/settings')}
  </div></div></aside><main>${crumb ? `<div class="breadcrumb ${toolbar?'ed-bar':''}" data-evidence="breadcrumb">${link('Automations','/automations')}<span>›</span>${esc(crumb)}${toolbar}</div>` : ''}
    <div class="scroll-pane">${content}</div></main>`;
}

// Owner-required disconnected state; never infer a connection from saved intent.
export function chatGate(): string {
  return '<div class="chat-gate"><h1><a href="/settings/linear">Connect to <span>Linear</span></a></h1></div>';
}
export function notFound(): string {
  return `<div class="page"><h1>Page not found</h1><p>This page is no longer available.</p>${link('Back to Automations','/automations','button outline')}</div>`;
}
export function gate(): string {
  return `<div class="page gate"><header><h1 data-evidence="gate-title">Automations</h1></header>
    <section class="upsell" data-evidence="gate-card"><div class="upsell-inner">
      <div><h3 data-evidence="gate-heading">Upgrade to unlock Automations</h3>
      <p data-evidence="gate-description">Upgrade for Automations, unlimited completions, MAX Mode, and more</p></div>
      ${btn('Upgrade to Pro', 'upgrade', 'primary', 'data-evidence="gate-button"')}
    </div></section></div>`;
}
export function tabs(scope: string, action = 'scope'): string {
  return `<div class="tabs" role="tablist" aria-label="${action === 'scope' ? 'Automation filters' : 'Run ownership'}">
    ${['mine','team'].map(s => btn(s === 'mine' ? 'Mine' : 'Team', `${action}:${s}`, '', `role="tab" aria-selected="${scope === s}"`)).join('')}</div>`;
}
export function list(rows: Automation[], scope: string, query: string, page: number, modelNames: Record<string,string> = {}): string {
  const filtered = rows.filter(a => (scope === 'team' || a.scope === 'mine') && `${a.name} ${a.ownerName??'You'}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a,b) => Number(b.enabled) - Number(a.enabled));
  const count = Math.max(1, Math.ceil(filtered.length / 10)), current = Math.min(page, count);
  const visible = filtered.slice((current - 1) * 10, current * 10);
  return `<div class="page list"><header><div class="title-row"><h1>Automations</h1>${link('New Automation','/automations/new','primary button')}</div>
    <p>Automate repetitive tasks with always-on agents and configure agents for your team.</p></header>
    <div class="toolbar">${tabs(scope)}<div class="actions">${link(`All Runs ${icon('arrow')}`,'/automations/runs','button')}
    <input name="list-search" aria-label="Search automations" placeholder="Search..." value="${esc(query)}"></div></div>
    ${listBody(visible, query, filtered.length, current, count, modelNames)}</div>`;
}
function listBody(rows: Automation[], query: string, total: number, page: number, pages: number, modelNames: Record<string,string>): string {
  if (!rows.length) return `<div class="empty card"><h3>${query ? 'No Results Found' : 'No Automations Yet'}</h3>
    ${query ? '' : `<p>Automate repetitive tasks with always-on agents and configure agents for your team.</p>
    ${link('New Automation','/automations/new','button outline')}`}</div>`;
  return `<div class="list-table card" role="table" aria-label="Automations"><div class="table-row table-header" role="row">
    ${['Name','Model','Created By','Status','Tools',''].map((v,i) => `<span class="list-col-${i}" role="columnheader">${v}</span>`).join('')}</div>
    ${rows.map(a => `<div class="table-row" role="row">${link(`<span role="cell" class="list-col-0">${esc(a.name||'Untitled')}</span>
      <span role="cell" class="list-col-1">${esc(modelNames[a.model]??a.model??'-')}</span>
      <span role="cell" class="list-col-2 owner-meta"><span>${esc(a.ownerName??'You')}</span><span class="muted">${shortAge(a.createdAt)}</span></span>
      <span role="cell" class="list-col-3 status ${a.enabled ? 'active' : ''}">${icon(a.enabled ? 'check' : 'close')}${a.enabled ? 'Active' : 'Inactive'}</span>
      <span role="cell" class="list-col-4">${esc(a.tools.map(t=>t.kind).filter((v,i,s)=>s.indexOf(v)===i).join(', ') || '-')}</span>`,
      `/automations/${a.id}`,'row-link')}<span role="cell" class="list-col-5">${btn(icon('menu'),`row:${a.id}`,'icon','aria-label="More actions"')}</span></div>`).join('')}</div>
    ${pages > 1 ? `<footer class="pagination"><span>${(page-1)*10+1}–${Math.min(page*10,total)} of ${total}</span>
    <div>${btn('‹','prev','icon',page===1?'disabled aria-label="Previous page"':'aria-label="Previous page"')} ${page} / ${pages}
    ${btn('›','next','icon',page===pages?'disabled aria-label="Next page"':'aria-label="Next page"')}</div></footer>` : ''}`;
}
export function editor(a: Automation, modelName: string, errors: string[]): string {
  return `<div class="page editor"><header><div class="title-row"><input class="title-input" name="name" aria-label="Automation name" placeholder="New Automation" value="${esc(a.name)}" maxlength="200">
    <div class="actions">${a.id ? btn('Run Test','test','outline') : ''}${btn(a.id ? 'Save' : 'Create','save','primary')}</div></div>
    <div class="metadata"><label><input type="checkbox" name="enabled" ${a.enabled?'checked':''}> ${a.enabled?'Active':'Inactive'}</label>
      ${btn(`${icon('code')} ${esc(a.repositories.join(', ') || 'No repository')}`,'repos','plain')}
      <label>Access <select name="scope"><option value="mine" ${a.scope==='mine'?'selected':''}>Only me</option><option value="team" ${a.scope==='team'?'selected':''}>Team</option></select></label></div>
    ${a.id ? link('Run History',`/automations/runs?automation=${a.id}`,'button') : ''}</header>
    ${errors.length ? `<div class="validation" role="alert">${errors.map(esc).join('<br>')}</div>` : ''}
    <section><h3>Triggers</h3><div class="card config-card">${a.triggers.map(t=>`<div class="config-row">
      ${btn(`${esc(t.kind)} <span class="muted">${esc(t.event)}${t.value?' · '+esc(t.value):''}</span>`,`trigger:${t.id}`,'plain grow')}
      ${btn(icon('close'),`remove-trigger:${t.id}`,'icon','aria-label="Remove trigger"')}</div>`).join('')}
      ${btn(`${icon('plus')} Add Trigger`,'trigger:new','plain add-row')}</div></section>
    <section><div class="title-row"><h3>Prompt</h3>${btn(`${esc(modelName)} ▾`,'models','outline')}</div>
      <textarea class="card prompt" name="prompt" aria-label="Prompt" placeholder="Describe what this automation should do...">${esc(a.prompt)}</textarea></section>
    <section><h3>Tools</h3><div class="card config-card">${a.tools.map(t=>`<div class="config-row">
      ${btn(`${esc(t.name)} <span class="muted">${t.kind==='MCP'?'Not connected':esc(t.kind)}</span>`,`tool:${t.id}`,'plain grow')}
      ${btn(icon('close'),`remove-tool:${t.id}`,'icon','aria-label="Remove tool"')}</div>`).join('')}
      ${btn(`${icon('plus')} Add Tool or MCP`,'tool:new','plain add-row')}</div></section>
    <p class="implementation-note">Local implementation · editor geometry is extracted/UNVERIFIED. Connections and execution require an adapter.</p></div>`;
}
export function runs(rows: Run[], scope: string, query: string, status: string, searchOpen: boolean, modelNames: Record<string,string> = {}, now = Date.now()): string {
  const selected=parseRunStatuses(status);
  const visible = rows.filter(r => (!selected.length || selected.includes(r.status)) && r.name.toLowerCase().includes(query.toLowerCase()));
  const counts = ([['succeeded',1],['failed',1],['succeeded',7],['failed',7]] as const)
    .map(([s,days]) => visible.filter(r => r.status===s && Date.parse(r.createdAt)>=now-days*86400000).length);
  return `<div class="page runs"><header data-evidence="runs-header"><h1 data-evidence="runs-title">Run History</h1></header>
    <div class="runs-body"><div class="toolbar" data-evidence="runs-toolbar">${tabs(scope,'run-scope')}
    <div class="actions">${searchOpen ? `<input name="run-search" placeholder="Search runs..." aria-label="Search runs" value="${esc(query)}">` :
      btn(icon('search'),'run-search','icon','aria-label="Search" data-evidence="runs-search"')}
      ${btn(icon('filter')+(selected.length?'<span class="rf-badge" data-evidence="rf-badge">1</span>':''),'filters',`icon rf-filter ${status?'selected':''}`,'aria-label="Filter runs" data-evidence="runs-filter"')}</div></div>
    <div class="stats" data-evidence="runs-stats">${['Successful · 24h','Failed · 24h','Success 7d','Failed 7d'].map((s,i) =>
      `<div class="stat card" data-evidence="stat-${i}"><div>${s}</div><strong data-evidence="rf-count-${i}">${counts[i]}</strong></div>`).join('')}</div>
    <div class="runs-table card" data-evidence="${visible.length?'rw-card':'runs-card'}"><div role="table" aria-label="Run history" data-evidence="${visible.length?'rw-table':'runs-table'}">
      ${!visible.length ? query||status?`<div class="runs-empty filtered"><div class="rf-empty-content"><h3 data-evidence="rf-empty">No Results</h3><div class="rf-hint" data-evidence="rf-hint">Try different filters</div></div></div>`:
      '<div class="runs-empty"><h3 data-evidence="runs-empty">No Runs Yet</h3></div>' : runTable(visible,modelNames,now)}
    </div></div></div>${rows.some(r=>r.fixture)?'<p class="implementation-note">Reference-derived or synthetic fixture — not a live local execution.</p>':''}</div>`;
}
export const dialog = (title: string, content: string, footer = '') =>
  `<dialog aria-labelledby="dialog-title"><div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2>
  ${btn(icon('close'),'dismiss','icon','aria-label="Close dialog"')}</div>${content}${footer ? `<footer>${footer}</footer>` : ''}</dialog>`;
function runTable(rows: Run[], modelNames: Record<string,string>, now: number): string {
  const headers=['Automation','Model','Triggered','Tools','Status','Duration',''];
  const header=headers.map((h,i)=>`<div role="columnheader" class="run-col-${i}" data-evidence="rw-head-${i}"><span>${h}</span></div>`).join('');
  const body=rows.map((r,index)=>{
    const evidence=(key:string)=>index===0?`data-evidence="${key}"`:'';
    const cells=[
      `<span class="truncate" title="${esc(r.name)}">${esc(r.name)}</span>`,
      `<span class="run-secondary">${esc(modelNames[r.model]??r.model)}</span>`,
      `<span class="run-secondary">${esc(runTime(r.createdAt))}</span>`,
      `<span>${esc(r.tools?.join(', ')||'—')}</span>`,
      `<span class="run-status ${esc(r.status)}" ${evidence('rw-status')}>${esc(r.status[0]!.toUpperCase()+r.status.slice(1))}</span>`,
      `<span class="run-secondary">${esc(runDuration(r,now))}</span>`,
      btn(icon('menu'),`run-menu:${r.id}`,'icon run-more',`aria-label="More actions" ${evidence('rw-more')}`),
    ].map((html,i)=>`<div role="cell" class="run-col-${i}" ${evidence(`rw-cell-${i}`)}>${html}</div>`).join('');
    return `<div class="run-grid run-data" role="row" tabindex="0" aria-label="${esc(r.name)}" data-act="run:${esc(r.id)}" ${evidence('rw-row')}>${cells}</div>`;
  }).join('');
  return `<div class="run-table-inner"><div class="run-grid run-head" role="row" data-evidence="rw-header">${header}</div><div role="rowgroup">${body}</div></div>`;
}
export function runSummary(run: Run): string {
  const failure=run.failure;
  const cta='';
  const problem=failure ? `<div class="summary-failure" data-evidence="sum-failure">
    <span class="summary-icon error-icon" aria-hidden="true">⊗</span><div class="summary-error-text">
    <span class="summary-error-title" data-evidence="sum-failure-title">${esc(failure.title)}</span>
    <span class="summary-error-message" data-evidence="sum-failure-message">${esc(failure.message)}</span>${cta}</div></div>` : '';
  return `<dialog class="run-summary" aria-labelledby="summary-title" data-evidence="sum-dialog">
    <header class="summary-heading" data-evidence="sum-header"><h2 id="summary-title" data-evidence="sum-title">Run summary</h2></header>
    <div class="summary-body" data-evidence="sum-body"><div class="summary-card" data-evidence="sum-card">
      <div class="summary-trigger" data-evidence="sum-trigger">
        <h3>Trigger <span> · ${esc(runTime(run.createdAt,true))}</span></h3>
        <div class="summary-event"><span class="summary-icon" aria-hidden="true">▷</span><span>${run.testRun?'Test run':'Run'}</span></div>
      </div>${problem}${run.output?`<pre>${esc(run.output)}</pre>`:''}
    </div></div>
    <footer class="summary-footer" data-evidence="sum-footer">
      ${run.status==='running'?btn('Cancel run',`cancel-run:${run.id}`,'outline'):''}
      ${btn('Close','dismiss','outline','data-evidence="sum-close"')}
      ${btn('View Automation',`view-automation:${run.automationId}`,'summary-view','data-evidence="sum-view"')}
    </footer></dialog>`;
}
