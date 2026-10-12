export interface Settings {
  revision:number;
  account:{displayName:string;theme:'system'|'light'|'dark'};
  inference:{url:string;name:string;credentialPresent:boolean;defaultModel:string;projectId:string;credentialKind:string};
  integrations:{linearEnabled:boolean;credentialPresent:boolean};
  mcp:{allowStdio:boolean;allowedHosts:string[]};
  automations:{timezone:string;retentionDays:number;concurrency:number};
}
export const defaultSettings=():Settings=>({revision:0,account:{displayName:'Local user',theme:'system'},
  inference:{url:'',name:'T3 Code Connect',credentialPresent:false,defaultModel:'',projectId:'',credentialKind:'bootstrap'},
  integrations:{linearEnabled:false,credentialPresent:false},mcp:{allowStdio:false,allowedHosts:[]},
  automations:{timezone:'UTC',retentionDays:30,concurrency:1}});
export const sections=['account','inference','integrations','mcp','automations'] as const;
export type Section=typeof sections[number];
