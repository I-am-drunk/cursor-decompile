import { validCron } from './model.ts';
import type { Automation } from './model.ts';
import { cronMenu, scheduleChoices, triggerMenu } from './trigger-view.ts';
interface Host {
  form:()=>Automation; render:()=>void; changed:()=>void; closeOther:()=>void;
  notify:(message:string)=>void; fixture:()=>boolean; overlays:HTMLElement;
}
export class TriggerController {
  host:Host; panel=''; query=''; value=''; error=''; triggerId='';
  dismissed=false; anchor:HTMLElement|null=null;
  constructor(host:Host){this.host=host;}
  findAction(command:string):HTMLElement|null {
    return [...document.querySelectorAll<HTMLElement>('[data-act]')].find(e=>e.dataset.act===command)??null;
  }
  close(){
    if(!this.panel)return;
    this.panel='';this.dismissed=true;this.host.overlays.innerHTML='';
    this.anchor?.setAttribute('aria-expanded','false');this.anchor?.focus();
  }
  open(panel:string,command:string){
    this.host.closeOther();this.panel=panel;this.query='';this.error='';
    this.anchor=this.findAction(command);this.anchor?.setAttribute('aria-expanded','true');this.render();
  }
  handle(command:string):boolean {
    if(command==='tr-add'){this.open('add-trigger',command);return true;}
    if(command.startsWith('tr-cron:')){
      const id=command.slice(8),t=this.host.form().triggers.find(t=>t.id===id);
      if(t?.kind==='Schedule'){this.triggerId=id;this.value=t.value;this.open('schedule-picker',command);}
      return true;
    }
    if(command.startsWith('tr-provider:')){
      if(command==='tr-provider:Scheduled'){this.panel='scheduled-submenu';this.render();}
      else this.host.notify('This provider’s configuration is not captured or connected in the local build.');
      return true;
    }
    if(command.startsWith('tr-preset:')){this.addPreset(Number(command.slice(10)));return true;}
    return false;
  }
  addPreset(index:number){
    if(!Number.isInteger(index)||!scheduleChoices[index])return;
    // DESIGN defaults: the capture proves option labels, not newly-created values.
    const value=['0 * * * *','0 9 * * *','0 9 * * 1','0 * * * *'][index]!;
    const id=crypto.randomUUID();
    this.host.form().triggers.push({id,kind:'Schedule',event:'Cron',value});
    this.host.changed();this.close();this.host.render();this.handle(`tr-cron:${id}`);
    this.host.notify('Local schedule added. Preset defaults are not reference-verified; no schedule is executed.');
  }
  commit(){
    if(!validCron(this.value)){
      this.error='Local validation: use numeric cron fields or a supported @ alias.';this.render();return;
    }
    const t=this.host.form().triggers.find(t=>t.id===this.triggerId);
    if(t&&t.value!==this.value.trim()){t.value=this.value.trim();this.host.changed();}
    this.close();this.host.render();this.findAction(`tr-cron:${this.triggerId}`)?.focus();
  }
  render(){
    const root=this.host.overlays;
    const focused=document.activeElement as HTMLInputElement,name=focused?.name,position=focused?.selectionStart;
    if(this.panel==='schedule-picker')root.innerHTML=cronMenu(this.value,this.error,this.host.fixture()&&this.value==='0 0 1 1 *');
    else root.innerHTML=triggerMenu(this.query,this.panel==='scheduled-submenu');
    this.position();
    const input=root.querySelector<HTMLInputElement>(this.panel==='schedule-picker'?'[name="cron-expression"]':'[name="trigger-search"]');
    if(this.panel==='scheduled-submenu')root.querySelector<HTMLButtonElement>('.tr-schedules button')?.focus();
    else if(input){input.focus();if(input.name===name&&position!==null)input.setSelectionRange(position,position);}
  }
  position(){
    const root=this.host.overlays,pop=root.querySelector<HTMLElement>('.tr-pop');if(!pop||!this.anchor)return;
    const r=this.anchor.getBoundingClientRect();
    pop.style.left=`${Math.max(8,Math.min(Math.round(r.left),innerWidth-pop.offsetWidth-8))}px`;
    pop.style.top=`${r.bottom+pop.offsetHeight+4>innerHeight?Math.max(8,r.top-pop.offsetHeight-4):r.bottom+4}px`;
    const sub=root.querySelector<HTMLElement>('.tr-schedules'),item=root.querySelector<HTMLElement>('[data-act="tr-provider:Scheduled"]');
    if(sub&&item){const p=pop.getBoundingClientRect();sub.style.left=`${p.right+sub.offsetWidth>innerWidth?p.left-sub.offsetWidth+4:p.right-4}px`;sub.style.top=`${item.getBoundingClientRect().top}px`;}
  }
  input(input:HTMLInputElement):boolean {
    if(!this.panel)return false;
    if(input.name==='trigger-search'){this.query=input.value;this.panel='add-trigger';this.render();return true;}
    if(input.name==='cron-expression'){this.value=input.value;this.error='';return true;}
    return false;
  }
  key(event:KeyboardEvent):boolean {
    if(!this.panel)return false;
    if(event.key==='Escape'||(event.key==='ArrowLeft'&&this.panel==='scheduled-submenu')){
      event.preventDefault();
      if(this.panel==='scheduled-submenu'){this.panel='add-trigger';this.render();this.findAction('tr-provider:Scheduled')?.focus();}
      else this.close();
      return true;
    }
    if(this.panel==='schedule-picker'){
      if(event.key==='Enter'){event.preventDefault();this.commit();return true;}return false;
    }
    const target=event.target as HTMLElement,command=target.dataset.act;
    if(event.key==='ArrowRight'&&command==='tr-provider:Scheduled'){
      event.preventDefault();this.handle(command);return true;
    }
    if((event.key==='Enter'||event.key===' ')&&target.matches('[role="option"]')){
      event.preventDefault();if(command)this.handle(command);return true;
    }
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      const selector=this.panel==='scheduled-submenu'?'.tr-schedules button':'[role="option"]';
      const items=[...this.host.overlays.querySelectorAll<HTMLElement>(selector)],current=items.indexOf(document.activeElement as HTMLElement);
      const direction=event.key==='ArrowDown'?1:-1;
      items[current<0?(direction===1?0:items.length-1):(current+direction+items.length)%items.length]?.focus();return true;
    }
    return false;
  }
  pointer(target:Node){if(this.panel&&!this.host.overlays.contains(target)&&!this.anchor?.contains(target))this.close();}
  captureState(){return this.panel||(this.dismissed?'trigger-dismissed':'trigger-baseline');}
  reset(){this.close();this.dismissed=false;}
}
