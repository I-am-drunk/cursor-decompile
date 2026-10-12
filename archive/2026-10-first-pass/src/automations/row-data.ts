import type { Automation, Run } from './model.ts';
import { draft } from './model.ts';
// Reference-derived fixture, never persisted or presented as a live local execution.
export const referenceTime = Date.parse('2026-10-12T07:41:52.810Z');
export function referenceRun(): Run {
  return { id:'observed-failure',automationId:'evidence-automation',
    name:'C-AUTOMATIONS TEST 2026-10-12 A - disabled',model:'composer-2.5',
    status:'failed',createdAt:'2026-10-12T07:38:43.000Z',completedAt:'2026-10-12T07:38:43.000Z',
    output:'',tools:[],testRun:true,fixture:true,failure:{
      code:'CLOUD_AGENT_PLAN_RESTRICTED',title:'Cloud Agents require a paid plan',
      message:'Cloud Agents are not available on Free or Pro Trial plans. Upgrade to a paid plan to run automations with Cloud Agents.',
      ctaLabel:'Upgrade',
    }};
}
export function referenceAutomation(): Automation {
  return {...draft(),id:'evidence-automation',name:referenceRun().name,revision:1,
    createdAt:'2026-10-12T07:36:06.000Z',ownerName:'Example owner',
    prompt:'Return only the word OK.',triggers:[{id:'annual',kind:'Schedule',event:'Cron',value:'0 0 1 1 *'}]};
}
export function runTime(value: string, year = false, locale?: string, timeZone?: string): string {
  if (!Number.isFinite(Date.parse(value))) return '—';
  return new Intl.DateTimeFormat(locale,{month:'short',day:'numeric',...(year?{year:'numeric'} as const:{}),
    hour:'numeric',minute:'2-digit',...(timeZone?{timeZone}:{})}).format(new Date(value));
}
export function runDuration(run: Run, now = Date.now()): string {
  const duration=(run.completedAt?Date.parse(run.completedAt):now)-Date.parse(run.createdAt);
  if (!Number.isFinite(duration)||duration<0) return '—';
  if (duration<60000) return '< 1m';
  const minutes=Math.floor(duration/60000);
  return minutes<60?`${minutes}m`:`${Math.floor(minutes/60)}h ${minutes%60}m`;
}
export function shortAge(value: string, now = Date.now()): string {
  const seconds=Math.max(0,Math.floor((now-Date.parse(value))/1000));
  if (!Number.isFinite(seconds)) return '—';
  if (seconds<60) return 'now';
  if (seconds<3600) return `${Math.floor(seconds/60)}m`;
  if (seconds<86400) return `${Math.floor(seconds/3600)}h`;
  return `${Math.floor(seconds/86400)}d`;
}
