import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRunStatuses, toggleRunStatus } from '../src/automations/run-filter-state.ts';
import { runFilterMenu } from '../src/automations/run-filter-view.ts';
import { runs } from '../src/automations/view.ts';
import { referenceRun, referenceTime } from '../src/automations/row-data.ts';
test('status filters accept only supported distinct values and toggle independently',()=>{
  assert.deepEqual(parseRunStatuses('running,unknown,running,failed'),['running','failed']);
  assert.deepEqual(toggleRunStatus('running','failed'),['running','failed']);
  assert.deepEqual(toggleRunStatus('running,failed','running'),['failed']);
  assert.deepEqual(toggleRunStatus('running','unknown'),['running']);
});
test('status submenu has four accessible checkboxes and safe unavailable categories',()=>{
  const html=runFilterMenu('running,failed',true);
  assert.equal((html.match(/role="menuitemcheckbox"/g)||[]).length,4);
  assert.equal((html.match(/aria-checked="true"/g)||[]).length,2);
  assert.match(html,/2 statuses/);assert.match(html,/Clear status filters/);
  assert.doesNotMatch(html,/https?:|fetch\(|onclick=/);
});
test('filter selection changes rows and statistics, clear restores the failure',()=>{
  const render=(status:string)=>runs([referenceRun()],'team','',status,false,{},referenceTime);
  assert.match(render('running'),/No Results/);assert.match(render('running'),/Try different filters/);
  assert.doesNotMatch(render('running'),/data-evidence="rw-row"/);
  assert.match(render('running,failed'),/data-evidence="rw-row"/);
  assert.match(render(''),/data-evidence="rw-row"/);
  assert.match(render('running'),/rf-count-1">0</);
  assert.match(render('running,failed'),/rf-count-1">1</);
});
