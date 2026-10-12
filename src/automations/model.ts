// DESIGN: local domain, deliberately not Cursor's private wire protocol.
export const triggerKinds = ['Schedule', 'Webhook', 'Linear', 'GitHub', 'Slack', 'PagerDuty'] as const;
export type TriggerKind = typeof triggerKinds[number];
export interface Trigger { id: string; kind: TriggerKind; event: string; value: string }
export interface Tool { id: string; kind: 'MCP' | 'Memories' | 'Slack' | 'Microsoft Teams' | 'Source Control'; name: string; url: string; configurationRef?: string }
export interface Automation {
  id: string; revision: number; name: string; prompt: string; enabled: boolean;
  scope: 'mine' | 'team'; model: string; repositories: string[];
  triggers: Trigger[]; tools: Tool[]; createdAt: string; ownerName?: string;
  modelParameters?: Record<string,string>; branch?: string;
}
export interface Run {
  id: string; automationId: string; name: string;
  status: 'running' | 'succeeded' | 'failed' | 'skipped';
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
    if (t.kind === 'Schedule' && !validCron(t.value)) errors.push('Use a five-field cron expression.');
    if (!events[t.kind].includes(t.event)) errors.push('Choose a supported trigger event.');
  }
  if (a.triggers.filter(t => t.kind === 'Webhook').length > 1) errors.push('Only one webhook trigger is allowed.');
  for (const t of a.tools.filter(t => t.kind === 'MCP')) {
    if (!t.name.trim()) errors.push('Name the MCP server.');
    if(t.configurationRef) continue;
    try { const u = new URL(t.url); if (u.protocol !== 'https:' || u.username || u.password) throw Error(); }
    catch { errors.push('MCP requires an HTTPS URL without credentials.'); }
  }
  if (!a.model.trim()) errors.push('Choose a model.');
  return errors;
}
export function validCron(value: string): boolean {
  const parts = value.trim().split(/\s+/), ranges = [59, 23, 31, 12, 7];
  return parts.length === 5 && parts.every((part, index) => part.split(',').every(piece => {
    const match = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(piece);
    if (!match || (match[2] && Number(match[2]) < 1)) return false;
    if (match[1] === '*') return true;
    const nums = match[1]!.split('-').map(Number), min = index === 2 || index === 3 ? 1 : 0;
    return nums.every(n => n >= min && n <= ranges[index]!) && (nums.length < 2 || nums[0]! <= nums[1]!);
  }));
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.length <= 32000;
export function parseAutomation(v: unknown): Automation {
  if (object(v) && v.ownerName !== undefined && !text(v.ownerName))
    throw new Error('Invalid automation owner.');
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
  const a = v as unknown as Automation;
  if ([a.triggers, a.tools].some(items => new Set(items.map(t => t.id)).size !== items.length))
    throw new Error('Duplicate configuration IDs.');
  return structuredClone(a);
}
