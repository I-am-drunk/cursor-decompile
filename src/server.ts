import { McpRegistry } from './mcp/registry.ts';
import { T3Bridge } from './inference/t3.ts';
import { RunEngine } from './inference/runtime.ts';
import { ProviderRegistry } from './inference/provider.ts';
import { AuthStore, cookieToken, sessionCookie } from './auth/store.ts';
import { SettingsStore } from './settings/store.ts';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { parseAutomation } from './automations/model.ts';
import { RequestError, Store } from './store.ts';
const root = new URL('./', import.meta.url);
const files: Record<string, [string, string]> = {
  '/mcp/settings-ui.ts':['mcp/settings-ui.ts','application/javascript'],
  '/inference/settings-ui.ts':['inference/settings-ui.ts','application/javascript'],
  '/auth/login.ts':['auth/login.ts','application/javascript'],
  '/login.css':['auth/login.css','text/css'],
  '/settings/live-app.ts':['settings/live-app.ts','application/javascript'],
  '/settings/live-view.ts':['settings/live-view.ts','application/javascript'],
  '/settings/schema.ts':['settings/schema.ts','application/javascript'],
  '/live-settings.css':['settings/live.css','text/css'],
  '/shell/sidebar.ts': ['shell/sidebar.ts','application/javascript'],
  '/sidebar.css': ['shell/sidebar.css','text/css'],
  '/settings-app.ts': ['settings/settings-app.ts','application/javascript'],
  '/settings-view.ts': ['settings/settings-view.ts','application/javascript'],
  '/settings.css': ['settings/settings.css','text/css'],
  '/app.ts': ['automations/app.ts', 'application/javascript'],
  '/model.ts': ['automations/model.ts', 'application/javascript'],
  '/view.ts': ['automations/view.ts', 'application/javascript'],
  '/row-data.ts': ['automations/row-data.ts', 'application/javascript'],
  '/editor-state.ts': ['automations/editor-state.ts', 'application/javascript'],
  '/editor-view.ts': ['automations/editor-view.ts', 'application/javascript'],
  '/editor-controller.ts': ['automations/editor-controller.ts', 'application/javascript'],
  '/trigger-controller.ts': ['automations/trigger-controller.ts', 'application/javascript'],
  '/trigger-view.ts': ['automations/trigger-view.ts', 'application/javascript'],
  '/trigger.css': ['automations/trigger.css', 'text/css'],
  '/preset-state.ts': ['automations/preset-state.ts', 'application/javascript'],
  '/preset-view.ts': ['automations/preset-view.ts', 'application/javascript'],
  '/preset.css': ['automations/preset.css', 'text/css'],
  '/connection-view.ts': ['automations/connection-view.ts', 'application/javascript'],
  '/connection.css': ['automations/connection.css', 'text/css'],
  '/run-filter-state.ts': ['automations/run-filter-state.ts', 'application/javascript'],
  '/run-filter-view.ts': ['automations/run-filter-view.ts', 'application/javascript'],
  '/run-filter-controller.ts': ['automations/run-filter-controller.ts', 'application/javascript'],
  '/run-filter.css': ['automations/run-filter.css', 'text/css'],
  '/editor-models.json': ['automations/editor-models.json', 'application/json'],
  '/mcp-catalog.json': ['automations/mcp-catalog.json', 'application/json'],
  '/editor.css': ['automations/editor.css', 'text/css'],
  '/catalog.json': ['automations/catalog.json', 'application/json'],
  '/style.css': ['automations/style.css', 'text/css'],
};
for(const value of Object.values(files)) if(value[0].endsWith('.ts')) files['/'+value[0]]=value;
export async function buildHash() {
  const hash = createHash('sha256');
  hash.update(await readFile(new URL('index.html',root)));
  hash.update(await readFile(new URL('settings/index.html',root)));
  hash.update(await readFile(new URL('settings/live.html',root)));
  for (const [path] of Object.values(files)) hash.update(await readFile(new URL(path, root)));
  return hash.digest('hex');
}
function json(res: ServerResponse, code: number, data: unknown) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
async function body(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= 65536) chunks.push(Buffer.from(chunk));
  }
  if (size > 65536) throw new RequestError(413, 'Request too large.');
  try { return JSON.parse(Buffer.concat(chunks).toString()); }
  catch { throw new RequestError(400, 'Expected JSON.'); }
}
export interface AppOptions { settings?:SettingsStore; auth?:AuthStore; inference?:T3Bridge; registry?:McpRegistry }
export function createApp(store: Store, options:AppOptions={}) {
  const settings=options.settings??new SettingsStore(store.file+'.settings');
  const auth=options.auth??new AuthStore(store.file+'.auth');
  const inference=options.inference??new T3Bridge(settings),providers=new ProviderRegistry();providers.add(inference);
  store.adapter??=new RunEngine(store,providers);
  const registry=options.registry??new McpRegistry(store.file+'.mcp');
  const attempts=new Map<string,{count:number;until:number}>();
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try {
      const host = req.headers.host ?? '', origin = `http://${host}`;
      if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) throw new RequestError(403, 'Local host required.');
      const url = new URL(req.url ?? '/', origin), path = url.pathname;
      if (!['GET', 'HEAD'].includes(req.method ?? '') &&
          (req.headers['x-local-request'] !== '1' || (req.headers.origin && req.headers.origin !== origin)))
        throw new RequestError(403, 'Same-origin local request required.');
      const token=cookieToken(req.headers.cookie??''), identity=await auth.identify(token);
      if(path==='/api/auth/status'&&req.method==='GET')return json(res,200,{configured:await auth.configured(),identity});
      if(['/api/auth/login','/api/auth/register'].includes(path)&&req.method==='POST'){
        const key=req.socket.remoteAddress??'local',now=Date.now();
        if(attempts.size>1000)attempts.clear();
        let limit=attempts.get(key);if(!limit||limit.until<now){limit={count:0,until:now+60000};attempts.set(key,limit);}
        if(++limit.count>10)throw new RequestError(429,'Too many attempts. Try again in a minute.');
        const input=await body(req) as {email?:unknown;password?:unknown};
        if(!input||typeof input.email!=='string'||typeof input.password!=='string')throw new RequestError(400,'Email and password required.');
        const signed=path.endsWith('/register')?await auth.register(input.email,input.password):await auth.login(input.email,input.password);
        attempts.delete(key);res.setHeader('Set-Cookie',sessionCookie(signed.token));return json(res,200,{identity:signed.identity});
      }
      if(path==='/login'&&req.method==='GET'){
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        return res.end(await readFile(new URL('auth/login.html',root)));
      }
      if(!identity&&!files[path]){
        if(path.startsWith('/api/'))throw new RequestError(401,'Sign in required.');
        res.writeHead(303,{Location:'/login','Cache-Control':'no-store'});return res.end();
      }
      if(path==='/api/auth/logout'&&req.method==='POST'){
        await auth.logout(token);res.setHeader('Set-Cookie',sessionCookie(''));return json(res,200,{signedOut:true});
      }
      if(path==='/api/mcp-servers'&&req.method==='GET')return json(res,200,await registry.list());
      if(path==='/api/mcp-servers'&&req.method==='POST')return json(res,200,await registry.save(await body(req)));
      const mcp=/^\/api\/mcp-servers\/([\w-]+)(\/probe)?$/.exec(path);
      if(mcp&&req.method==='DELETE'&&!mcp[2]){await registry.remove(mcp[1]!,Number(url.searchParams.get('revision')));return json(res,200,{deleted:true});}
      if(mcp&&req.method==='POST'&&mcp[2])return json(res,200,await registry.probe(mcp[1]!));
      const bindings=/^\/api\/automations\/([\w-]+)\/mcp$/.exec(path);
      if(bindings&&req.method==='GET'){
        const a=(await store.read()).automations.find(a=>a.id===bindings[1]);if(!a)throw new RequestError(404,'Automation not found.');
        return json(res,200,await Promise.all(a.tools.filter(t=>t.kind==='MCP').map(async tool=>({tool,...await registry.resolve(tool)}))));
      }
      if(path==='/api/inference'&&req.method==='GET')return json(res,200,{...inference.state,projects:inference.projects});
      if(path==='/api/inference/pair'&&req.method==='POST'){
        try{await inference.pair();}catch{return json(res,502,inference.state);}return json(res,200,{...inference.state,projects:inference.projects});
      }
      if(path==='/api/inference/disconnect'&&req.method==='POST'){await inference.disconnect();return json(res,200,inference.state);}
      if(path==='/api/models'&&req.method==='GET')return json(res,200,await providers.models());
      const cancel=/^\/api\/runs\/([\w-]+)\/cancel$/.exec(path);
      if(cancel&&req.method==='POST'){await store.cancel(cancel[1]!);return json(res,202,{cancellationRequested:true});}
      if(path==='/api/settings'&&req.method==='GET')return json(res,200,await settings.read());
      if(path==='/api/settings'&&req.method==='PATCH'){
        const input=await body(req) as {section?:string;values?:Record<string,unknown>};
        if(input?.section==='inference'&&(await store.read()).runs.some(r=>r.status==='running'))throw new RequestError(409,'Finish or cancel active runs before changing inference.');
        const result=await settings.update(input);
        if(input?.section==='inference'&&['url','credential','credentialKind'].some(k=>input.values&&k in input.values))await inference.disconnect();
        return json(res,200,result);
      }
      if (path === '/api/state' && req.method === 'GET') return json(res, 200, await store.read());
      if (path === '/api/build' && req.method === 'GET') return json(res, 200, { hash: await buildHash() });
      if(path.startsWith('/api/configurations')) {
        if(req.headers['x-local-request']!=='1'||(req.headers.origin&&req.headers.origin!==origin))
          throw new RequestError(403,'Same-origin local request required.');
        if(path==='/api/configurations'&&req.method==='POST'){
          const input=await body(req);
          if(!input||typeof input!=='object'||!('text' in input)||typeof input.text!=='string')
            throw new RequestError(400,'Expected MCP JSON text.');
          try{return json(res,200,await store.addConfiguration(input.text));}
          catch(e){if(e instanceof RequestError)throw e;throw new RequestError(400,(e as Error).message);}
        }
        const ref=/^\/api\/configurations\/([\w-]+)$/.exec(path);
        if(ref&&req.method==='GET') return json(res,200,await store.getConfiguration(ref[1]!));
      }
      if (path === '/api/automations' && req.method === 'POST') {
        let input: unknown;
        try { input = parseAutomation(await body(req)); }
        catch (e) { if (e instanceof RequestError) throw e; throw new RequestError(400, 'Invalid automation payload.'); }
        return json(res, 200, await store.save({...input as object,userId:identity!.id}));
      }
      const match = /^\/api\/automations\/([\w-]+)(\/runs)?$/.exec(path);
      if (match && req.method === 'DELETE' && !match[2]) {
        await store.remove(match[1]!, Number(url.searchParams.get('revision')));
        return json(res, 200, { deleted: true });
      }
      if (match?.[2] && req.method === 'POST') return json(res, 200, await store.start(match[1]!));
      if (path.startsWith('/api/')) throw new RequestError(404, 'Unknown endpoint.');
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new RequestError(405, 'Method not allowed.');
      if(/^\/settings(?:\/(account|inference|integrations|mcp|automations))?$/.test(path)){
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        return res.end(await readFile(new URL('settings/live.html',root)));
      }
      if(['/dashboard','/dashboard/settings','/dashboard/integrations','/dashboard/spending'].includes(path)){
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        return res.end(await readFile(new URL('settings/index.html',root)));
      }
      const file = files[path];
      if (file) {
        let content = await readFile(new URL(file[0], root), 'utf8');
        if (file[0].endsWith('.ts')) content = stripTypeScriptTypes(content);
        res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
        return res.end(content);
      }
      if (['/','/chat','/search'].includes(path) || /^\/automations(?:\/[\w-]+)?$/.test(path)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(await readFile(new URL('index.html', root)));
      }
      throw new RequestError(404, 'Not found.');
    } catch (e) {
      json(res, e instanceof RequestError ? e.status : 500,
        { error: e instanceof RequestError ? e.message : 'Local server error.' });
    }
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT ?? 4317);
  createApp(new Store(resolve(process.env.DATA_FILE ?? '.local/automations.json')))
    .listen(port, '127.0.0.1', () => console.log(`Automations: http://127.0.0.1:${port}/automations`));
}
