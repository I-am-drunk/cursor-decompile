import { btn, esc, icon } from './view.ts';
import type { Trigger } from './model.ts';
import { scheduleKinds, scheduleLabels, scheduleOf } from './schedule-state.ts';
import { weekdays } from './preset-state.ts';
export function scheduleRow(t:Trigger):string {
  const s=scheduleOf(t),index=scheduleKinds.indexOf(s.kind);
  const field=(name:string,html:string)=>`<label class="sc-inline">${html.replace('name=',`data-schedule="${esc(t.id)}" name="sc-${name}" data-field=`)}</label>`;
  const day=s.kind==='weekly'?`<span>on</span>${field('day',`<select aria-label="Weekday" name="day">${weekdays.map((d,i)=>`<option value="${i}" ${i===s.day?'selected':''}>${d}</option>`).join('')}</select>`)}`:'';
  const time=s.kind==='hourly'?`<span>at minute</span>${field('minute',`<input aria-label="Minute" type="number" min="0" max="59" name="minute" value="${Number(s.time.slice(3))}">`)}`:s.kind!=='custom'?`<span>at</span>${field('time',`<input aria-label="Time" type="time" name="time" value="${s.time}">`)}`:'';
  return `<div class="sc-row" role="group" aria-label="Schedule">${icon('clock')}<div class="sc-phrase">
    ${btn(`${scheduleLabels[index]} ${icon('chevron')}`,`sc-open:${t.id}`,'sc-frequency','aria-haspopup="dialog" aria-expanded="false"')}${day}${time}
    ${s.kind==='custom'?btn(esc(t.value),`sc-custom:${t.id}`,'sc-cron','aria-haspopup="dialog"'):''}
    ${btn(esc(s.timeZone),`sc-zone:${t.id}`,'sc-zone','aria-label="Select timezone" aria-haspopup="dialog"')}</div>
    ${btn(icon('close'),`remove-trigger:${t.id}`,'icon','aria-label="Remove trigger"')}</div>`;
}
export function frequencyMenu(t?:Trigger):string {
 return `<div class="tr-pop sc-pop sc-presets" role="dialog" aria-label="Schedule frequency">${scheduleLabels.map((label,i)=>btn(`${icon('clock')}<span>${label}</span>${t?.schedule?.kind===scheduleKinds[i]?icon('check'):''}`,`sc-preset:${i}`,'','')).join('')}</div>`;
}
export function timezoneMenu(query:string,current:string):string {
 const zones=[...new Set([current,'UTC',...Intl.supportedValuesOf('timeZone')])].filter(z=>z.toLowerCase().includes(query.toLowerCase()));
 return `<div class="tr-pop sc-pop" role="dialog" aria-label="Select timezone"><input name="sc-search" aria-label="Search timezones" placeholder="Search timezones" value="${esc(query)}"><div class="sc-zone-list">${zones.map(z=>btn(`${esc(z)}${z===current?' ✓':''}`,`sc-zone-pick:${z}`)).join('')||'<p>No timezones found</p>'}</div></div>`;
}
export function customSchedule(value:string,zone:string,error:string):string {
 return `<div class="tr-pop sc-pop sc-custom" role="dialog" aria-label="Custom schedule"><h3>Custom schedule</h3>
 <label for="sc-cron">Cron expression</label><textarea id="sc-cron" name="sc-cron" rows="3" spellcheck="false" placeholder="0 9 * * 1" aria-invalid="${!!error}" aria-describedby="sc-hint">${esc(value)}</textarea>
 <p id="sc-hint">5–7 fields or @daily/@hourly</p><label>Timezone<input name="sc-custom-zone" aria-label="Custom schedule timezone" list="sc-zones" value="${esc(zone)}"></label>
 <datalist id="sc-zones">${['UTC',...Intl.supportedValuesOf('timeZone')].map(z=>`<option value="${esc(z)}"></option>`).join('')}</datalist>
 ${error?`<p class="sc-error" role="alert">${esc(error)}</p>`:''}<footer>${btn('Cancel','sc-cancel')}${btn('Apply','sc-apply','primary')}</footer></div>`;
}
