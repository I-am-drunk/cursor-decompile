import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
const server=new Server({name:'probe-fixture',version:'1'},{capabilities:{tools:{}}});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:[{name:process.env.MCP_PARENT_SECRET?'leaked':'isolated',description:'Explicit local probe fixture',inputSchema:{type:'object'}}]}));
await server.connect(new StdioServerTransport());
