import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
test('external SDK client connects to the executable stdio server',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mcp-stdio-'));
 const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../main.ts',import.meta.url))],env:{DATA_FILE:join(dir,'data'),PORT:'0'},stderr:'pipe'});
 transport.stderr?.on('data',()=>{});const client=new Client({name:'external-stdio-client',version:'1'});
 try{await client.connect(transport);assert.equal((await client.listTools()).tools.length,24);
  const result=await client.callTool({name:'automations_create',arguments:{definition:{name:'Stdio created',model:'explicit-test-model',prompt:'test'}}});assert.ok(!result.isError);
  assert.match(JSON.stringify(await client.callTool({name:'automations_list'})),/Stdio created/);
 }finally{await client.close();await transport.close();}
});
