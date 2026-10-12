// DESIGN: local domain, deliberately not Cursor's private wire protocol.
export const triggerKinds = ['Schedule', 'Webhook', 'Linear', 'GitHub', 'Slack', 'PagerDuty'] as const;
export type TriggerKind = typeof triggerKinds[number];
export interface Schedule {kind:'hourly'|'daily'|'weekly'|'custom';time:string;day:number;timeZone:string}
export interface Trigger { id: string; kind: TriggerKind; event: string; value: string; schedule?:Schedule }
export interface Tool { id: string; kind: 'MCP' | 'Memories' | 'Slack' | 'Microsoft Teams' | 'Source Control'; name: string; url: string; configurationRef?: string; serverId?:string; allowedTools?:string[]|'all'; approval?:'ask'|'auto'; scope?:'user'|'workspace' }
export interface Automation {
  id: string; revision: number; name: string; prompt: string; enabled: boolean;
  scope: 'mine' | 'team'; model: string; repositories: string[];
  triggers: Trigger[]; tools: Tool[]; createdAt: string; ownerName?: string;
  modelParameters?: Record<string,string>; branch?: string; userId?:string;
}
export interface Run {
  id: string; automationId: string; name: string;
  status: 'running' | 'succeeded' | 'failed' | 'skipped' | 'cancelled';
  createdAt: string; output: string; model: string; fixture?: boolean;
  completedAt?: string; tools?: string[]; testRun?: boolean;
  failure?: { code: string; title: string; message: string; ctaLabel?: string };
}
export interface State { automations: Automation[]; runs: Run[] }
export const emptyState = (): State => ({ automations: [], runs: [] });
export const draft = (): Automation => ({
  id: '', revision: 0, name: '', prompt: '', enabled: false, scope: 'mine',
  model: 'composer-2.5', repositories: [], triggers: [], tools: [], createdAt: '',
});
export const events: Record<TriggerKind, string[]> = {
  Schedule: ['Cron'], Webhook: ['Webhook Triggered'],
  Linear: ['Issue created', 'Status changed', 'End of cycle'],
  GitHub: ['Pull request opened', 'Pull request updated', 'Push'],
  Slack: ['Message posted'], PagerDuty: ['Incident triggered', 'Incident resolved'],
};
export function validate(a: Automation): string[] {
  const errors: string[] = [];
  if (!a.name.trim()) errors.push('Enter an automation name.');
  if (a.name.length > 200) errors.push('Name must be 200 characters or fewer.');
  if (a.enabled && !a.prompt.trim()) errors.push('Add a prompt before activating.');
  if (a.enabled && !a.triggers.length) errors.push('Add a trigger before activating.');
  if (a.repositories.some(r => !/^[\w.-]+\/[\w.-]+$/.test(r))) errors.push('Use owner/repository.');
  for (const t of a.triggers) {
    if (t.kind === 'Schedule' && !validCron(t.value)) errors.push('Use numeric cron fields or a supported @ alias.');
    if (!events[t.kind].includes(t.event)) errors.push('Choose a supported trigger event.');
  }
  if (a.triggers.filter(t => t.kind === 'Webhook').length > 1) errors.push('Only one webhook trigger is allowed.');
  for (const t of a.tools.filter(t => t.kind === 'MCP')) {
    if (!t.name.trim()) errors.push('Name the MCP server.');
    if(t.configurationRef||t.serverId) continue;
    try { const u = new URL(t.url); if (u.protocol !== 'https:' || u.username || u.password) throw Error(); }
    catch { errors.push('MCP requires an HTTPS URL without credentials.'); }
  }
  if (!a.model.trim()) errors.push('Choose a model.');
  return errors;
}
export function validCron(value: string): boolean {
  // DESIGN: bounded local syntax validation, not a scheduler or vendor parser.
  const text=value.trim();
  if(['@hourly','@daily','@midnight','@weekly','@monthly','@yearly','@annually'].includes(text))return true;
  const parts=text.split(/\s+/),ranges=[[0,59],[0,23],[1,31],[1,12],[0,7]];
  if(parts.length===6||parts.length===7)ranges.unshift([0,59]);
  if(parts.length===7)ranges.push([1970,9999]);
  return parts.length>=5 && parts.length<=7 && parts.every((part, index) => part.split(',').every(piece => {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(piece);
    if (!match || (match[2] && (!Number.isSafeInteger(Number(match[2])) || Number(match[2]) < 1))) return false;
    if (match[1] === '*') return true;
    const nums=match[1]!.split('-').map(Number),[min,max]=ranges[index]!;
    return nums.every(n=>n>=min!&&n<=max!) && (nums.length<2||nums[0]!<=nums[1]!);
  }));
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.length <= 32000;
export function parseAutomation(v: unknown): Automation {
  if (object(v) && v.ownerName !== undefined && !text(v.ownerName))
    throw new Error('Invalid automation owner.');
  if(object(v) && v.userId!==undefined && !text(v.userId)) throw new Error('Invalid user id.');
  if(object(v) && v.branch!==undefined && !text(v.branch)) throw new Error('Invalid branch.');
  if(object(v) && v.modelParameters!==undefined && (!object(v.modelParameters) ||
    !Object.entries(v.modelParameters).every(([k,x])=>k.length<80&&text(x)))) throw new Error('Invalid model parameters.');
  if (!object(v) || !['id','name','prompt','model','createdAt'].every(k => text(v[k])) ||
      typeof v.enabled !== 'boolean' || !['mine','team'].includes(String(v.scope)) ||
      !Number.isSafeInteger(v.revision) || Number(v.revision) < 0 ||
      !Array.isArray(v.repositories) || v.repositories.length > 50 || !v.repositories.every(text) ||
      !Array.isArray(v.triggers) || v.triggers.length > 50 || !v.triggers.every(t => object(t) &&
        ['id','kind','event','value'].every(k => text(t[k])) && triggerKinds.includes(t.kind as TriggerKind)) ||
      !Array.isArray(v.tools) || v.tools.length > 50 || !v.tools.every(t => object(t) &&
        ['id','kind','name','url'].every(k => text(t[k])) &&
        (t.configurationRef===undefined||text(t.configurationRef)) &&
        ['MCP','Memories','Slack','Microsoft Teams','Source Control'].includes(String(t.kind))))
    throw new Error('Invalid automation payload.');
  const a = structuredClone(v as unknown as Automation);
  for(const t of a.tools){
    if(t.serverId!==undefined&&!text(t.serverId))throw Error('Invalid MCP server id.');
    if(t.allowedTools!==undefined&&t.allowedTools!=='all'&&(!Array.isArray(t.allowedTools)||t.allowedTools.length>1000||!t.allowedTools.every(text)))throw Error('Invalid MCP tool grants.');
    if(t.serverId){t.allowedTools??=[];t.approval??='ask';}
    if(t.scope!==undefined&&!['user','workspace'].includes(t.scope))throw Error('Invalid MCP scope.');
    if(t.approval!==undefined&&!['ask','auto'].includes(t.approval))throw Error('Invalid MCP approval.');
  }
  for(const t of a.triggers)if(t.schedule!==undefined){
    const s=t.schedule;
    if(t.kind!=='Schedule'||!object(s)||!['hourly','daily','weekly','custom'].includes(s.kind)||
      !hoursValid(s.time)||!Number.isInteger(s.day)||s.day<0||s.day>6||!text(s.timeZone)||!validTimeZone(s.timeZone))
      throw new Error('Invalid schedule metadata.');
  }
  if ([a.triggers, a.tools].some(items => new Set(items.map(t => t.id)).size !== items.length))
    throw new Error('Duplicate configuration IDs.');
  return structuredClone(a);
}
const hoursValid=(v:unknown):v is string=>typeof v==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v);

function validTimeZone(zone:string):boolean {try {new Intl.DateTimeFormat('en',{timeZone:zone});return !!zone;}catch{return false;}}
