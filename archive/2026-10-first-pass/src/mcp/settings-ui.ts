import { esc } from '../automations/view.ts';
import { mcpForm } from '../automations/editor-view.ts';
import { blankMcp, parseMcp, serializeMcp, validateMcp } from '../automations/editor-state.ts';
import { settingRow } from '../settings/live-view.ts';
import type { McpServer } from './registry.ts';
type Api = <T>(path: string, method?: string, data?: unknown) => Promise<T>;

export async function mountMcp(root: HTMLElement, api: Api) {
  const servers = await api<McpServer[]>('/api/mcp-servers');
  root.innerHTML = `<div class="card profile-card">${servers.length
    ? servers.map(server => settingRow(esc(server.name), '')).join('')
    : settingRow('No MCP servers configured', '')}<footer><button type="button" id="new-connection">New Connection</button></footer></div>`;
  root.querySelector<HTMLButtonElement>('#new-connection')!.onclick = () => {
    let config = blankMcp(), json = false, text = '', error = '', saving = false;
    const host = document.createElement('div'); root.append(host);
    const close = () => { host.querySelector('dialog')?.close(); host.remove(); root.querySelector<HTMLButtonElement>('#new-connection')?.focus(); };
    const read = () => {
      const form = host.querySelector<HTMLFormElement>('form')!;
      if (json) { text = String(new FormData(form).get('mcp-json') ?? ''); config = parseMcp(text); return; }
      const data = new FormData(form), value = (name: string) => String(data.get(name) ?? '');
      const pairs = (kind: string) => Object.fromEntries([...data].filter(([key, value]) => key.startsWith(`${kind}-key-`) && value).map(([key, name]) => [String(name), value(key.replace('-key-', '-value-'))]));
      config = { ...config, name: value('mcp-name'), url: value('mcp-url'), command: value('mcp-command'),
        args: [...data].filter(([key, value]) => key.startsWith('arg-') && value).map(([, value]) => String(value)), headers: pairs('headers'), env: pairs('env') };
    };
    const draw = () => {
      host.querySelector('dialog')?.close();
      host.innerHTML = mcpForm(config, json, text, error);
      const dialog = host.querySelector('dialog')!;
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.querySelector('form')!.onsubmit = event => { event.preventDefault(); void commit(); };
      dialog.showModal();
    };
    const commit = async () => {
      if (saving) return;
      try {
        read(); validateMcp(config);
        const headers = Object.entries(config.headers);
        if (headers.length > 1) throw Error('This registry supports one header per connection.');
        saving = true;
        host.querySelector<HTMLButtonElement>('[data-act="ed-commit-mcp"]')!.disabled = true;
        await api('/api/mcp-servers', 'POST', {
          name: config.name, transport: config.type === 'url' ? 'http' : 'stdio', url: config.url,
          command: config.command, args: config.args, env: config.env, scope: 'user', enabled: true,
          auth: headers.length ? 'header' : 'none', headerName: headers[0]?.[0] ?? 'Authorization', credential: headers[0]?.[1] ?? '',
        });
        close(); await mountMcp(root, api);
      } catch (e) { error = (e as Error).message; draw(); }
      finally { saving = false; }
    };
    host.onclick = event => {
      const action = (event.target as Element).closest<HTMLElement>('[data-act]')?.dataset.act;
      if (!action || saving) return;
      if (action === 'ed-close') { close(); return; }
      if (action === 'ed-commit-mcp') { void commit(); return; }
      try {
        read(); error = '';
        if (action === 'ed-mcp-json') { json = !json; text = serializeMcp(config); }
        if (action.startsWith('ed-mcp-type:')) config.type = action.endsWith(':url') ? 'url' : 'command';
      } catch (e) { error = (e as Error).message; }
      draw();
    };
    draw();
  };
}
