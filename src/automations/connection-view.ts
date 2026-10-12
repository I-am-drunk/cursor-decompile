import { btn, esc, icon } from './view.ts';
import type { Trigger } from './model.ts';
export const linearEvents=['Issue created','Status changed','End of cycle'] as const;
export const connectionWarning='One or more triggers require additional authentication to be used';
export function linearMenus(issues=false):string {
  return `<div class="tr-pop lc-linear-menu" role="menu" aria-label="Linear" data-evidence="lc-menu">
    ${btn('<span data-evidence="lc-issue-label">Issue...</span><span class="lc-chevron">›</span>','lc-issues','','role="menuitem" aria-haspopup="menu" data-evidence="lc-issue"')}
    ${btn('<span data-evidence="lc-cycle-label">End of cycle</span>','lc-add:2','','role="menuitem" data-evidence="lc-cycle"')}</div>`+
    (issues?`<div class="tr-pop lc-issues" role="menu" aria-label="Linear issue" data-evidence="lc-issues">
      ${btn('<span data-evidence="lc-created-label">Created</span>','lc-add:0','','role="menuitem" data-evidence="lc-created"')}
      ${btn('<span data-evidence="lc-status-label">Status changed</span>','lc-add:1','','role="menuitem" data-evidence="lc-status"')}</div>`:'');
}
export function linearRow(t:Trigger):string {
  const index=linearEvents.indexOf(t.event as typeof linearEvents[number]);
  return `<div class="ed-trigger-row tr-row lc-row" data-linear="${index}" data-evidence="lc-row">
    <span class="tr-clock" aria-hidden="true">◈</span><div class="ed-trigger-main">
      <span data-evidence="lc-name">${esc(t.event)}</span><span class="muted" data-evidence="lc-required">Requires connection</span></div>
    <div class="lc-actions">${btn(icon('close'),`remove-trigger:${t.id}`,'icon','aria-label="Remove trigger"')}
      ${btn(`Connect ${icon('arrow')}`,'lc-connect','lc-connect','data-evidence="lc-connect"')}</div></div>`;
}
export function linearPlugin(description:string,expanded=false):string {
  return `<dialog class="lc-plugin" aria-labelledby="lc-plugin-heading"
    aria-description="Captured reference metadata. Installation and authorization are not connected in this local implementation." data-evidence="lp-dialog">
    <h2 id="lc-plugin-heading" class="lc-sr-only">Browse MCPs</h2>
    <div class="lc-plugin-header" data-evidence="lp-header"><span class="lc-logo" aria-hidden="true">◈</span>
      <div class="lc-plugin-meta"><p data-evidence="lp-name">Linear</p>
      <p data-evidence="lp-publisher">Linear · <span>♧ Verified by Cursor</span></p></div></div>
    <div class="lc-description ${expanded?'expanded':''}" data-evidence="lp-description">
      <span data-evidence="lp-description-text">${esc(description)}</span>
      ${expanded?'':btn('Show More','ed-linear-more','','data-evidence="lp-more"')}</div>
    <footer data-evidence="lp-footer">${btn('Back','ed-linear-back','','data-evidence="lp-back"')}
      ${btn('Add Plugin <span class="lc-shortcut">⌘⏎</span>','ed-linear-add','lc-plugin-add','data-evidence="lp-add"')}</footer></dialog>`;
}
