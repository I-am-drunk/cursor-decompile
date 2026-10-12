import { validCron } from './model.ts';
import type { Automation } from './model.ts';
import { cronMenu, triggerMenu } from './trigger-view.ts';
import { cronFieldError, hours, makePreset } from './preset-state.ts';
import { presetMenu, validatedCronMenu } from './preset-view.ts';
import { linearEvents, linearMenus } from './connection-view.ts';
interface Host {
  form:()=>Automation; render:()=>void; changed:()=>void; closeOther:()=>void;
  notify:(message:string)=>void; fixture:()=>boolean; overlays:HTMLElement;
}
export class TriggerController {
  host:Host; panel=''; query=''; value=''; error=''; triggerId='';
  dismissed=false; anchor:HTMLElement|null=null;
  presetState='';attempt='';
  linearState='';
  constructor(host:Host){this.host=host;}
  findAction(command:string):HTMLElement|null {
    return [...document.querySelectorAll<HTMLElement>('[data-act]')].find(e=>e.dataset.act===command)??null;
  }
  close(){
    if(!this.panel)return;
    if(this.panel==='schedule-picker'&&this.current()?.schedule)this.presetState='custom-restored';
    this.panel='';this.dismissed=true;this.host.overlays.innerHTML='';
    this.anchor?.setAttribute('aria-expanded','false');this.anchor?.focus();
    if(this.current()?.schedule){
      const command=this.anchor?.dataset?.act;this.host.render();
      if(command)this.findAction(command)?.focus();
    }
  }
  open(panel:string,command:string){
    this.host.closeOther();this.panel=panel;this.query='';this.error='';this.attempt='';
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
      else if(command==='tr-provider:Linear'){this.panel='linear-menu';this.render();}
      else this.host.notify('This provider’s configuration is not captured or connected in the local build.');
      return true;
    }
    if(command.startsWith('tr-preset:')){this.addPreset(Number(command.slice(10)));return true;}
    if(command==='lc-issues'){this.panel='linear-issue-menu';this.render();return true;}
    if(command.startsWith('lc-add:')){this.addLinear(Number(command.slice(7)));return true;}
    if(command==='lc-connect'){
      this.host.notify('Linear authorization is not connected in this local build. No authorization was started.');return true;
    }
    if(command.startsWith('pr-time:')||command.startsWith('pr-day:')){
      this.triggerId=command.slice(command.indexOf(':')+1);
      if(this.current()?.schedule)this.open(command.startsWith('pr-time:')?'preset-time':'preset-day',command);
      return true;
    }
    if(command.startsWith('pr-choose:')){
      const [,kind,index]=command.split(':');this.choose(kind!,Number(index));return true;
    }
    return false;
  }
  addPreset(index:number){
    if(!Number.isInteger(index))return;const t=makePreset(index);if(!t)return;
    this.host.form().triggers.push(t);
    this.host.changed();this.close();this.presetState=`${t.schedule!.kind}-added`;
    this.host.render();this.findAction('tr-add')?.focus();
  }
  current(){return this.host.form().triggers.find(t=>t.id===this.triggerId);}
  addLinear(index:number){
    const event=linearEvents[index];if(!Number.isInteger(index)||!event)return;
    this.host.form().triggers.push({id:crypto.randomUUID(),kind:'Linear',event,value:''});
    this.host.changed();this.close();this.linearState=['linear-created','linear-status','linear-cycle'][index]!;
    this.host.render();this.findAction('tr-add')?.focus();
  }
  preview(){return this.panel==='schedule-picker'?{id:this.triggerId,value:this.value}:undefined;}
  choose(kind:string,index:number){
    const t=this.current(),s=t?.schedule;
    if(!t||!s||!Number.isInteger(index)||index<0)return;
    if(kind==='time'&&hours[index])s.time=hours[index]!;
    else if(kind==='day'&&index<7)s.day=index;
    else return;
    t.value=`0 ${Number(s.time.slice(0,2))} * * ${s.kind==='weekly'?s.day:'*'}`;
    this.host.changed();this.close();this.presetState=`${s.kind}-selected`;this.host.render();
    this.findAction(`pr-${kind}:${t.id}`)?.focus();
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
    if(this.panel==='linear-menu'||this.panel==='linear-issue-menu')root.innerHTML=triggerMenu(this.query,false)+linearMenus(this.panel==='linear-issue-menu');
    else if(this.panel==='preset-time'||this.panel==='preset-day')root.innerHTML=presetMenu(this.panel==='preset-time'?'time':'day');
    else if(this.panel==='schedule-picker')root.innerHTML=this.current()?.schedule||cronFieldError(this.value)?
      validatedCronMenu(this.value,this.host.fixture(),this.error):
      cronMenu(this.value,this.error,this.host.fixture()&&this.value==='0 0 1 1 *');
    else root.innerHTML=triggerMenu(this.query,this.panel==='scheduled-submenu');
    this.position();
    const input=root.querySelector<HTMLInputElement>(this.panel==='schedule-picker'?'[name="cron-expression"]':'[name="trigger-search"]');
    if(this.panel==='linear-menu'||this.panel==='linear-issue-menu')root.querySelector<HTMLButtonElement>(this.panel==='linear-menu'?'.lc-linear-menu button':'.lc-issues button')?.focus();
    else if(this.panel==='preset-time'||this.panel==='preset-day')(root.firstElementChild as HTMLElement)?.focus();
    else if(this.panel==='scheduled-submenu')root.querySelector<HTMLButtonElement>('.tr-schedules button')?.focus();
    else if(input){input.focus();if(input.name===name&&position!==null)input.setSelectionRange(position,position);}
  }
  position(){
    const root=this.host.overlays,pop=root.querySelector<HTMLElement>('.tr-pop');if(!pop||!this.anchor)return;
    const r=this.anchor.getBoundingClientRect();
    const x=this.panel.startsWith('preset-')?Math.round(r.left*devicePixelRatio)/devicePixelRatio:Math.round(r.left);
    pop.style.left=`${Math.max(8,Math.min(x,innerWidth-pop.offsetWidth-8))}px`;
    pop.style.top=`${r.bottom+pop.offsetHeight+4>innerHeight?Math.max(8,r.top-pop.offsetHeight-4):r.bottom+4}px`;
    const sub=root.querySelector<HTMLElement>('.tr-schedules'),item=root.querySelector<HTMLElement>('[data-act="tr-provider:Scheduled"]');
    if(sub&&item){const p=pop.getBoundingClientRect();sub.style.left=`${p.right+sub.offsetWidth>innerWidth?p.left-sub.offsetWidth+4:p.right-4}px`;sub.style.top=`${item.getBoundingClientRect().top}px`;}
    const linear=root.querySelector<HTMLElement>('.lc-linear-menu'),linearItem=root.querySelector<HTMLElement>('[data-act="tr-provider:Linear"]');
    if(linear&&linearItem){
      linear.style.left=`${pop.getBoundingClientRect().right-4}px`;linear.style.top=`${linearItem.getBoundingClientRect().top}px`;
      const issues=root.querySelector<HTMLElement>('.lc-issues'),first=linear.querySelector('button');
      if(issues&&first){issues.style.left=`${linear.getBoundingClientRect().right-4}px`;issues.style.top=`${first.getBoundingClientRect().top}px`;}
    }
  }
  input(input:HTMLInputElement):boolean {
    if(!this.panel)return false;
    if(input.name==='trigger-search'){this.query=input.value;this.panel='add-trigger';this.render();return true;}
    if(input.name==='cron-expression'){
      this.value=input.value;this.error='';this.attempt='';
      if(this.current()?.schedule){
        const command=this.anchor?.dataset?.act;this.host.render();
        if(command){this.anchor=this.findAction(command);this.anchor?.setAttribute('aria-expanded','true');}
      }
      this.render();return true;
    }
    return false;
  }
  key(event:KeyboardEvent):boolean {
    if(!this.panel)return false;
    if(event.key==='Escape'||(event.key==='ArrowLeft'&&['scheduled-submenu','linear-menu','linear-issue-menu'].includes(this.panel))){
      event.preventDefault();
      if(this.panel==='schedule-picker'&&cronFieldError(this.value)){this.attempt='invalid-escape';return true;}
      if(this.panel==='linear-issue-menu'){this.panel='linear-menu';this.render();this.findAction('lc-issues')?.focus();}
      else if(this.panel==='linear-menu'){this.panel='add-trigger';this.render();this.findAction('tr-provider:Linear')?.focus();}
      else if(this.panel==='scheduled-submenu'){this.panel='add-trigger';this.render();this.findAction('tr-provider:Scheduled')?.focus();}
      else this.close();
      return true;
    }
    if(this.panel==='schedule-picker'){
      if(event.key==='Enter'){event.preventDefault();this.commit();return true;}return false;
    }
    const target=event.target as HTMLElement,command=target.dataset.act;
    if(event.key==='ArrowRight'&&command&&['tr-provider:Scheduled','tr-provider:Linear','lc-issues'].includes(command)){
      event.preventDefault();this.handle(command);return true;
    }
    if((event.key==='Enter'||event.key===' ')&&target.matches('[role="option"]')){
      event.preventDefault();if(command)this.handle(command);return true;
    }
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      const selector=this.panel==='linear-menu'?'.lc-linear-menu button':this.panel==='linear-issue-menu'?'.lc-issues button':this.panel.startsWith('preset-')?'.pr-options button':this.panel==='scheduled-submenu'?'.tr-schedules button':'[role="option"]';
      const items=[...this.host.overlays.querySelectorAll<HTMLElement>(selector)],current=items.indexOf(document.activeElement as HTMLElement);
      const direction=event.key==='ArrowDown'?1:-1;
      items[current<0?(direction===1?0:items.length-1):(current+direction+items.length)%items.length]?.focus();return true;
    }
    return false;
  }
  pointer(target:Node){
    if(this.panel&&!this.host.overlays.contains(target)&&!this.anchor?.contains(target)){
      if(this.panel==='schedule-picker'&&cronFieldError(this.value)){this.attempt='invalid-outside';return;}
      this.close();
    }
  }
  capturePresetState(){
    if(this.attempt)return this.attempt;
    if(this.panel==='preset-day')return 'weekly-days';
    if(this.panel==='preset-time')return this.current()?.schedule?.kind==='weekly'?'weekly-time':'daily-time';
    if(this.panel==='schedule-picker'&&this.current()?.schedule){
      return !this.value.trim()?'cron-empty':cronFieldError(this.value)?'cron-invalid':!validCron(this.value)?'cron-range':'custom-popup';
    }
    return this.presetState||'preset-baseline';
  }
  captureState(){return this.panel||(this.dismissed?'trigger-dismissed':'trigger-baseline');}
  captureConnectionState(){return this.panel==='linear-menu'||this.panel==='linear-issue-menu'?this.panel:this.linearState||'connection-baseline';}
  reset(){this.close();this.dismissed=false;this.presetState='';this.attempt='';this.linearState='';}
}
