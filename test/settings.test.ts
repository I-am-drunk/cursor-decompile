import { test } from 'node:test';
import assert from 'node:assert/strict';
import { liveSettings } from '../src/settings/live-view.ts';
import { defaultSettings } from '../src/settings/schema.ts';
import { settingsSections, isSettingsRoute, titles } from '../src/settings/routes.ts';
import { linearAccounts } from '../src/settings/linear-ui.ts';
import { createApp } from '../src/server.ts';
import { Store } from '../src/store.ts';
import { signIn } from './http-helper.ts';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('settings index and navigation expose exactly the four product sections', () => {
  assert.deepEqual(Object.values(titles), ['Linear connection', 'MCP connectors', 'Accounts', 'General']);
  const index = liveSettings(defaultSettings(), null);
  assert.equal((index.match(/class="card index-section"/g) ?? []).length, 4);
  for (const section of settingsSections) {
    const html = liveSettings(defaultSettings(), section);
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
    assert.match(html, new RegExp(`<h1>${titles[section]}</h1>`));
    for (const [, href] of html.matchAll(/href="([^"]+)"/g))
      assert.ok(href === '/automations' || isSettingsRoute(href!));
    assert.doesNotMatch(html, /Upgrade|Billing|Spending|Privacy Mode|Desktop|Inference/);
  }
  const settings = defaultSettings(); settings.account.displayName = '<script>alert(1)</script>';
  assert.doesNotMatch(liveSettings(settings, 'general'), /<script>/);
  assert.match(linearAccounts(), /No Linear accounts connected/);
});

test('settings pages and browser module graph resolve; removed routes and assets return 404', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'settings-routes-'));
  const server = createApp(new Store(join(dir, 'state.json')));
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  t.after(async () => { await new Promise<void>(r => server.close(() => r())); await rm(dir, { recursive: true, force: true }); });
  const addr = server.address(); assert.ok(addr && typeof addr !== 'string');
  const base = `http://127.0.0.1:${addr.port}`, send = await signIn(base);
  for (const path of ['/settings', ...settingsSections.map(s => `/settings/${s}`)]) {
    const response = await send(path); assert.equal(response.status, 200);
    assert.match(await response.text(), /settings\/live-app.ts/);
  }
  const visited = new Set<string>();
  async function module(path: string): Promise<void> {
    if (visited.has(path)) return; visited.add(path);
    const response = await send(path); assert.equal(response.status, 200, path);
    const source = await response.text();
    for (const [, relative] of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g))
      await module(new URL(relative!, base + path).pathname);
  }
  await module('/settings/live-app.ts');
  for (const path of ['/dashboard', '/dashboard/settings', '/dashboard/integrations', '/dashboard/spending', '/settings/inference', '/settings/integrations', '/settings/account', '/settings/automations', '/settings/unknown', '/settings-app.ts', '/settings-view.ts', '/inference/settings-ui.ts'])
    assert.equal((await send(path)).status, 404, path);
});
