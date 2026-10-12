import { btn, esc, icon } from './view.ts';
import type { Trigger } from './model.ts';
import { scheduleKinds, scheduleLabels, scheduleOf } from './schedule-state.ts';
import { weekdays } from './preset-state.ts';
export function scheduleRow(t:Trigger):string {
  const s=scheduleOf(t),index=scheduleKinds.indexOf(s.kind);
  const picker=(field:string,label:string,value:string)=>btn(`${esc(value)}${icon('chevron')}`,`sc-field:${field}:${t.id}`,'sc-chip',`aria-label="${label}" aria-haspopup="listbox" aria-expanded="false"`);
  const day=s.kind==='weekly'?`<span>on</span>${picker('day','Select weekday',weekdays[s.day]!)}`:'';
  const time=s.kind==='custom'?'':`<span>${s.kind==='hourly'?'at minute':'at'}</span><span class="sc-time">${s.kind==='hourly'?'':`${picker('hour','Select hour',s.time.slice(0,2))}<span>:</span>`}${picker('minute','Minute within hour',s.time.slice(3))}</span>`;
  return `<div class="ed-trigger-row sc-row" role="group" aria-label="Schedule"><span class="tr-clock">${icon('clock')}</span><div class="sc-phrase">
    ${btn(`${scheduleLabels[index]} ${icon('chevron')}`,`sc-open:${t.id}`,'sc-frequency sc-chip','aria-haspopup="dialog" aria-expanded="false"')}${day}${time}
    ${s.kind==='custom'?btn(esc(t.value),`sc-custom:${t.id}`,'sc-cron sc-chip','aria-haspopup="dialog"'):''}
    ${s.kind==='daily'||s.kind==='weekly'?zoneButton(s.timeZone,`sc-zone:${t.id}`):''}</div>
    ${btn(icon('close'),`remove-trigger:${t.id}`,'icon','aria-label="Remove trigger"')}</div>`;
}
export function frequencyMenu(t?:Trigger):string {
 return `<div class="tr-pop tr-schedules sc-presets" role="dialog" aria-label="Schedule frequency">${scheduleLabels.map((label,i)=>btn(`<span>${label}</span>${t?.schedule?.kind===scheduleKinds[i]?icon('check'):''}`,`sc-preset:${i}`,'','')).join('')}</div>`;
}
export function timezoneLabel(zone:string,at=new Date()):string {
 const part=(timeZoneName:'longOffset'|'longGeneric')=>new Intl.DateTimeFormat('en-US',{timeZone:zone,timeZoneName}).formatToParts(at).find(p=>p.type==='timeZoneName')!.value;
 return `(${part('longOffset').replace(/^GMT$/, 'GMT+00:00')}) ${part('longGeneric')}${zone==='UTC'?'':` - ${zone.split('/').at(-1)!.replaceAll('_',' ')}`}`;
}
export function zoneButton(zone:string,command:string):string {
 return btn(`<span>${esc(timezoneLabel(zone))}</span>${icon('chevron')}`,command,'sc-zone sc-chip','aria-label="Select timezone" aria-haspopup="dialog" aria-expanded="false"');
}
export function timezoneMenu(query:string,current:string):string {
 const zones=[...new Set([...Intl.supportedValuesOf('timeZone'),current])].filter(z=>z!=='UTC').sort((a,b)=>a.split('/').at(-1)!.localeCompare(b.split('/').at(-1)!));zones.push('UTC');
 const options=zones.map(zone=>({zone,label:timezoneLabel(zone)})).filter(o=>`${o.zone} ${o.label}`.toLowerCase().includes(query.trim().toLowerCase()));
 return `<div class="tr-pop sc-timezones" role="dialog" aria-label="Select timezone"><div class="sc-search"><input name="sc-search" aria-label="Search timezones" placeholder="Search timezones" value="${esc(query)}"></div><div class="sc-zone-list" role="listbox">${options.map(({zone,label})=>btn(`<span>${esc(label)}</span>${zone===current?icon('check'):''}`,`sc-zone-pick:${zone}`,'',`role="option" aria-selected="${zone===current}"`)).join('')||'<p>No timezones found</p>'}</div></div>`;
}
export function customSchedule(value:string,zone:string,error:string):string {
 return `<div class="tr-pop sc-custom" role="dialog" aria-label="Custom schedule">
 <label for="sc-cron">Cron expression</label><textarea id="sc-cron" name="sc-cron" rows="3" spellcheck="false" aria-invalid="${!!error}" aria-describedby="sc-hint">${esc(value)}</textarea>
 <p id="sc-hint">min hour day month weekday</p>${zoneButton(zone,'sc-custom-zone')}
 <p class="sc-error" role="alert" ${error?'':'hidden'}>${esc(error)}</p>
 <footer>${btn('Apply','sc-apply','primary')}</footer></div>`;
}

export function addTriggerMenu(hasWebhook:boolean):string {
 return `<div class="tr-pop tr-schedules sc-presets" role="dialog" aria-label="Add Trigger">
 ${btn(`${icon('clock')}<span>Scheduled</span>›`,'sc-scheduled')}
 ${btn(`${icon('plug')}<span>Webhook Triggered</span>`,'sc-webhook','',hasWebhook?'disabled':'')}</div>`;
}

export function fieldMenu(t:Trigger,field:string):string {
 const s=scheduleOf(t),selected=field==='day'?String(s.day):field==='hour'?s.time.slice(0,2):s.time.slice(3);
 const values=field==='day'?[1,2,3,4,5,6,0].map(n=>[String(n),weekdays[n]!]):field==='hour'?Array.from({length:24},(_,n)=>[String(n).padStart(2,'0'),String(n).padStart(2,'0')]):[...new Set([...Array.from({length:12},(_,n)=>String(n*5).padStart(2,'0')),selected])].sort().map(n=>[n,n]);
 return `<div class="tr-pop pr-options sc-options" role="listbox" aria-label="${field==='day'?'Select weekday':field==='hour'?'Select hour':'Minute within hour'}"><div>${values.map(([value,label])=>btn(`<span>${label}</span>${value===selected?icon('check'):''}`,`sc-pick:${value}`,'',`role="option" aria-selected="${value===selected}"`)).join('')}</div></div>`;
}
