import type { ProviderModel } from './provider.ts';
export const T3_REVISION='6c8fed35dded9ff71c5b46807125457acbb76be6';
export const T3_VERSION='0.0.45';
export function parseConfig(input:unknown):{version:string;models:ProviderModel[]}{
 const config=input as {environment?:{serverVersion?:string};providers?:unknown[]};
 if(config?.environment?.serverVersion!==T3_VERSION)throw Error(`Incompatible T3 server version. Supported: ${T3_VERSION} (audit ${T3_REVISION.slice(0,7)}).`);
 if(!Array.isArray(config.providers))throw Error('Incompatible T3 provider catalog.');
 const models:ProviderModel[]=[];
 for(const raw of config.providers){
  const p=raw as {instanceId:string;driver:string;enabled:boolean;installed:boolean;availability?:string;auth?:{status:string};models:{slug:string;name:string;capabilities:unknown}[]};
  if(!p||typeof p.instanceId!=='string'||!Array.isArray(p.models))throw Error('Incompatible T3 provider instance.');
  if(!p.enabled||!p.installed||p.availability==='unavailable'||p.auth?.status==='unauthenticated')continue;
  for(const m of p.models){
   if(!m||typeof m.slug!=='string'||typeof m.name!=='string')throw Error('Incompatible T3 model.');
   const id='t3.'+Buffer.from(JSON.stringify([p.instanceId,m.slug])).toString('base64url');
   models.push({id,name:m.name,providerId:'t3',instanceId:p.instanceId,slug:m.slug,capabilities:m.capabilities??null});
  }
 }
 return {version:config.environment.serverVersion,models};
}
