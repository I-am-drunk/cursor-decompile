import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const facts=JSON.parse(await readFile('src/automations/ui-facts.json','utf8'));
const root=process.argv[2], ids=new Set();
let verified=0;
for (const f of facts) {
  for (const key of ['id','label','property','value','referenceVersion','route','state','viewport','captureDate'])
    assert.ok(f[key] !== undefined,`${f.id}: missing ${key}`);
  assert.ok(!ids.has(f.id),`Duplicate ${f.id}`); ids.add(f.id);
  assert.ok(['EXTRACTED_UI','OBSERVED','UNVERIFIED','DESIGN','DOCUMENTED'].includes(f.label));
  if (!f.source) { assert.ok(['UNVERIFIED','DESIGN'].includes(f.label)); continue; }
  assert.match(f.source.sha256,/^[a-f0-9]{64}$/);
  if (!root) continue;
  const file=resolve(root,f.source.path);
  assert.ok(file.startsWith(resolve(root)+'/'),'Source escapes reference root');
  const bytes=await readFile(file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),f.source.sha256,`${f.id}: changed source`);
  if (f.source.element !== undefined) {
    const node=JSON.parse(bytes).elements[f.source.element];
    assert.deepEqual(f.value,{rect:node.rect,style:node.style,text:node.text},`${f.id}: unsupported measurement`);
  } else if (f.source.byteRange) {
    const [start,end]=f.source.byteRange;
    assert.ok(Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&end>start&&end<=bytes.length);
    const text=bytes.subarray(start,end).toString();
    for (const anchor of f.source.anchors) assert.ok(text.includes(anchor),`${f.id}: missing anchor`);
  } else if (f.source.catalog) {
    const models=JSON.parse(bytes).models.slice(0,13).map(m=>({id:m.name,name:m.clientDisplayName}));
    assert.deepEqual(f.value,models);
    assert.deepEqual(JSON.parse(await readFile('src/automations/catalog.json','utf8')),models);
  } else assert.fail(`${f.id}: unsupported locator`);
  verified++;
}
const pkg=JSON.parse(await readFile('package.json','utf8'));
assert.equal(Object.keys(pkg.dependencies??{}).length,0,'Runtime dependencies are forbidden');
console.log(`${facts.length} fact records valid. ${root?`${verified} raw sources reproduced.`:'Raw sources NOT checked (pass the private reference directory).'}`);
