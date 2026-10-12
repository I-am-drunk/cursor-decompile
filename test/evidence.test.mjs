import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare } from '../pipeline/compare-ui.mjs';
// Synthetic comparator fixtures; these tests are not browser parity evidence.
const viewport={width:100,height:100,devicePixelRatio:1};
const fact={id:'gate-card',source:{element:1},viewport,
  value:{rect:{x:0,y:10,width:50,height:20},style:{'border-radius':'6px'},text:null}};
const snapshot=()=>({url:'http://localhost/automations?state=upgrade',viewport,
  elements:[{id:'gate-card',...structuredClone(fact.value)}]});
test('comparison rejects geometry, missing elements, style and viewport drift',()=>{
  assert.deepEqual(compare([fact],snapshot()).mismatches,[]);
  let actual=snapshot(); actual.elements[0].rect.width=80;
  assert.match(compare([fact],actual).mismatches.join(),/width/);
  actual=snapshot(); actual.elements=[];
  assert.match(compare([fact],actual).mismatches.join(),/missing/);
  actual=snapshot(); actual.elements[0].style['border-radius']='12px';
  assert.match(compare([fact],actual).mismatches.join(),/border-radius/);
  actual=snapshot(); actual.viewport={...viewport,width:200};
  assert.throws(()=>compare([fact],actual),/viewport/);
});
test('new row-state comparisons require explicit reference fixtures and the matching state',()=>{
  const f={...fact,id:'rw-row',captureState:'failed-run-list'};
  const s={...snapshot(),captureState:'failed-run-list',url:'http://localhost/automations/runs?fixture=observed-failure',
    elements:[{...snapshot().elements[0],id:'rw-row'}]};
  assert.deepEqual(compare([f],s).mismatches,[]);
  assert.throws(()=>compare([f],{...s,url:'http://localhost/automations/runs'}),/fixture/);
  assert.throws(()=>compare([f],{...s,captureState:'failed-run-summary'}),/No measured facts/);
});
test('editor states resolve unique fact IDs to their DOM targets',()=>{
  const f={...fact,id:'mcp-url:mc-dialog',target:'mc-dialog',captureState:'mcp-url'};
  const s={...snapshot(),captureState:'mcp-url',url:'http://localhost/automations/editor-fixture?fixture=saved-editor',
    elements:[{...snapshot().elements[0],id:'mc-dialog'}]};
  assert.deepEqual(compare([f],s).mismatches,[]);
  assert.throws(()=>compare([f],{...s,url:'http://localhost/automations/other?fixture=saved-editor'}));
  assert.equal(compare([f],{...s,elements:[]}).mismatches.length,1);
});
