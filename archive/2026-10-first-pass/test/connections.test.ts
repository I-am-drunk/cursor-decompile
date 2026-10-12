import { test } from 'node:test';
import assert from 'node:assert/strict';
import { savedEditorFixture } from '../src/automations/editor-state.ts';
import { TriggerController } from '../src/automations/trigger-controller.ts';
import { EditorController } from '../src/automations/editor-controller.ts';
import { linearEvents, linearMenus, linearPlugin, linearRow } from '../src/automations/connection-view.ts';
import { browseMcp } from '../src/automations/editor-view.ts';
test('Linear menus navigate nested levels and add disabled local definitions only',()=>{
  const a=savedEditorFixture(),notes:string[]=[];
  const c=new TriggerController({form:()=>a,render:()=>{},changed:()=>{},closeOther:()=>{},
    notify:m=>{notes.push(m);},fixture:()=>true,overlays:{innerHTML:''} as HTMLElement});
  c.render=()=>{};c.findAction=()=>({focus:()=>{}} as HTMLElement);
  c.handle('tr-provider:Linear');assert.equal(c.panel,'linear-menu');
  c.handle('lc-issues');assert.equal(c.panel,'linear-issue-menu');
  c.key({key:'Escape',preventDefault:()=>{}} as KeyboardEvent);
  assert.equal(c.panel,'linear-menu');
  c.key({key:'Escape',preventDefault:()=>{}} as KeyboardEvent);
  assert.equal(c.panel,'add-trigger');
  for(let i=0;i<3;i++)c.addLinear(i);
  assert.deepEqual(a.triggers.slice(1).map(t=>t.event),[...linearEvents]);
  assert.equal(a.enabled,false);const before=structuredClone(a);
  c.handle('lc-connect');assert.deepEqual(a,before);assert.match(notes[0]!,/No authorization/);
});
test('Linear MCP disclosure retains search and never installs or authorizes',async()=>{
  const a=savedEditorFixture();let calls=0;const notes:string[]=[];
  const c=new EditorController({form:()=>a,render:()=>{},changed:()=>{},closeOther:()=>{},
    notify:m=>{notes.push(m);},overlays:{innerHTML:''} as HTMLElement,
    api:async()=>{calls++;throw Error('Unexpected request');}});
  c.providers=[{id:'linear',name:'Linear',description:'Reference metadata'}];
  c.query='Linear';c.render=()=>{};
  await c.handle('ed-provider:linear');assert.equal(c.panel,'linear-plugin');
  await c.handle('ed-linear-more');assert.equal(c.linearExpanded,true);
  await c.handle('ed-linear-add');assert.equal(calls,0);assert.equal(a.tools.length,0);
  assert.match(notes[0]!,/No changes/);
  await c.handle('ed-linear-back');assert.equal(c.panel,'browse');assert.equal(c.query,'Linear');
  assert.equal(c.captureConnectionState(),'mcp-returned');
});
test('unconnected views preserve captured copy without trusting provider HTML',()=>{
  const menus=linearMenus(true);
  for(const text of ['Issue...','Created','Status changed','End of cycle'])assert.ok(menus.includes(text));
  const row=linearRow({id:'local',kind:'Linear',event:'Issue created',value:''});
  assert.match(row,/Requires connection/);assert.match(row,/lc-connect/);
  const panel=linearPlugin('<script>bad</script>');
  assert.doesNotMatch(panel,/<script>/);assert.match(panel,/Add Plugin/);
  assert.match(panel,/not connected in this local implementation/);
  assert.doesNotMatch(linearPlugin('Description',true),/Show More/);
  const browse=browseMcp([{id:'linear',name:'Linear',description:'Tools'}],'Linear');
  assert.match(browse,/ed-browse short/);assert.match(browse,/data-evidence="lc-provider"/);
});
