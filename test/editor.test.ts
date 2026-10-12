import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { blankMcp, parseMcp, serializeMcp, validateMcp, savedEditorFixture } from '../src/automations/editor-state.ts';
import { savedEditor, toolsMenu, mcpForm, browseMcp } from '../src/automations/editor-view.ts';
import { Store } from '../src/store.ts';
test('MCP URL/command form and JSON round-trip without losing secret values',()=>{
  for(const c of [{...blankMcp(),name:'http',url:'https://example.com/mcp',headers:{Authorization:'test-secret'}},
    {...blankMcp(),name:'local',type:'command' as const,command:'tool',args:['--test'],env:{TOKEN:'test-secret'}}]){
    validateMcp(c);assert.deepEqual(parseMcp(serializeMcp(c)),c);
  }
  for(const bad of ['{}','{"mcpServers":{"a":{},"b":{}}}','{"mcpServers":{"a":{"url":"x","command":"y"}}}',
    '{"mcpServers":{"a":{"url":"https://example.com","env":{"TOKEN":"must-not-drop"}}}}',
    '{"mcpServers":{"a":{"command":"x","headers":{"Authorization":"must-not-drop"}}}}',
    '{"mcpServers":{"a":{"command":"x","args":[1]}}}','{"mcpServers":{"a":{"url":"x","auth":{}}}}'])
    assert.throws(()=>parseMcp(bad));
  assert.throws(()=>validateMcp({...blankMcp(),name:'a',url:'javascript:alert(1)'}));
  assert.throws(()=>validateMcp({...blankMcp(),name:'a',url:'https://user:secret@example.com'}));
});
test('configuration references protect public state and preserve automation isolation',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'editor-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=new Store(join(dir,'state.json'));
  const config={...blankMcp(),name:'one',url:'https://example.com/mcp',headers:{Authorization:'test-secret'}};
  const {ref}=await store.addConfiguration(serializeMcp(config));
  const base={...savedEditorFixture(),id:'',revision:0};
  const a=await store.save({...base,tools:[{id:'m',kind:'MCP',name:'one',url:'',configurationRef:ref}]});
  const b=await store.save({...base,name:'Second',modelParameters:{fast:'false'}});
  const state=await store.read();assert.ok(!JSON.stringify(state).includes('test-secret'));
  assert.deepEqual(await store.getConfiguration(ref),config);
  a.modelParameters={fast:'true'};await store.save(a);
  assert.deepEqual((await store.read()).automations.find(v=>v.id===b.id)?.modelParameters,{fast:'false'});
  await assert.rejects(store.getConfiguration('__proto__'),/not found/);
  await assert.rejects(store.save({...a,tools:[{id:'x',kind:'MCP',name:'bad',url:'',configurationRef:'__proto__'}]}),/Unknown/);
});
test('storing a command configuration never runs the command',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'editor-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const marker=join(dir,'must-not-exist'),store=new Store(join(dir,'state.json'));
  await store.addConfiguration(serializeMcp({...blankMcp(),name:'never-run',type:'command',command:'touch',args:[marker]}));
  await assert.rejects(access(marker));
});
test('saved editor and connection views preserve observed labels and escape inputs',()=>{
  const a=savedEditorFixture();const html=savedEditor(a,'Composer 2.5',[],false,true);
  assert.ok(html.indexOf('Triggers')<html.indexOf('Agent Instructions'));
  assert.match(html,/data-evidence="ed-prompt"/);assert.match(html,/Add Tool or MCP/);
  const menu=toolsMenu(a,true);
  for(const label of ['Built-in','MCP Server','New Connection','No MCP servers configured','Source Control']) assert.ok(menu.includes(label));
  const c={...blankMcp(),name:'"><script>bad</script>'};
  assert.doesNotMatch(mcpForm(c,false,'',''),/<script>/);
  assert.match(mcpForm({...c,type:'command'},false,'',''),/Environment/);
  assert.match(mcpForm(c,true,serializeMcp(c),''),/Edit Form/);
  assert.match(browseMcp([{id:'x',name:'Example',description:'test'}],'nothing'),/No results found/);
});
