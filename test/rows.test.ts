import { test } from 'node:test';
import assert from 'node:assert/strict';
import { referenceRun, referenceAutomation, referenceTime, runTime, runDuration } from '../src/automations/row-data.ts';
import { list, runs, runSummary } from '../src/automations/view.ts';
test('observed failed-run fixture is explicit, stable and has no live IDs',()=>{
  const r=referenceRun(); assert.equal(r.fixture,true);
  assert.equal(r.status,'failed'); assert.equal(r.testRun,true);
  assert.equal(r.failure?.code,'CLOUD_AGENT_PLAN_RESTRICTED');
  assert.equal(r.automationId,referenceAutomation().id);
  assert.equal(runDuration(r),'< 1m');
  assert.match(runTime(r.createdAt,true,'en-CA','America/Toronto'),/2026.*3:38/);
  assert.equal(runDuration({...r,completedAt:'invalid'}),'—');
  assert.equal(runTime('invalid'),'—');
});
test('run table matches the observed column order, row activation and action separation',()=>{
  const html=runs([referenceRun()],'team','','',false,{'composer-2.5':'Composer 2.5'},referenceTime);
  const names=['Automation','Model','Triggered','Tools','Status','Duration'];
  const positions=names.map(name=>html.indexOf(`<span>${name}</span>`));
  assert.ok(positions.every((p,i)=>p>=0 && (!i || p>positions[i-1]!)));
  assert.match(html,/role="row" tabindex="0"/);
  assert.match(html,/data-act="run:observed-failure"/);
  assert.match(html,/data-act="run-menu:observed-failure"/);
  assert.match(html,/Composer 2.5/); assert.match(html,/&lt; 1m/);
  assert.match(html,/Reference-derived or synthetic fixture/);
});
test('summary shows the real failure structure without inventing successful output',()=>{
  const html=runSummary(referenceRun());
  for (const copy of ['Run summary','Trigger','Test run','Cloud Agents require a paid plan','View Automation']) assert.ok(html.includes(copy));
  assert.match(html,/data-act="view-automation:evidence-automation"/);
  assert.doesNotMatch(html,/<pre>/);
  const hostile={...referenceRun(),failure:{code:'other',title:'<script>bad</script>',message:'"><img src=x>',ctaLabel:'Retry'}};
  assert.doesNotMatch(runSummary(hostile),/<script>|<img|cursor.com\/pricing/);
});
test('extracted automation rows include model before creator and searchable owner metadata',()=>{
  const a=referenceAutomation();
  const html=list([a],'mine','example owner',1,{'composer-2.5':'Composer 2.5'});
  assert.ok(html.indexOf('>Model<')<html.indexOf('>Created By<'));
  assert.match(html,/Composer 2.5/);assert.match(html,/Example owner/);
  assert.doesNotMatch(html,/No Results Found/);
  assert.match(html,/href="\/automations\/evidence-automation"/);
});
