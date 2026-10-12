import { mountMcp } from '../mcp/settings-ui.ts';
import { mountLinear } from './linear-ui.ts';
import { liveSettings } from './live-view.ts';
import { settingsSection } from './routes.ts';
import type { Settings } from './schema.ts';
const root = document.querySelector<HTMLElement>('#settings-app')!;
const notice = document.querySelector<HTMLElement>('#settings-notice')!;
let state: Settings, busy = false;
export async function settingsApi<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json', 'X-Local-Request': '1' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
  const result = await response.json();
  if (!response.ok) throw Error(result.error ?? result.message ?? 'Request failed.');
  return result as T;
}
function render() {
  const section = settingsSection(location.pathname);
  root.innerHTML = liveSettings(state, section);
  mountLinear(root, state.integrations.linearEnabled, async requested => {
    state = await settingsApi<Settings>('/api/settings', 'PATCH', { section: 'integrations', values: { linearEnabled: requested }, revision: state.revision });
    render();
    notice.textContent = requested ? 'Connection request saved.' : 'Connection request cancelled.';
  });
  const identity = root.querySelector<HTMLElement>('#identity');
  if (identity) void showIdentity(identity).catch(error => { identity.textContent = error.message; });
  const extension = root.querySelector<HTMLElement>('#settings-extension');
  if (extension) void mountMcp(extension, settingsApi, new URLSearchParams(location.search).get('automation') ?? '')
    .catch(error => { extension.textContent = error.message; });
}
async function showIdentity(target: HTMLElement) {
  const status = await settingsApi<{ identity: { email: string; id: string } | null }>('/api/auth/status');
  if (!status.identity) { location.assign('/login'); return; }
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Account</th><th>Status</th></tr></thead><tbody><tr><td></td><td>Signed in</td></tr></tbody>';
  table.querySelector('td')!.textContent = status.identity.email;
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = 'Sign out';
  button.onclick = () => {
    button.disabled = true;
    void settingsApi('/api/auth/logout', 'POST', {}).then(() => location.assign('/login'))
      .catch(error => { notice.textContent = error.message; button.disabled = false; });
  };
  target.replaceChildren(table, button);
}
root.addEventListener('submit', event => {
  const form = event.target as HTMLFormElement, section = form.dataset.preferences;
  if (!section) return;
  event.preventDefault(); if (busy) return;
  const values: Record<string, unknown> = Object.fromEntries(new FormData(form));
  for (const el of form.querySelectorAll<HTMLInputElement>('input[type=checkbox]')) values[el.name] = el.checked;
  if (section === 'mcp') values.allowedHosts = String(values.allowedHosts).split(',').map(v => v.trim()).filter(Boolean);
  if (section === 'automations') { values.retentionDays = Number(values.retentionDays); values.concurrency = Number(values.concurrency); }
  busy = true; notice.textContent = 'Saving…';
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!; button.disabled = true;
  void settingsApi<Settings>('/api/settings', 'PATCH', { section, values, revision: state.revision })
    .then(result => { state = result; notice.textContent = 'Changes saved.'; })
    .catch(error => { notice.textContent = error.message; })
    .finally(() => { busy = false; button.disabled = false; });
});
void settingsApi<Settings>('/api/settings').then(result => { state = result; render(); })
  .catch(error => { notice.textContent = error.message; });
