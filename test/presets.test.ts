import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cronFieldError, makePreset } from '../src/automations/preset-state.ts';
import { parseAutomation, validCron } from '../src/automations/model.ts';
import { savedEditorFixture } from '../src/automations/editor-state.ts';
import { TriggerController } from '../src/automations/trigger-controller.ts';
import { presetMenu, presetRow, validatedCronMenu, unsavedDialog } from '../src/automations/preset-view.ts';
test('preset metadata is scoped, validated and preserved without enabling a definition',()=>{
  const a=savedEditorFixture(),original=structuredClone(a.triggers[0]);
  for(let i=0;i<4;i++)a.triggers.push(makePreset(i)!);
  assert.equal(parseAutomation(a).enabled,false);assert.deepEqual(a.triggers[0],original);
  assert.equal(a.triggers[4]?.value,'0 13 1 * *');
  a.triggers[1]!.schedule!.time='25:00';assert.throws(()=>parseAutomation(a),/metadata/);
});
test('observed field errors remain distinct from local numeric range validation',()=>{
  assert.equal(cronFieldError(''),'Cron expression is required');
  assert.equal(cronFieldError('bad'),'Expected 5-7 fields (min hour day month weekday), got 1');
  assert.equal(cronFieldError('60 0 * * *'),'');assert.equal(validCron('60 0 * * *'),false);
  assert.match(validatedCronMenu('60 0 * * *',true),/No upcoming runs to preview/);
  assert.match(validatedCronMenu('bad',true),/aria-invalid="true"/);
});
function controller(){
  const a=savedEditorFixture();
  const c=new TriggerController({form:()=>a,render:()=>{},changed:()=>{},closeOther:()=>{},
    notify:()=>{},fixture:()=>true,overlays:{innerHTML:'',contains:()=>false} as unknown as HTMLElement});
  const anchor={setAttribute:()=>{},focus:()=>{},contains:()=>false,dataset:{}} as unknown as HTMLElement;
  c.findAction=()=>anchor;c.render=()=>{};return {a,c};
}
test('invalid input blocks Escape/outside dismissal until corrected',()=>{
  const {a,c}=controller();c.addPreset(3);const t=a.triggers.at(-1)!;
  c.handle(`tr-cron:${t.id}`);c.value='';
  c.key({key:'Escape',preventDefault:()=>{}} as KeyboardEvent);
  assert.equal(c.panel,'schedule-picker');assert.equal(c.capturePresetState(),'invalid-escape');
  c.pointer({} as Node);assert.equal(c.capturePresetState(),'invalid-outside');
  c.value='0 13 1 * *';c.attempt='';c.key({key:'Escape',preventDefault:()=>{}} as KeyboardEvent);
  assert.equal(c.panel,'');assert.equal(a.enabled,false);assert.equal(t.value,'0 13 1 * *');
});
test('time/day choices update only their local preset and retain disabled state',()=>{
  const {a,c}=controller();c.addPreset(2);c.triggerId=a.triggers.at(-1)!.id;
  c.choose('day',2);c.choose('time',10);
  assert.equal(a.triggers.at(-1)?.schedule?.day,2);
  assert.equal(a.triggers.at(-1)?.schedule?.time,'10:00');
  assert.equal(a.triggers[0]?.value,'0 0 1 1 *');assert.equal(a.enabled,false);
});
test('preset and safeguard views expose captured controls without unsafe interpolation',()=>{
  assert.equal((presetMenu('time').match(/role="menuitem"/g)||[]).length,24);
  assert.equal((presetMenu('day').match(/role="menuitem"/g)||[]).length,7);
  const t=makePreset(3)!;t.value='<script>bad</script>';
  assert.doesNotMatch(presetRow(t,true),/<script>/);
  assert.doesNotMatch(validatedCronMenu(t.value,true),/<script>/);
  const html=unsavedDialog();assert.ok(html.indexOf('Discard')<html.indexOf('Keep Editing'));
});
