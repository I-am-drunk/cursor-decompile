import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { shell } from '../src/automations/view.ts';
test('automation shell keeps visible icons and only product destinations', () => {
  const html=shell('');
  assert.match(html,/aria-label="Automations"/);
  assert.equal((html.match(/class="rail-icon"/g)||[]).length,1);
  assert.doesNotMatch(html,/Codebase|Workspace|Run History|Settings|Accounts|Local preview|href="\/search"/);
});
test('shell facts pin redacted capture measurements and disclose unmeasured timing',async()=>{
  const facts=JSON.parse(await readFile('src/shell/ui-facts.json','utf8'));
  for(const f of facts){assert.equal(createHash('sha256').update(await readFile(f.source.path)).digest('hex'),f.source.sha256);assert.ok(f.viewport);}
  assert.ok(facts.some((f:{label:string;property:string})=>f.label==='UNVERIFIED'&&f.property.includes('duration')));
  const css=await readFile('src/shell/sidebar.css','utf8');
  assert.match(css,/position:absolute/);assert.doesNotMatch(css,/transition:|animation:|rail-revealed|drag-hover/);

});
