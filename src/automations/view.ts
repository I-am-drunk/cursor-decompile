import type { Automation, Run } from './model.ts';
export const esc = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const icon = (name: string): string => {
  const paths: Record<string, string> = {
    search: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 4 4"/>',
    filter: '<path d="M2 4h12M4 8h8M6 12h4"/>',
    bot: '<rect x="3" y="5" width="10" height="9" rx="2"/><path d="M8 1v4M6 8v3m4-3v3"/>',
    plus: '<path d="M8 2v12M2 8h12"/>', arrow: '<path d="M4 12 12 4M4 4h8v8"/>',
    menu: '<circle cx="3" cy="8" r=".7"/><circle cx="8" cy="8" r=".7"/><circle cx="13" cy="8" r=".7"/>',
    code: '<path d="m5 4-4 4 4 4m6-8 4 4-4 4M9 2 7 14"/>',
    check: '<path d="m3 8 3 3 7-7"/>', close: '<path d="m4 4 8 8M12 4l-8 8"/>',
    sidebar: '<rect x="2" y="3" width="12" height="10" rx="1"/><path d="M6 3v10"/>',
  };
  return `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3">${paths[name] ?? paths.bot}</svg>`;
};
export const btn = (label: string, act: string, cls = '', attrs = '') =>
  `<button type="button" class="${esc(cls)}" data-act="${esc(act)}" ${attrs}>${label}</button>`;
export const link = (label: string, path: string, cls = '') =>
  `<a class="${cls}" href="${esc(path)}" data-nav>${label}</a>`;
export const field = (label: string, name: string, value = '', attrs = '') =>
  `<label class="field">${label}<input name="${name}" value="${esc(value)}" ${attrs}></label>`;
export function shell(content: string, crumb = ''): string {
  return `<aside data-evidence="sidebar">
    <div class="brand"><strong aria-label="Original local implementation">◈</strong><span></span>
      ${btn(icon('sidebar'), 'collapse', 'icon', 'aria-label="Collapse sidebar"')}
      ${btn(icon('search'), 'about', 'icon', 'aria-label="Search"')}</div>
    <nav class="side-nav">
      ${btn(`${icon('arrow')} New Chat`, 'about')}
      ${link(`${icon('bot')} Automations`, '/automations', 'selected')}
      ${btn(`${icon('code')} Codebase <small>Early Beta</small>`, 'about')}
    </nav><div class="no-agents">No Agents Yet</div>
    <div class="account">${btn('✧ &nbsp; Upgrade to Pro', 'upgrade', 'outline wide')}
      ${btn('<span class="avatar">L</span><span>Local preview<small>Free</small></span> ⋯', 'about', 'profile')}</div>
  </aside><main>${crumb ? `<div class="breadcrumb" data-evidence="breadcrumb">${link('Automations','/automations')}<span>›</span>${esc(crumb)}</div>` : ''}
    <div class="scroll-pane">${content}</div></main>`;
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
export function list(rows: Automation[], scope: string, query: string, page: number): string {
  const filtered = rows.filter(a => (scope === 'team' || a.scope === 'mine') && a.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a,b) => Number(b.enabled) - Number(a.enabled));
  const count = Math.max(1, Math.ceil(filtered.length / 10)), current = Math.min(page, count);
  const visible = filtered.slice((current - 1) * 10, current * 10);
  return `<div class="page list"><header><div class="title-row"><h1>Automations</h1>${link('New Automation','/automations/new','primary button')}</div>
    <p>Automate repetitive tasks with always-on agents and configure Cursor's built-in agents for your team.</p></header>
    <div class="toolbar">${tabs(scope)}<div class="actions">${link(`All Runs ${icon('arrow')}`,'/automations/runs','button')}
    <input name="list-search" aria-label="Search automations" placeholder="Search..." value="${esc(query)}"></div></div>
    ${listBody(visible, query, filtered.length, current, count)}</div>`;
}
function listBody(rows: Automation[], query: string, total: number, page: number, pages: number): string {
  if (!rows.length) return `<div class="empty card"><h3>${query ? 'No Results Found' : 'No Automations Yet'}</h3>
    ${query ? '' : `<p>Automate repetitive tasks with always-on agents and configure Cursor's built-in agents for your team.</p>
    ${link('New Automation','/automations/new','button outline')}`}</div>`;
  return `<div class="list-table card" role="table" aria-label="Automations"><div class="table-row table-header" role="row">
    ${['Name','Created By','Status','Tools',''].map(v => `<span role="columnheader">${v}</span>`).join('')}</div>
    ${rows.map(a => `<div class="table-row" role="row">${link(`<span role="cell">${esc(a.name)}</span><span role="cell">You</span>
      <span role="cell" class="status ${a.enabled ? 'active' : ''}">${icon(a.enabled ? 'check' : 'close')}${a.enabled ? 'Active' : 'Inactive'}</span>
      <span role="cell">${esc(a.tools.map(t=>t.kind).filter((v,i,s)=>s.indexOf(v)===i).join(', ') || '-')}</span>`,
      `/automations/${a.id}`,'row-link')}<span role="cell">${btn(icon('menu'),`row:${a.id}`,'icon','aria-label="More actions"')}</span></div>`).join('')}</div>
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
export function runs(rows: Run[], scope: string, query: string, status: string, searchOpen: boolean): string {
  const visible = rows.filter(r => (!status || r.status === status) && r.name.toLowerCase().includes(query.toLowerCase()));
  const counts = ([['succeeded',1],['failed',1],['succeeded',7],['failed',7]] as const)
    .map(([s,days]) => rows.filter(r => r.status===s && Date.parse(r.createdAt)>=Date.now()-days*86400000).length);
  return `<div class="page runs"><header data-evidence="runs-header"><h1 data-evidence="runs-title">Run History</h1></header>
    <div class="runs-body"><div class="toolbar" data-evidence="runs-toolbar">${tabs(scope,'run-scope')}
    <div class="actions">${searchOpen ? `<input name="run-search" placeholder="Search runs..." aria-label="Search runs" value="${esc(query)}">` :
      btn(icon('search'),'run-search','icon','aria-label="Search" data-evidence="runs-search"')}
      ${btn(icon('filter'),'filters',`icon ${status?'selected':''}`,'aria-label="Filter runs" data-evidence="runs-filter"')}</div></div>
    <div class="stats" data-evidence="runs-stats">${['Successful · 24h','Failed · 24h','Success 7d','Failed 7d'].map((s,i) =>
      `<div class="stat card" data-evidence="stat-${i}"><div>${s}</div><strong>${counts[i]}</strong></div>`).join('')}</div>
    <div class="runs-table card" data-evidence="runs-card"><div role="table" aria-label="Run history" data-evidence="runs-table">
      ${!visible.length ? `<div class="runs-empty"><h3 data-evidence="runs-empty">${query||status?'No Results Found':'No Runs Yet'}</h3></div>` :
        `<div class="run-row table-header" role="row"><span>Automation</span><span>Status</span><span>Started</span></div>${visible.map(r =>
          `<button class="run-row" data-act="run:${esc(r.id)}"><span>${esc(r.name)}${r.fixture?' · Fixture':''}</span><span class="status ${esc(r.status)}">${esc(r.status)}</span><span>${new Date(r.createdAt).toLocaleString()}</span></button>`).join('')}`}
    </div></div></div></div>`;
}
export const dialog = (title: string, content: string, footer = '') =>
  `<dialog aria-labelledby="dialog-title"><div class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2>
  ${btn(icon('close'),'dismiss','icon','aria-label="Close dialog"')}</div>${content}${footer ? `<footer>${footer}</footer>` : ''}</dialog>`;
