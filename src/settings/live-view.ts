import { esc } from '../automations/view.ts';
import type { Settings } from './schema.ts';
import { settingsSections, titles } from './routes.ts';
import type { SettingsSection } from './routes.ts';
export { titles } from './routes.ts';
const input = (label: string, key: string, value: string | number, type = 'text') =>
  `<label class="setting-row"><span>${label}</span><input name="${key}" type="${type}" value="${esc(value)}" required></label>`;
const descriptions: Record<SettingsSection, string> = {
  linear: 'Connect the Linear accounts that run your automations.',
  mcp: 'Manage the tools available to your automations.',
  accounts: 'View your accounts and manage this session.',
  general: 'Set your display name and automation defaults.',
};
export function liveSettings(s: Settings, section: SettingsSection | null): string {
  let content = '';
  if (section === null) content = `<div class="settings-index">${settingsSections.map(name =>
    `<a class="card index-section" href="/settings/${name}"><h2>${titles[name]}</h2><p>${descriptions[name]}</p><span aria-hidden="true">›</span></a>`).join('')}</div>`;
  if (section === 'linear') content = `<section class="card live-settings"><h2>Connect Linear</h2><p>Use your Linear account to run automations and access connected tools.</p><button type="button" id="connect-linear">Connect Linear</button><div id="linear-connect"></div></section><section class="card live-settings"><h2>Connected accounts</h2><div id="linear-accounts" aria-live="polite">Loading accounts…</div></section>`;
  if (section === 'accounts') content = `<section class="card live-settings"><h2>Linear accounts</h2><div id="linear-accounts" aria-live="polite">Loading accounts…</div><a class="button-link" href="/settings/linear">Connect an account</a></section><section class="card live-settings"><h2>Current session</h2><div id="identity" aria-live="polite">Loading session…</div></section>`;
  if (section === 'mcp') content = `<div id="settings-extension" aria-live="polite">Loading connectors…</div><details class="card live-settings"><summary>Connection permissions</summary><form data-preferences="mcp"><label class="setting-row"><span>Allow local commands</span><input name="allowStdio" type="checkbox" ${s.mcp.allowStdio ? 'checked' : ''}></label>${input('Allowed destination hosts (comma separated)', 'allowedHosts', s.mcp.allowedHosts.join(', ')).replace(' required', '')}<p>Allow only hosts and local commands you trust.</p><footer><button type="submit">Save permissions</button></footer></form></details>`;
  if (section === 'general') content = `<form data-preferences="account" class="card live-settings"><h2>Profile</h2>${input('Display name', 'displayName', s.account.displayName)}<footer><button type="submit">Save profile</button></footer></form><form data-preferences="automations" class="card live-settings"><h2>Automation defaults</h2>${input('Timezone', 'timezone', s.automations.timezone)}${input('Run retention (days)', 'retentionDays', s.automations.retentionDays, 'number')}${input('Maximum concurrent runs', 'concurrency', s.automations.concurrency, 'number')}<p>These defaults are saved for the automation service. Scheduling and retention are not active yet.</p><footer><button type="submit">Save defaults</button></footer></form>`;
  return `<aside aria-label="Settings sidebar"><header><a href="/automations">‹ Automations</a></header><nav aria-label="Settings sections">${settingsSections.map(name => `<a href="/settings/${name}" ${name === section ? 'aria-current="page"' : ''}>${titles[name]}</a>`).join('')}</nav></aside><main><h1>${section ? titles[section] : 'Settings'}</h1>${content}</main>`;
}
