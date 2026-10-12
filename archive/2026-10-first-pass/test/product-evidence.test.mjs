import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('new product surfaces disclose reference gaps and isolate the SDK exception',async()=>{
 for(const name of ['auth','inference','mcp']){
  const facts=JSON.parse(await readFile(`src/${name}/ui-facts.json`,'utf8'));
  for(const f of facts){for(const key of ['id','label','property','value','referenceVersion','route','state','viewport','captureDate'])assert.notEqual(f[key],undefined);assert.equal(f.label,'UNVERIFIED');}
 }
 const root=JSON.parse(await readFile('package.json','utf8')),mcp=JSON.parse(await readFile('mcp/package.json','utf8'));
 assert.equal(Object.keys(root.dependencies??{}).length,0);
 assert.deepEqual(mcp.dependencies,{'@modelcontextprotocol/sdk':'1.32.1'});
});
