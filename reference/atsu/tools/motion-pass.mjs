import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.ATSU_PLAYWRIGHT);
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000}});
const output={at:new Date().toISOString(),passes:[]};
for(const reducedMotion of ['no-preference','reduce']){
 await p.emulateMedia({reducedMotion});await p.goto('https://atsu.moe/');
 const frames=await p.evaluate(async()=>{
  const trigger=document.querySelector('button.size-36');const rows=[];const start=performance.now();trigger.click();
  await new Promise(resolve=>{function frame(now){const e=document.querySelector('[class*="transition-[transform_opacity]"]');if(e){const s=getComputedStyle(e);rows.push({ms:now-start,opacity:s.opacity,scale:s.scale,transform:s.transform,animations:e.getAnimations().map(a=>({property:a.transitionProperty,timing:a.effect.getTiming()}))});}if(now-start<450)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});return rows;
 });output.passes.push({reducedMotion,frames});
}
await writeFile(new URL('../evidence/18-motion.json',import.meta.url),JSON.stringify(output,null,2)+'\n');await b.close();
