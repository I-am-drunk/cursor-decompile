import type { Automation, Trigger } from './model.ts';
import { makePreset } from './preset-state.ts';
import { cronError, scheduleKinds, scheduleOf, timeZoneValid, updateSchedule, presetCron } from './schedule-state.ts';
import { addTriggerMenu, customSchedule, frequencyMenu, timezoneMenu, fieldMenu } from './schedule-view.ts';
interface Host {form:()=>Automation;render:()=>void;changed:()=>void;closeOther:()=>void;overlays:HTMLElement}
export class ScheduleController {
 host:Host;field='';returnPanel='';panel='';id='';value='';zone='UTC';error='';query='';anchor:HTMLElement|null=null;
 constructor(host:Host){this.host=host;}
 current():Trigger|undefined{return this.host.form().triggers.find(t=>t.id===this.id);}
 close(){if(!this.panel)return;this.panel='';this.returnPanel='';this.host.overlays.innerHTML='';this.anchor?.setAttribute('aria-expanded','false');if(this.anchor?.isConnected)this.anchor.focus();}
 open(panel:string,command:string){this.host.closeOther();this.panel=panel;this.error='';this.query='';this.anchor=[...document.querySelectorAll<HTMLElement>('[data-act]')].find(e=>e.dataset.act===command)??document.querySelector<HTMLElement>('[data-act="tr-add"]');this.anchor?.setAttribute('aria-expanded','true');this.render();}
 handle(command:string):boolean {
  if(!command.startsWith('sc-'))return false;
  const [act,...parts]=command.split(':'),value=parts.join(':');
  if(act==='sc-add'){this.id='';this.value='';this.zone=Intl.DateTimeFormat().resolvedOptions().timeZone;this.open('triggers','tr-add');}
  else if(act==='sc-scheduled'){this.panel='presets';this.render();}
  else if(act==='sc-webhook'){if(!this.host.form().triggers.some(t=>t.kind==='Webhook')){this.host.form().triggers.push({id:crypto.randomUUID(),kind:'Webhook',event:'Webhook Triggered',value:''});this.changed();}}
  else if(act==='sc-open'||act==='sc-custom'||act==='sc-zone'){
   this.id=value;const t=this.current();this.value=t?.value??'';this.zone=t?scheduleOf(t).timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone;
   this.open(act==='sc-open'?'presets':act==='sc-custom'?'custom':'zone',command);
  }else if(act==='sc-field'){
   this.field=parts.shift()!;this.id=parts.join(':');this.open('field',command);
  }else if(act==='sc-pick'){
   const t=this.current();if(t&&updateSchedule(t,this.field,value))this.changed();
  }else if(act==='sc-custom-zone'){
   this.returnPanel='custom';this.panel='zone';this.query='';this.render();
  }else if(act==='sc-preset'){
   const i=Number(value);if(!scheduleKinds[i])return true;
   if(i===3){this.panel='custom';this.render();return true;}
   const t=this.current();if(t){const s=scheduleOf(t);s.kind=scheduleKinds[i]!;t.schedule=s;t.value=presetCron(s);}else this.host.form().triggers.push(makePreset(i)!);
   this.changed();
  }else if(act==='sc-zone-pick'){
   if(this.returnPanel==='custom'){this.zone=value;this.returnPanel='';this.panel='custom';this.render();}
   else {const t=this.current();if(t&&updateSchedule(t,'zone',value))this.changed();}
  }else if(act==='sc-apply'){
   this.error=cronError(this.value)||(!timeZoneValid(this.zone)?'Select a valid timezone.':'');if(this.error){this.render();return true;}
   let t=this.current();if(!t){t=makePreset(3)!;this.host.form().triggers.push(t);}
   t.value=this.value.trim();t.schedule={...scheduleOf(t),kind:'custom',timeZone:this.zone};this.changed();
  }
  return true;
 }
 changed(){const command=this.anchor?.dataset.act;this.host.changed();this.close();this.host.render();if(command)[...document.querySelectorAll<HTMLElement>('[data-act]')].find(e=>e.dataset.act===command)?.focus();}
 input(input:HTMLInputElement):boolean {
  if(input.dataset.schedule){const t=this.host.form().triggers.find(t=>t.id===input.dataset.schedule);if(t&&updateSchedule(t,input.dataset.field!,input.value))this.host.changed();return true;}
  if(input.name==='sc-search'){this.query=input.value;this.render();return true;}
  if(input.name==='sc-cron'){
   this.value=input.value;this.error=cronError(this.value);
   input.setAttribute('aria-invalid',String(!!this.error));
   const error=this.host.overlays.querySelector<HTMLElement>('.sc-error');if(error){error.textContent=this.error;error.hidden=!this.error;}
   return true;
  }
  if(input.name==='sc-custom-zone'){this.zone=input.value;this.error='';return true;}
  return false;
 }
 render(){
  const root=this.host.overlays;root.innerHTML=this.panel==='triggers'?addTriggerMenu(this.host.form().triggers.some(t=>t.kind==='Webhook')):this.panel==='presets'?frequencyMenu(this.current()):this.panel==='field'?fieldMenu(this.current()!,this.field):this.panel==='zone'?timezoneMenu(this.query,this.returnPanel==='custom'?this.zone:this.current()?scheduleOf(this.current()!).timeZone:this.zone):customSchedule(this.value,this.zone,this.error);
  const pop=root.firstElementChild as HTMLElement,r=this.anchor?.getBoundingClientRect();if(r){pop.style.left=`${Math.max(8,Math.min(r.left,innerWidth-pop.offsetWidth-8))}px`;pop.style.top=`${r.bottom+pop.offsetHeight+4>innerHeight?Math.max(8,r.top-pop.offsetHeight-4):r.bottom+4}px`;}
  const focus=root.querySelector<HTMLInputElement>(this.panel==='custom'?'textarea':this.panel==='zone'?'input':'button');focus?.focus();if(this.panel==='zone')focus?.setSelectionRange(this.query.length,this.query.length);
 }
 key(e:KeyboardEvent):boolean {
  if(!this.panel)return false;
  if(e.key==='Escape'){e.preventDefault();if(this.returnPanel==='custom'){this.returnPanel='';this.panel='custom';this.render();return true;}if(this.blockInvalidDismissal())return true;this.close();return true;}
  if(this.panel==='custom'){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.handle('sc-apply');return true;}return false;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   e.preventDefault();const buttons=[...this.host.overlays.querySelectorAll<HTMLButtonElement>('button')],i=buttons.indexOf(document.activeElement as HTMLButtonElement),step=e.key==='ArrowDown'?1:-1;
   buttons[i<0?(step===1?0:buttons.length-1):(i+step+buttons.length)%buttons.length]?.focus();return true;
  }
  return false;
 }
 blockInvalidDismissal():boolean {if(this.panel!=='custom')return false;this.error=cronError(this.value)||(!timeZoneValid(this.zone)?'Select a valid timezone.':'');if(!this.error)return false;this.render();return true;}
 pointer(target:Node){if(this.panel&&!this.host.overlays.contains(target)&&!this.anchor?.contains(target)&&!this.blockInvalidDismissal())this.close();}
}
