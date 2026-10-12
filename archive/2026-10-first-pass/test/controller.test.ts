import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { EditorController } from '../src/automations/editor-controller.ts';
import { savedEditorFixture } from '../src/automations/editor-state.ts';
function setup() {
  const form=savedEditorFixture();let changes=0;
  const controller=new EditorController({
    form:()=>form,render:()=>{},changed:()=>{changes++;},closeOther:()=>{},
    notify:()=>{},overlays:{} as HTMLElement,
    api:async()=>{throw Error('Unexpected network request');},
  });
  controller.render=()=>{};controller.close=()=>{controller.panel='';};
  return {form,controller,changes:()=>changes};
}
test('model selection and parameters update only the local draft',async()=>{
  const {form,controller,changes}=setup();
  controller.models=JSON.parse(await readFile('src/automations/editor-models.json','utf8'));
  controller.selectModel('grok-4.7',true);
  assert.equal(form.model,'grok-4.7');assert.equal(changes(),1);
  assert.equal(form.enabled,false);
  controller.setParameter('reasoning_effort','low');
  assert.equal(form.modelParameters?.reasoning_effort,'low');
  controller.setParameter('reasoning_effort','invalid');
  assert.equal(form.modelParameters?.reasoning_effort,'low');
  controller.panel='models';
  controller.input({name:'ed-model-search',value:'Composer'} as HTMLInputElement);
  assert.equal(controller.optionsFor,'');assert.equal(controller.query,'Composer');
});
test('built-in tools are deduplicated without executing an integration',()=>{
  const {form,controller,changes}=setup();
  controller.addTool('Memories');controller.addTool('Memories');
  assert.equal(form.tools.length,1);assert.equal(changes(),1);
  assert.equal(form.tools[0]?.kind,'Memories');
});
