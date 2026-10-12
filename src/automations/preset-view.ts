import { btn, esc, icon } from './view.ts';
import type { Trigger } from './model.ts';
import { validCron } from './model.ts';
import { cronFieldError, customDates, hours, referenceNext, weekdays } from './preset-state.ts';
export function presetRow(t:Trigger,fixture:boolean,preview?:string):string {
  const s=t.schedule!,title={hourly:'Every hour',daily:'Every day',weekly:'Every week',custom:'Custom schedule'}[s.kind];
  let zone='EDT';
  if(!fixture)try{zone=new Intl.DateTimeFormat('en',{timeZone:s.timeZone,timeZoneName:'short'}).formatToParts(new Date()).find(p=>p.type==='timeZoneName')?.value??'Local';}catch{zone='Local';}
  const control=(text:string,act:string,id:string)=>btn(`<span data-evidence="${id}-label">${esc(text)}</span>${icon('chevron')}`,act,'ed-cron',`data-evidence="${id}"`);
  const day=s.kind==='weekly'?`<span class="pr-between pr-on">on</span>${control(weekdays[s.day]!,`pr-day:${t.id}`,'pr-day')}`:'';
  const time=['daily','weekly'].includes(s.kind)?`<span class="pr-between pr-at">at</span>${control(s.time,`pr-time:${t.id}`,'pr-time')}<span class="pr-between pr-zone">${esc(zone)}</span>`:'';
  const cron=s.kind==='custom'?control(t.value,`tr-cron:${t.id}`,'pr-cron'):'';
  const next=fixture?referenceNext(t):'';
  return `<div class="ed-trigger-row tr-row pr-row" data-preset="${s.kind}" data-day="${weekdays[s.day]}" data-evidence="pr-row">
    <span class="tr-clock">${icon('clock')}</span><div class="ed-trigger-main"><span class="pr-title" data-evidence="pr-title">${title}</span>${day}${time}${cron}
    ${(preview===undefined||preview===t.value)&&next?`<span class="muted" data-evidence="pr-next">Next run ${next}</span>`:''}</div>
    ${btn(icon('close'),`remove-trigger:${t.id}`,'icon','aria-label="Remove trigger"')}</div>`;
}
export function presetWarning():string {
  return `<div class="pr-warning" data-evidence="pr-warning"><span aria-hidden="true">ⓘ</span><span data-evidence="pr-warning-label">Only the first cron trigger will be used</span></div>`;
}
export function presetMenu(kind:'time'|'day'):string {
  const items=kind==='time'?hours:weekdays;
  return `<div class="tr-pop pr-options" role="menu" aria-label="${kind==='time'?'Time':'Day'}" tabindex="-1" data-evidence="pr-menu">
    <div>${items.map((text,i)=>btn(`<span data-evidence="pr-option-label-${i}">${text}</span>`,`pr-choose:${kind}:${i}`,'',`role="menuitem" data-evidence="pr-option-${i}"`)).join('')}</div></div>`;
}
export function unsavedDialog():string {
  return `<dialog class="pr-unsaved" aria-labelledby="unsaved-title" data-evidence="pr-unsaved">
    <header data-evidence="pr-unsaved-header"><h2 id="unsaved-title" data-evidence="pr-unsaved-title">Unsaved Changes</h2>
    <p data-evidence="pr-unsaved-copy">Save or discard changes before continuing</p></header><div class="pr-unsaved-space"></div>
    <footer data-evidence="pr-unsaved-footer">${btn('Discard','discard','','data-evidence="pr-discard"')}
    <span></span>${btn('Keep Editing','dismiss','','data-evidence="pr-keep"')}${btn('Save','save','primary','data-evidence="pr-save"')}</footer></dialog>`;
}
export function validatedCronMenu(value:string,fixture:boolean,extraError=''):string {
  const error=cronFieldError(value)||extraError,noUpcoming=!error&&!validCron(value);
  const dates=fixture&&value==='0 13 1 * *'?customDates:null;
  return `<div class="tr-pop pv-cron" role="menu" aria-label="Cron expression editor" data-evidence="pv-cron">
    <div class="tr-cron-title"><label for="preset-cron"><span data-evidence="pv-title">Cron expression (UTC)</span></label></div>
    <div class="tr-cron-input"><input id="preset-cron" name="cron-expression" aria-label="Cron expression" aria-invalid="${!!error}"
      value="${esc(value)}" placeholder="0 * * * *" data-evidence="pv-input"></div>
    <div class="pv-hint ${error?'pv-error':''}"><span data-evidence="pv-hint">${esc(error||'5-7 fields or @daily/@hourly')}</span></div>
    ${error?'':dates?`<div class="pv-dates" data-evidence="pv-preview">${dates.map((d,i)=>`<div data-evidence="pv-date-${i}">${d}</div>`).join('')}</div>`:
      `<div class="pv-no-preview" data-evidence="pv-preview"><span data-evidence="pv-no-preview">${noUpcoming?'No upcoming runs to preview for this expression.':'Local preview unavailable'}</span></div>`}</div>`;
}
