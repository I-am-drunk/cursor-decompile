import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { shell, list } from '../src/automations/view.ts';
test('automation shell keeps visible icons and only product destinations', () => {
  const html=shell('');
  for(const label of ['Automations','Run History','Settings','Accounts']) assert.ok(html.includes(`aria-label="${label}"`));
  assert.equal((html.match(/class="rail-icon"/g)||[]).length,5);
  assert.doesNotMatch(html+list([],'mine','',1),/Codebase|Cursor|New chat|href="\/search"/);
  assert.match(html,/href="\/settings"/);
});
test('shell facts pin redacted capture measurements and disclose unmeasured timing',async()=>{
  const facts=JSON.parse(await readFile('src/shell/ui-facts.json','utf8'));
  for(const f of facts){assert.equal(createHash('sha256').update(await readFile(f.source.path)).digest('hex'),f.source.sha256);assert.ok(f.viewport);}
  assert.ok(facts.some((f:{label:string;property:string})=>f.label==='UNVERIFIED'&&f.property.includes('duration')));
  const css=await readFile('src/shell/sidebar.css','utf8');
  assert.match(css,/position:absolute/);assert.match(css,/prefers-reduced-motion/);
  assert.doesNotMatch(css,/display:none/);
});
