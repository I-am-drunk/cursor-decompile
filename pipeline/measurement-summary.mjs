// Sum only comparisons reproduced against the current build, never prose totals.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compare } from './compare-ui.mjs';
import { buildHash } from '../src/server.ts';
const names=['ui','row','editor','trigger','preset','connection','closure'];
const facts=(await Promise.all(names.map(n=>readFile(`src/automations/${n}-facts.json`,'utf8').then(JSON.parse)))).flat();
facts.push(...JSON.parse(await readFile('src/settings/ui-facts.json','utf8')));
const states=['upgrade','runs',...new Set(facts.filter(f=>f.captureState&&(f.source?.element!==undefined||f.attribute||f.inputValue||f.attributePresent)).map(f=>f.captureState))];
const hash=await buildHash(), totals={baseline:0,filters:0,settings:0};
for(const state of states){
  const actual=JSON.parse(await readFile(`artifacts/${state}-measurements.json`,'utf8'));
  assert.equal(actual.buildHash,hash,`${state}: stale snapshot`);
  const result=compare(facts,actual);assert.deepEqual(result.mismatches,[],state);
  const group=state.startsWith('settings-')?'settings':state.startsWith('runs-')?'filters':'baseline';
  totals[group]+=result.checks;
}
assert.deepEqual(totals,{baseline:2157,filters:521,settings:998},'Measured-subset counts changed: review the per-state evidence before updating');
console.log(JSON.stringify({states:states.length,checks:Object.values(totals).reduce((a,b)=>a+b,0),groups:totals}));
