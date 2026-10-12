import { settingsPages, settingsShell, settingsUserMenu } from './settings-view.ts';
const app=document.querySelector<HTMLElement>('#settings-app')!;
const overlays=document.querySelector<HTMLElement>('#settings-overlays')!;
const notice=document.querySelector<HTMLElement>('#settings-notice')!;
let menu=false,returned=false,dismissed=false;
function render(){app.innerHTML=settingsShell(location.pathname);}
function closeMenu(){if(!menu)return;menu=false;dismissed=true;overlays.innerHTML='';app.querySelector<HTMLButtonElement>('[data-user-menu]')?.focus();}
function openMenu(){menu=true;dismissed=false;overlays.innerHTML=settingsUserMenu();overlays.querySelector<HTMLElement>('[role=menu]')?.focus();}
document.addEventListener('click',event=>{
  const target=event.target as Element;
  if(target.closest('[data-user-menu]')){if(menu)closeMenu();else openMenu();return;}
  if(target.closest('[data-unavailable]')){notice.textContent='Read-only local preview: account changes, external navigation and authorization are unavailable.';return;}
  const anchor=target.closest<HTMLAnchorElement>('nav a');
  if(!anchor)return;
  const path=new URL(anchor.href).pathname;
  if(!settingsPages.some(p=>p[1]===path))return;
  event.preventDefault();closeMenu();returned=location.pathname==='/dashboard'&&path==='/dashboard/settings';dismissed=false;
  const url=new URL(path,location.origin);const fixture=new URLSearchParams(location.search).get('fixture');
  if(fixture)url.searchParams.set('fixture',fixture);
  history.pushState(null,'',url);render();window.scrollTo(0,0);app.querySelector<HTMLAnchorElement>('nav a[aria-current=page]')?.focus();
});
document.addEventListener('pointerdown',event=>{const target=event.target as Element;if(menu&&!overlays.contains(target)&&!target.closest('[data-user-menu]'))closeMenu();});
document.addEventListener('keydown',event=>{
  if(event.altKey&&event.shiftKey&&event.code==='KeyE'){event.preventDefault();void exportLayout();return;}
  if(!menu)return;
  if(event.key==='Escape'){event.preventDefault();closeMenu();return;}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();const items=[...overlays.querySelectorAll<HTMLButtonElement>('[role=menuitem]')];
    const at=items.indexOf(document.activeElement as HTMLButtonElement),delta=event.key==='ArrowDown'?1:-1;
    items[at<0?(delta===1?0:items.length-1):(at+delta+items.length)%items.length]?.focus();
  }
});
window.addEventListener('popstate',()=>{closeMenu();returned=false;dismissed=false;render();});
render();
async function exportLayout(){
  await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  const response=await fetch('/api/build');if(!response.ok)throw Error('Build identity unavailable');
  const build=await response.json() as {hash:string};
  const captureState=location.pathname==='/dashboard'?'settings-overview':menu?'settings-user-menu':dismissed?'settings-dismissed':returned?'settings-returned':'settings-account';
  if(!['/dashboard','/dashboard/settings'].includes(location.pathname)){notice.textContent='No reference comparison exists for this panel.';return;}
  const elements=[...document.querySelectorAll<HTMLElement>('[data-evidence]')].map(element=>{
    const r=element.getBoundingClientRect(),style=getComputedStyle(element);
    return {id:element.dataset.evidence,text:element.textContent,rect:{x:r.x,y:r.y,width:r.width,height:r.height},
      value:'value' in element?(element as HTMLInputElement).value:null,attributes:Object.fromEntries([...element.attributes].map(a=>[a.name,a.value])),
      style:Object.fromEntries([...style,'border-radius','padding','margin'].map(key=>[key,style.getPropertyValue(key)]))};
  });
  const actual={buildHash:build.hash,captureState,captureDate:new Date().toISOString(),url:location.href,
    viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},elements,focus:(document.activeElement as HTMLElement)?.dataset.evidence??null};
  const url=URL.createObjectURL(new Blob([JSON.stringify(actual,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`local-settings-${captureState}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
