import { esc, icon } from '../automations/view.ts';
import type { Settings } from './schema.ts';
import { settingsSections, titles } from './routes.ts';
import type { SettingsSection } from './routes.ts';
export { titles } from './routes.ts';
export const settingRow = (label: string, control: string): string =>
  `<div class="setting-row"><div class="setting-label">${label}</div><div class="setting-value">${control}</div></div>`;
const input = (label: string, key: string, value: string | number, type = 'text') =>
  settingRow(`<label for="${key}">${label}</label>`, `<input id="${key}" name="${key}" type="${type}" value="${esc(value)}" required>`);
export function liveSettings(s: Settings, selected: SettingsSection | null): string {
  const section = selected ?? 'linear';
  let content = '';
  if (section === 'linear') content = `<div class="card profile-card">${settingRow('Linear', '<span class="email">Requires connection</span>')}${settingRow('', '<button type="button" id="connect-linear" disabled>Connect</button>')}</div>`;
  if (section === 'accounts') content = '<div class="card profile-card" id="identity" aria-live="polite"></div>';
  if (section === 'mcp') content = '<div id="settings-extension" aria-live="polite"></div>';
  if (section === 'general') content = `<form data-preferences="automations" class="card profile-card">${input('Timezone', 'timezone', s.automations.timezone)}${input('Run retention (days)', 'retentionDays', s.automations.retentionDays, 'number')}${input('Maximum concurrent runs', 'concurrency', s.automations.concurrency, 'number')}<footer><button type="submit">Save</button></footer></form>`;
  return `<aside aria-label="Settings sidebar"><header><a href="/chat">‹ Agents</a><button type="button" aria-label="Search" disabled>${icon('search')}</button></header><nav aria-label="Settings sections">${settingsSections.map(name => `<a href="/settings/${name}" ${name === section ? 'aria-current="page"' : ''}>${titles[name]}</a>`).join('')}</nav></aside><main><h1>Settings</h1><section><h2>${titles[section]}</h2>${content}</section></main>`;
}
