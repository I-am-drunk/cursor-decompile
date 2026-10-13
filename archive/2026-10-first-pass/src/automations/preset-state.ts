import type { Trigger } from './model.ts';
export const presetKinds=['hourly','daily','weekly','custom'] as const;
export const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const hours=Array.from({length:24},(_,i)=>`${String(i).padStart(2,'0')}:00`);
export function makePreset(index:number):Trigger|undefined {
  const kind=presetKinds[index];if(!kind)return;
  // Wall-time metadata is local policy, not the reference product’s wire protocol or a scheduler.
  return {id:crypto.randomUUID(),kind:'Schedule',event:'Cron',
    value:['0 * * * *','0 9 * * *','0 9 * * 1','0 13 1 * *'][index]!,
    schedule:{kind,time:'09:00',day:1,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone}};
}
export function cronFieldError(value:string):string {
  if(!value.trim())return 'Cron expression is required';
  if(value.trim().startsWith('@'))return '';
  const count=value.trim().split(/\s+/).length;
  return count<5||count>7?`Expected 5-7 fields (min hour day month weekday), got ${count}`:'';
}
export const customDates=['Sun, Nov 1, 8:00 a.m. EST','Tue, Dec 1, 8:00 a.m. EST','Fri, Jan 1, 8:00 a.m. EST','…'];
export function referenceNext(t:Trigger):string {
  const s=t.schedule;if(!s)return '';
  if(s.kind==='custom')return t.value==='0 13 1 * *'?customDates[0]!:'';
  if(s.kind==='hourly')return 'Mon, Oct 12, 9:07 a.m. EDT';
  if(s.kind==='daily')return s.time==='10:00'?'Mon, Oct 12, 10:00 a.m. EDT':s.time==='09:00'?'Mon, Oct 12, 9:00 a.m. EDT':'';
  return s.day===2&&s.time==='09:00'?'Tue, Oct 13, 9:00 a.m. EDT':s.day===1&&s.time==='09:00'?'Mon, Oct 12, 9:00 a.m. EDT':'';
}
