import { test } from 'node:test';
import assert from 'node:assert/strict';
import { draft } from '../src/automations/model.ts';
import { editor, notFound, list, runs, shell } from '../src/automations/view.ts';
test('views escape user content and expose actual empty/loading-free structure',()=>{
  const a={...draft(),id:'one',name:'<script>alert(1)</script>',prompt:'</textarea><script>bad</script>'};
  assert.doesNotMatch(list([a],'mine','',1),/<script>/);
  assert.doesNotMatch(editor(a,'Model',[]),/<script>/);
  assert.match(list([],'mine','',1),/No Automations Yet/);
  assert.doesNotMatch(list([],'mine','',1),/role="table"/);
  assert.match(list([a],'mine','nomatch',1),/No Results Found/);
  assert.match(runs([],'team','','',false),/No Runs Yet/);
  assert.match(runs([],'team','','',false),/data-evidence="runs-card"/);
  assert.match(gate(),/Upgrade to unlock Automations/);
  assert.doesNotMatch(shell(gate()),/Local preview|Profile/);
  assert.match(notFound(),/Page not found/);
  assert.match(shell(notFound()),/aria-label="Automations"/);
  const unsafe={...a,triggers:[{id:'"><img src=x>',kind:'Schedule' as const,event:'Cron',value:'0 9 * * *'}]};
  assert.doesNotMatch(editor(unsafe,'Model',[]),/<img/);
  assert.match(editor(unsafe,'Model',[]),/&quot;&gt;&lt;img/);
});
test('list scopes, stable enabled-first ordering and pagination',()=>{
  const rows=Array.from({length:12},(_,i)=>({...draft(),id:`id-${i}`,name:`Name ${i}`,enabled:i===11}));
  const html=list(rows,'mine','',1);
  assert.ok(html.indexOf('Name 11')<html.indexOf('Name 0'));
  assert.match(html,/1–10 of 12/); assert.match(list(rows,'mine','',2),/11–12 of 12/);
  assert.match(list([{...draft(),scope:'team'}],'mine','',1),/No Automations Yet/);
});
