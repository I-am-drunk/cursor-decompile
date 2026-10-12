import type { Tool } from '@modelcontextprotocol/sdk/types.js';
const text={type:'string'};
const revision={type:'integer',minimum:1};
const id={id:text};
const edit={...id,revision};
const object={type:'object'};
const trigger={type:'object',properties:{kind:{type:'string',enum:['Schedule','Webhook','Linear','GitHub','Slack','PagerDuty']},event:text,value:text},required:['kind','event','value']};
const definition={type:'object',properties:{name:text,prompt:text,model:text,enabled:{type:'boolean'},repositories:{type:'array',items:text},triggers:{type:'array',items:object},tools:{type:'array',items:object}},required:['name','prompt','model']};
function tool(name:string,description:string,properties:Record<string,object>,required:string[]=Object.keys(properties),readOnly=false):Tool{
 return {name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint:readOnly,destructiveHint:['automations_delete','triggers_remove','runs_cancel'].includes(name),openWorldHint:name==='runs_trigger'}};
}
export const tools:Tool[]=[
 tool('inference_pair','Pair or reconnect the configured environment with its saved write-only credential.',{}),
 tool('inference_status','Read current inference connection state.',{},[],true),
 tool('mcp_servers_list','Read server registry and five-state connection results.',{},[],true),
 tool('mcp_servers_save','Create or update registry configuration. Credentials and environment are write-only.',{server:object}),
 tool('mcp_servers_delete','Remove a registry entry; automation references become missing.',edit),
 tool('mcp_servers_probe','Connect to a registered destination and discover its tools. Stdio can execute code.',id),
 tool('automations_list','List all automation definitions.',{},[],true),
 tool('automations_get','Read one automation.',id,undefined,true),
 tool('automations_create','Create an automation with an explicitly selected discovered model.',{definition}),
 tool('automations_update','Update definition fields at the supplied revision.',{...edit,patch:object}),
 tool('automations_delete','Permanently delete a definition; retain run history.',edit),
 tool('automations_duplicate','Duplicate a definition, disabled by default.',{...id,name:text},['id']),
 tool('automations_enable','Enable a validated automation definition. This does not install a scheduler.',edit),
 tool('automations_disable','Disable a definition.',edit),
 tool('triggers_add','Add a trigger; revision prevents lost updates.',{...edit,trigger}),
 tool('triggers_update','Edit a trigger.',{...edit,triggerId:text,trigger}),
 tool('triggers_remove','Remove a trigger.',{...edit,triggerId:text}),
 tool('runs_list','List transcripts/status, optionally for one automation.',{automationId:text},[],true),
 tool('runs_get','Read run status and transcript.',id,undefined,true),
 tool('runs_trigger','Start one real provider turn. May execute tools in the paired environment.',id),
 tool('runs_cancel','Request interruption of an active turn.',id),
 tool('models_list','List currently discovered environment models; never invent defaults.',{},[],true),
 tool('settings_get','Read settings with credential presence, never credential values.',{},[],true),
 tool('settings_update','Persist a section at its current revision. Credentials are write-only.',{section:{type:'string',enum:['account','inference','integrations','mcp','automations']},revision:{type:'integer',minimum:0},values:object})
];
