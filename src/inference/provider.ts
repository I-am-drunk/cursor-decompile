export interface ProviderModel {id:string;name:string;providerId:string;instanceId:string;slug:string;capabilities:unknown}
export interface TurnEvent {sequence:number;kind:'message'|'activity'|'status';id:string;text:string;status?:'succeeded'|'failed'|'cancelled'}
export interface TurnInput {runId:string;modelId:string;prompt:string;title:string}
export interface InferenceProvider {
 id:string;
 models():Promise<ProviderModel[]>;
 turn(input:TurnInput,emit:(event:TurnEvent)=>Promise<void>,signal:AbortSignal):Promise<void>;
 estimate(input:TurnInput):Promise<number|null>;
}
export class ProviderRegistry {
 providers=new Map<string,InferenceProvider>();
 add(provider:InferenceProvider){this.providers.set(provider.id,provider);}
 async models(){return (await Promise.all([...this.providers.values()].map(p=>p.models()))).flat();}
 async forModel(id:string){for(const p of this.providers.values())if((await p.models()).some(m=>m.id===id))return p;throw Error('Selected model is unavailable. Connect inference and select a discovered model.');}
}
