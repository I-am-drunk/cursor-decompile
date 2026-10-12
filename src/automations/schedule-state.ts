import { validCron } from './model.ts';
import type { Trigger, Schedule } from './model.ts';
export const scheduleLabels = ['Every hour','Every day','Every week','Custom schedule'];
export const scheduleKinds = ['hourly','daily','weekly','custom'] as const;
export function timeZoneValid(zone:string):boolean {
  try {new Intl.DateTimeFormat('en',{timeZone:zone}).format();return !!zone;}catch{return false;}
}
export function scheduleOf(trigger:Trigger):Schedule {
  return structuredClone(trigger.schedule??{kind:'custom',time:'09:00',day:1,timeZone:'UTC'});
}
export function presetCron(schedule:Schedule):string {
  const [hour,minute]=schedule.time.split(':').map(Number);
  return `${minute} ${schedule.kind==='hourly'?'*':hour} * * ${schedule.kind==='weekly'?schedule.day:'*'}`;
}
export function updateSchedule(trigger:Trigger,field:string,value:string):boolean {
  const s=scheduleOf(trigger);
  if(field==='time'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value))s.time=value;
  else if(field==='minute'&&/^\d{1,2}$/.test(value)&&Number(value)<60)s.time=`${s.time.slice(0,3)}${value.padStart(2,'0')}`;
  else if(field==='day'&&/^[0-6]$/.test(value))s.day=Number(value);
  else if(field==='zone'&&timeZoneValid(value))s.timeZone=value;
  else return false;
  trigger.schedule=s;
  if(s.kind!=='custom')trigger.value=presetCron(s);
  return true;
}
export function cronError(value:string):string {
  return validCron(value)?'':'Enter a valid cron expression: 5–7 numeric fields or @daily/@hourly.';
}
