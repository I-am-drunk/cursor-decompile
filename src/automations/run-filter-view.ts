import { btn, icon } from './view.ts';
import { parseRunStatuses, runStatuses, statusLabel } from './run-filter-state.ts';
export function runFilterMenu(value:string,submenu:boolean):string {
  const selected=parseRunStatuses(value);
  const summary=selected.length>1?`${selected.length} statuses`:selected.length?statusLabel(selected[0]!):'';
  return `<div class="rf-pop rf-root" role="menu" aria-label="Filter by" tabindex="-1" data-evidence="rf-menu">
    <h3><span data-evidence="rf-title">Filter by</span></h3>
    ${['Automation','Status','Trigger','Tools'].map(label=>btn(
      `<span>${label}</span>${label==='Status'&&summary?`<small>${summary}</small>`:''}<span class="rf-chevron">›</span>`,
      label==='Status'?'rf-status':'rf-unverified','','role="menuitem"'+(label==='Status'?` aria-haspopup="menu" aria-expanded="${submenu}" data-evidence="rf-status"`:''))).join('')}
    ${selected.length?`<hr>${btn(`${icon('close')}<span>Clear all filters</span>`,'rf-clear','','role="menuitem" data-evidence="rf-clear"')}`:''}</div>`+
    (submenu?`<div class="rf-pop rf-status-menu" role="menu" aria-label="Status" data-evidence="rf-submenu">
      ${runStatuses.map(s=>btn(`<span class="rf-symbol ${s}">${statusIcon(s)}</span><span class="rf-label" data-evidence="rf-label-${s}">${statusLabel(s)}</span><span class="rf-tick">${selected.includes(s)?'✓':''}</span>`,
        `rf-toggle:${s}`,'',`role="menuitemcheckbox" aria-checked="${selected.includes(s)}" data-evidence="rf-${s}"`)).join('')}
      ${selected.length?btn('Clear status filters','rf-clear','','role="menuitem" data-evidence="rf-clear-status"'):''}</div>`:'');
}

function statusIcon(status:string):string {
  const mark=status==='running'?'<path d="M7 3v4H4"/>':status==='failed'?'<path d="M7 3.5v4M7 9.5v1"/>':status==='succeeded'?'<path d="m4 7 2 2 4-4"/>':'<path d="m2 2 5 5-5 5m5-10 5 5-5 5"/>';
  return `<svg viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.2">${status==='skipped'?'':'<circle cx="7" cy="7" r="5.5"/>'}${mark}</svg>`;
}
