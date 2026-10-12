import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { service } from './support.ts';
import { SdkMcpClient } from '../client.ts';
import { createMcpHttp } from '../http.ts';
test('registry SDK client probes stdio with isolated environment and explicit execution opt-in',async()=>{
 const s=await service();s.registry.client=new SdkMcpClient(s.settings);
 const entry=await s.registry.save({name:'Fixture',transport:'stdio',command:process.execPath,args:[fileURLToPath(new URL('./probe-fixture.ts',import.meta.url))]});
 assert.equal((await s.registry.probe(entry.id)).state,'error');
 await s.settings.update({revision:0,section:'mcp',values:{allowStdio:true}});
 process.env.MCP_PARENT_SECRET='must-not-leak';
 try{const result=await s.registry.probe(entry.id);assert.equal(result.state,'connected',result.message);assert.deepEqual(result.tools,['isolated']);}
 finally{delete process.env.MCP_PARENT_SECRET;}
});
test('remote probes obey destination policy and identify missing/expired authentication',async()=>{
 const s=await service(),server=createMcpHttp(s,'test-token-'.repeat(4));await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
 const address=server.address();assert.ok(address&&typeof address!=='string');s.registry.client=new SdkMcpClient(s.settings);
 const entry=await s.registry.save({name:'HTTP',url:`http://127.0.0.1:${address.port}/mcp`});
 try{
  assert.equal((await s.registry.probe(entry.id)).state,'error');
  await s.settings.update({revision:0,section:'mcp',values:{allowedHosts:['127.0.0.1']}});
  assert.equal((await s.registry.probe(entry.id)).state,'needs auth');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
test('registry completes Streamable HTTP handshake and tool discovery',async()=>{
 const {createServer}=await import('node:http');
 const {StreamableHTTPServerTransport}=await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
 const {createMcpServer}=await import('../server.ts');
 const s=await service(),mcp=createMcpServer(s),transport=new StreamableHTTPServerTransport({sessionIdGenerator:()=>crypto.randomUUID()});await mcp.connect(transport);
 const server=createServer((req,res)=>{void transport.handleRequest(req,res);});await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
 const address=server.address();assert.ok(address&&typeof address!=='string');
 await s.settings.update({revision:0,section:'mcp',values:{allowedHosts:['127.0.0.1']}});s.registry.client=new SdkMcpClient(s.settings);
 const entry=await s.registry.save({name:'HTTP fixture',url:`http://127.0.0.1:${address.port}/mcp`});
 try{const result=await s.registry.probe(entry.id);assert.equal(result.state,'connected',result.message);assert.ok(result.tools.includes('automations_list'));}
 finally{await mcp.close();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
