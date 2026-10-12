import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriggerController } from '../src/automations/trigger-controller.ts';
import { savedEditorFixture } from '../src/automations/editor-state.ts';
import { cronMenu, triggerMenu } from '../src/automations/trigger-view.ts';
import { validCron } from '../src/automations/model.ts';
function setup(){
  const form=savedEditorFixture();let changes=0,focus=0;
  const anchor={setAttribute:()=>{},focus:()=>{focus++;}} as unknown as HTMLElement;
  const controller=new TriggerController({form:()=>form,render:()=>{},changed:()=>{changes++;},
    closeOther:()=>{},notify:()=>{},fixture:()=>true,overlays:{innerHTML:''} as HTMLElement});
  controller.findAction=()=>anchor;controller.render=()=>{};
  return {controller,form,changes:()=>changes,focus:()=>focus};
}
const key=(key:string)=>({key,preventDefault:()=>{}} as KeyboardEvent);
test('opening and dismissing trigger controls never mutates the disabled fixture',()=>{
  const {controller,form,changes,focus}=setup(),original=structuredClone(form);
  controller.handle('tr-add');controller.handle('tr-provider:Scheduled');
  assert.equal(controller.panel,'scheduled-submenu');
  controller.key(key('Escape'));assert.equal(controller.panel,'add-trigger');
  controller.key(key('Escape'));assert.equal(controller.captureState(),'trigger-dismissed');
  controller.handle('tr-cron:annual');controller.value='0 1 * * *';controller.key(key('Escape'));
  assert.deepEqual(form,original);assert.equal(changes(),0);assert.ok(focus()>0);
});
test('valid cron edits and preset choices change only the local draft',()=>{
  const {controller,form,changes}=setup();
  controller.handle('tr-cron:annual');controller.value='bad';controller.commit();
  assert.equal(changes(),0);assert.ok(controller.error);
  controller.value='@daily';controller.commit();
  assert.equal(form.triggers[0]?.value,'@daily');assert.equal(form.enabled,false);
  controller.addPreset(1);assert.equal(form.triggers.length,2);assert.equal(form.enabled,false);
  assert.equal(changes(),2);controller.handle('tr-provider:Slack');assert.equal(changes(),2);
});
test('local cron grammar is bounded and never schedules work',()=>{
  for(const s of ['@daily','@hourly','0 0 9 * * 1','0 0 9 * * 1 2027'])assert.equal(validCron(s),true,s);
  for(const s of ['@reboot','60 0 9 * * 1','0 0 9 * * 1 10000','0 9 * * MON','* * * * * * * *'])assert.equal(validCron(s),false,s);
});
test('trigger views retain captured choices, filtering, copy and safe escaping',()=>{
  const html=triggerMenu('',true);
  for(const name of ['Scheduled','Microsoft Teams','Sentry','Linear','Webhook Triggered','PagerDuty','Custom (cron)'])assert.ok(html.includes(name));
  assert.ok(!triggerMenu('linear',false).includes('data-act="tr-provider:Scheduled"'));
  assert.match(triggerMenu('<script>',false),/No triggers found/);
  assert.doesNotMatch(cronMenu('"><script>',"",false),/<script>/);
  assert.match(cronMenu('0 0 1 1 *','',true),/5-7 fields or @daily\/@hourly/);
  assert.match(cronMenu('0 9 * * *','',false),/Local preview unavailable/);
});
