import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { settingsPages, settingsShell, accountPanel, overviewPanel, settingsUserMenu } from '../src/settings/settings-view.ts';
test('settings navigation retains observed order, destinations and one selected page',()=>{
  assert.deepEqual(settingsPages.map(p=>p[0]),['Overview','Settings','Integrations','Spending']);
  for(const [,path] of settingsPages){const html=settingsShell(path);
    assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
    assert.match(html,new RegExp('href="'+path+'"[^>]+aria-current="page"'));
  }
  assert.match(settingsShell('/dashboard/integrations'),/UNVERIFIED panel/);
  assert.doesNotMatch(settingsShell('/dashboard/<script>'),/<script>/);
});
test('account preview cannot edit, save, activate privacy or upload',()=>{
  const html=accountPanel();assert.equal((html.match(/ readonly/g)||[]).length,3);
  assert.match(html,/role="switch"[^>]+aria-checked="false"/);
  assert.match(html,/disabled aria-disabled="true"/);
  assert.doesNotMatch(html,/<form|type="file"|https?:|onclick=/);
  assert.match(html,/local@example.invalid/);
  assert.match(html,/Read-only local preview/);
});
test('settings account actions and overview are explicitly local previews',async()=>{
  assert.match(overviewPanel(),/not live usage or a purchase offer/);
  assert.doesNotMatch(settingsUserMenu(),/href=|https?:/);
  const code=await readFile(new URL('../src/settings/settings-app.ts',import.meta.url),'utf8');
  assert.equal((code.match(/fetch\(/g)||[]).length,1);
  assert.match(code,/fetch\('\/api\/build'\)/);
  assert.doesNotMatch(code,/localStorage|sessionStorage|method:|XMLHttpRequest|sendBeacon/);
});
