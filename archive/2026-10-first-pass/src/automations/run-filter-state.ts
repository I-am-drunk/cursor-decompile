export const runStatuses=['running','failed','succeeded','skipped'] as const;
export function parseRunStatuses(value:string):string[] {
  return [...new Set(value.split(',').filter(v=>runStatuses.some(s=>s===v)))];
}
export function toggleRunStatus(value:string,status:string):string[] {
  const selected=parseRunStatuses(value);
  if(!runStatuses.some(s=>s===status))return selected;
  return selected.includes(status)?selected.filter(s=>s!==status):[...selected,status];
}
export const statusLabel=(value:string)=>value[0]!.toUpperCase()+value.slice(1);
