import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const facts=(await Promise.all(['ui-facts.json','row-facts.json','editor-facts.json','trigger-facts.json','preset-facts.json'].map(async name=>
  JSON.parse(await readFile(`src/automations/${name}`,'utf8'))))).flat();
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
  } else if(f.source.uiCatalogue){
    const source=JSON.parse(bytes).elements, rows=JSON.parse(await readFile('src/automations/mcp-catalog.json','utf8'));
    assert.equal(rows.length,f.value);
    for(const row of rows){assert.equal(source[row.nameElement].text,row.name);assert.equal(source[row.descriptionElement].text,row.description);}
  } else if(f.source.modelCatalogue){
    const source=JSON.parse(bytes).models, rows=JSON.parse(await readFile('src/automations/editor-models.json','utf8'));
    assert.equal(rows.length,f.value);
    for(const row of rows){
      const model=source.find(m=>m.name===row.id);assert.equal(model.clientDisplayName,row.name);
      const params=model.parameterDefinitions.map(p=>{const type=p.parameterType,boolean=!!type.booleanParameter;return {
        id:p.id,name:p.name,boolean,options:(type.booleanParameter??type.enumParameter).values.map(v=>({value:v.value,label:v.displayName??v.value}))};});
      assert.deepEqual(row.parameters,params);
      const defaults=model.variants.find(v=>v.isDefaultNonMaxConfig);
      assert.deepEqual(row.defaults,Object.fromEntries((defaults?.parameterValues??[]).map(v=>[v.id,v.value])));
    }
  } else if(f.source.attributePresence){
    const {element,attribute}=f.source.attributePresence;
    assert.equal(Object.hasOwn(JSON.parse(bytes).elements[element].attributes,attribute),f.value);
  } else if (f.source.jsonPath) {
    let data=JSON.parse(bytes);
    if(f.source.responsePath) data=JSON.parse(f.source.responsePath.reduce((v,key)=>v[key],data));
    assert.deepEqual(f.source.jsonPath.reduce((v,key)=>v[key],data),f.value,`${f.id}: response mismatch`);
  } else assert.fail(`${f.id}: unsupported locator`);
  verified++;
}
const pkg=JSON.parse(await readFile('package.json','utf8'));
assert.equal(Object.keys(pkg.dependencies??{}).length,0,'Runtime dependencies are forbidden');
console.log(`${facts.length} fact records valid. ${root?`${verified} raw sources reproduced.`:'Raw sources NOT checked (pass the private reference directory).'}`);
