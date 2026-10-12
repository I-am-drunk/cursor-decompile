import { parseRunStatuses, toggleRunStatus } from './run-filter-state.ts';
import { runFilterMenu } from './run-filter-view.ts';
interface Host {
  value:()=>string;setValue:(value:string[])=>void;render:()=>void;
  closeOther:()=>void;notify:(message:string)=>void;overlays:HTMLElement;
}
export class RunFilterController {
  host:Host;open=false;submenu=false;cleared=false;
  constructor(host:Host){this.host=host;}
  close(){if(!this.open)return;this.open=false;this.submenu=false;this.host.overlays.innerHTML='';
    document.querySelector<HTMLButtonElement>('[data-act="filters"]')?.focus();}
  handle(command:string):boolean {
    if(command==='filters'){this.host.closeOther();this.open=true;this.submenu=false;this.render();return true;}
    if(command==='rf-status'){this.submenu=true;this.render();return true;}
    if(command==='rf-unverified'){this.host.notify('This filter category has not been verified in the local build.');return true;}
    if(command==='rf-clear'||command.startsWith('rf-toggle:')){
      const values=command==='rf-clear'?[]:toggleRunStatus(this.host.value(),command.slice(10));
      this.host.setValue(values);this.cleared=!values.length;this.host.render();this.render();
      if(command.startsWith('rf-toggle:'))this.host.overlays.querySelector<HTMLButtonElement>(`[data-act="${command}"]`)?.focus();
      return true;
    }
    return false;
  }
  render(){
    const root=this.host.overlays;root.innerHTML=runFilterMenu(this.host.value(),this.submenu);
    const anchor=document.querySelector<HTMLElement>('[data-act="filters"]')!;
    const box=anchor.getBoundingClientRect(),menu=root.querySelector<HTMLElement>('.rf-root')!;
    menu.style.left=`${box.right-menu.offsetWidth}px`;menu.style.top=`${box.bottom+4}px`;
    const sub=root.querySelector<HTMLElement>('.rf-status-menu');
    if(sub){const item=root.querySelector<HTMLElement>('[data-act="rf-status"]')!.getBoundingClientRect();
      sub.style.left=`${menu.getBoundingClientRect().left-sub.offsetWidth+4}px`;sub.style.top=`${item.top}px`;}
    menu.focus();
  }
  key(e:KeyboardEvent):boolean {
    if(!this.open)return false;
    if(e.key==='Escape'||(e.key==='ArrowLeft'&&this.submenu)){
      e.preventDefault();
      if(this.submenu){this.submenu=false;this.render();this.host.overlays.querySelector<HTMLButtonElement>('[data-act="rf-status"]')?.focus();}
      else this.close();
      return true;
    }
    const target=e.target as HTMLElement;
    if(e.key==='ArrowRight'&&target.dataset.act==='rf-status'){
      e.preventDefault();this.submenu=true;this.render();
      this.host.overlays.querySelector<HTMLButtonElement>('.rf-status-menu button')?.focus();return true;
    }
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();const items=[...this.host.overlays.querySelectorAll<HTMLButtonElement>(this.submenu?'.rf-status-menu button':'.rf-root button')];
      const at=items.indexOf(document.activeElement as HTMLButtonElement),delta=e.key==='ArrowDown'?1:-1;
      items[at<0?(delta===1?0:items.length-1):(at+delta+items.length)%items.length]?.focus();return true;
    }
    return false;
  }
  pointer(target:Node){
    if(this.open&&!this.host.overlays.contains(target)&&!document.querySelector('[data-act="filters"]')?.contains(target))this.close();
  }
  captureState(){
    const selected=parseRunStatuses(this.host.value());
    if(this.open&&!this.submenu)return 'runs-filter';
    if(this.submenu)return !selected.length?'runs-status':selected.join(',')==='running'?'runs-running':selected.join(',')==='running,failed'?'runs-multiple-status':'unverified-filter';
    return selected.length?'runs-filtered-empty':this.cleared?'runs-cleared':'runs-baseline';
  }
  reset(){this.close();this.cleared=false;}
}
