import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createMcpHttp } from '../http.ts';
import { service } from './support.ts';
test('Streamable HTTP initializes, authenticates and invokes management tools',async()=>{
 const management=await service(),token='local-test-token-'.repeat(3),server=createMcpHttp(management,token);
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address!=='string');
 const url=new URL(`http://127.0.0.1:${address.port}/mcp`),headers={Authorization:`Bearer ${token}`};
 const client=new Client({name:'external-http-client',version:'1'});
 try{
  assert.equal((await fetch(url)).status,401);
  assert.equal((await fetch(url,{headers:{...headers,Origin:'https://attacker.invalid'}})).status,403);
  assert.equal((await fetch(url,{headers:{...headers,'mcp-session-id':'not-real'}})).status,404);
  await client.connect(new StreamableHTTPClientTransport(url,{requestInit:{headers}}));
  assert.equal((await client.listTools()).tools.length,24);
  const created=await client.callTool({name:'automations_create',arguments:{definition:{name:'HTTP created',model:'fixture-model',prompt:'Review'}}});assert.ok(!created.isError);
  assert.equal((await management.store.read()).automations[0]!.name,'HTTP created');
  assert.equal((await client.listPrompts()).prompts.length,1);
 }finally{await client.close();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
