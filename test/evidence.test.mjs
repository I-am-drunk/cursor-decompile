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
