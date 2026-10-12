import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
export function compare(facts, actual) {
  const url=new URL(actual.url), isRuns=url.pathname==='/automations/runs';
  const rowState=['failed-run-list','failed-run-summary','failed-run-menu'].includes(actual.captureState)?actual.captureState:null;
  const editorState=['saved-editor','tools-menu','mcp-menu','mcp-browse','mcp-url','mcp-command','mcp-json','model-picker','model-options'].includes(actual.captureState)?actual.captureState:null;
  const triggerState=['trigger-baseline','add-trigger','scheduled-submenu','schedule-picker','trigger-dismissed'].includes(actual.captureState)?actual.captureState:null;
  assert.ok(triggerState || editorState || isRuns || (url.pathname==='/automations' && url.searchParams.get('state')==='upgrade'),'Wrong reference state');
  if(editorState||triggerState){
    assert.equal(url.pathname,'/automations/editor-fixture');assert.equal(url.searchParams.get('fixture'),'saved-editor');
    if(triggerState)assert.equal(url.searchParams.get('controls'),'triggers');
  } else if (rowState) {
    assert.ok(isRuns && url.searchParams.get('fixture')==='observed-failure','Expected explicit reference-derived fixture');
  } else if (isRuns) {
    assert.ok(!url.searchParams.get('fixture') && !url.searchParams.get('status'),'Expected unfiltered non-fixture runs');
    assert.ok(!url.searchParams.get('scope') || url.searchParams.get('scope')==='team','Expected Team runs');
  }
  const state=triggerState||editorState||rowState;
  const chosen=facts.filter(f=>(f.source?.element!==undefined||f.attribute||f.inputValue) &&
    (state ? f.captureState===state : !f.captureState && (isRuns ? !f.id.startsWith('gate-') : f.id.startsWith('gate-'))));
  const mismatches=[]; let checks=0;
  for (const f of chosen) {
    assert.deepEqual(actual.viewport,f.viewport,'Same viewport/DPR required');
    const target=f.target??f.id;
    const measured=actual.elements.find(e=>e.id===target);
    if (!measured) {mismatches.push(`${f.id}: element missing`);continue;}
    if(f.attribute||f.inputValue){
      checks++;const value=f.inputValue?measured.value:measured.attributes?.[f.attribute];
      if(value!==f.value)mismatches.push(`${f.id}: control state differs`);
      continue;
    }
    let dimensions=['x','y','width','height'];
    if (['gate-title','runs-title','sum-title','rw-status','ed-title','ed-name','ed-model'].includes(target)) dimensions=['x','y','height'];
    if (['gate-button','runs-empty','sum-close','sum-view','ed-save','ed-test','mc-toggle','mc-cancel','mc-submit'].includes(target)) dimensions=['y','height'];
    for (const key of dimensions) {
      checks++;
      if (!Number.isFinite(measured.rect[key]) || Math.abs(measured.rect[key]-f.value.rect[key])>.75)
        mismatches.push(`${f.id}.${key}: ${measured.rect[key]} != ${f.value.rect[key]}`);
    }
    const styleKeys=f.value.text!==null?['font-size','line-height']:['border-radius'];
    for (const key of styleKeys) {
      checks++;
      if (measured.style[key]!==f.value.style[key]) mismatches.push(`${f.id}.${key}: ${measured.style[key]} != ${f.value.style[key]}`);
    }
    if (f.value.text!==null) {
      checks++;
      if (measured.text.trim()!==f.value.text.trim()) mismatches.push(`${f.id}: copy differs`);
    }
  }
  assert.ok(chosen.length>0,'No measured facts selected');
  if(triggerState==='trigger-baseline'||triggerState==='trigger-dismissed'){
    checks++;
    if(actual.elements.some(e=>['tr-menu','tr-schedules','tr-cron'].includes(e.id)))mismatches.push('Trigger overlay must be dismissed');
  }
  if(triggerState==='trigger-dismissed'){
    checks++;
    if(actual.focus!=='tr-existing-cron')mismatches.push('Dismissal must restore focus to the cron control');
  }
  return {checks,mismatches};
}
if (process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv[2]) throw Error('Usage: node pipeline/compare-ui.mjs <local-measurements.json>');
  const actual=JSON.parse(await readFile(process.argv[2],'utf8'));
  const facts=(await Promise.all(['ui-facts.json','row-facts.json','editor-facts.json','trigger-facts.json'].map(async file=>
    JSON.parse(await readFile(`src/automations/${file}`,'utf8'))))).flat();
  const {buildHash}=await import('../src/server.ts');
  assert.equal(actual.buildHash,await buildHash(),'Stale snapshot: recapture the current build');
  const result=compare(facts,actual);
  console.log(JSON.stringify(result,null,2));
  console.log('Subset only: font glyphs, text widths, custom icons and unobserved states are NOT certified.');
  if (result.mismatches.length) process.exitCode=1;
}
