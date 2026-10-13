import {writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.ATSU_PLAYWRIGHT);
const root=new URL('../evidence/',import.meta.url);
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:1440,height:1000}});
const report={url:process.env.ATSU_URL||'https://atsu.moe/',at:new Date().toISOString(),browser:await b.version()};
const prefix=process.env.ATSU_PREFIX||'16-live';
const save=async(name)=>p.screenshot({path:new URL(`${prefix}-${name}.png`,root).pathname});
const measure=async(loc)=>loc.evaluate(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,text:e.textContent.slice(0,100),class:e.className,rect:{x:r.x,y:r.y,width:r.width,height:r.height},...Object.fromEntries(['fontFamily','fontSize','lineHeight','fontWeight','letterSpacing','color','backgroundColor','borderRadius','transitionProperty','transitionDuration','transitionTimingFunction','outline','scale'].map(k=>[k,s[k]]))};});
try{
 await p.goto(report.url,{waitUntil:'domcontentloaded'});
 await p.getByText('Hot Updates',{exact:true}).last().waitFor();
 await p.waitForTimeout(2500);await p.evaluate(()=>document.fonts.ready);
 report.assets=await p.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name));
 report.fonts=await p.evaluate(()=>[...document.fonts].map(f=>({family:f.family,status:f.status,weight:f.weight})));
 report.heading=await measure(p.getByText('Hot Updates',{exact:true}).last());
 const card=p.locator('a[href^="/manga/"],a[href^="/novel/"]').filter({visible:true}).first();
 report.card=await measure(card);report.title=await measure(card.locator('.title'));report.poster=await measure(card.locator('.poster'));await save('home');
 await card.hover();report.cardHover=await measure(card);report.posterHover=await measure(card.locator('.poster'));report.titleHover=await measure(card.locator('.title'));await save('hover');
 await p.mouse.move(0,0);await card.focus();report.cardFocus=await measure(card);report.posterFocus=await measure(card.locator('.poster'));
 await p.keyboard.press('Meta+k');await p.waitForTimeout(250);
 const input=p.getByPlaceholder('Start typing to search');
 report.search={visible:await input.isVisible(),focused:await input.evaluate(e=>e===document.activeElement),style:await measure(input)};
 await save('search');await input.fill('witch');await p.waitForTimeout(1500);await p.keyboard.press('ArrowDown');await save('search-results');
 report.search.afterArrow=await p.evaluate(()=>({active:document.activeElement?.outerHTML.slice(0,500),selected:[...document.querySelectorAll('[aria-selected=true]')].map(e=>e.textContent)}));
 await p.keyboard.press('Escape');report.search.escapeClosedImmediate=!(await input.isVisible());await p.waitForTimeout(200);report.search.afterEscape=await measure(input);report.search.closedForm=await input.evaluate(e=>{const s=getComputedStyle(e.closest('form'));return {opacity:s.opacity,pointerEvents:s.pointerEvents}});report.search.escapeClosed=report.search.closedForm.opacity==='0'&&report.search.closedForm.pointerEvents==='none';
 const menu=p.locator('button.size-36').first();await menu.click();await p.waitForTimeout(180);await save('menu');
 report.menu=await p.locator('[class*="transition-[transform_opacity]"]').evaluateAll(es=>es.map(e=>({class:e.className,property:getComputedStyle(e).transitionProperty,duration:getComputedStyle(e).transitionDuration,easing:getComputedStyle(e).transitionTimingFunction})));
 await p.keyboard.press('Escape');await p.goto(report.url);
 await p.getByRole('button',{name:'Customize home',exact:true}).click();await p.waitForTimeout(400);await save('preferences');
 report.preferences=(await p.locator('body').innerText()).slice(-6000);
 await p.keyboard.press('Escape');
 await p.setViewportSize({width:390,height:844});await p.goto(report.url);await p.waitForTimeout(2000);await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(150);await save('mobile');
 report.mobileHeading=await measure(p.getByText('Hot Updates',{exact:true}).last());
 report.mobile={width:await p.evaluate(()=>innerWidth),scrollWidth:await p.evaluate(()=>document.documentElement.scrollWidth)};
}catch(e){report.error=String(e);process.exitCode=1;}
finally{await writeFile(new URL(`${prefix}.json`,root),JSON.stringify(report,null,2)+'\n');await b.close();}
