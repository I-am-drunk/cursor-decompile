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
  '/editor-models.json': ['automations/editor-models.json', 'application/json'],
  '/mcp-catalog.json': ['automations/mcp-catalog.json', 'application/json'],
  '/editor.css': ['automations/editor.css', 'text/css'],
  '/catalog.json': ['automations/catalog.json', 'application/json'],
  '/style.css': ['automations/style.css', 'text/css'],
};
export async function buildHash() {
  const hash = createHash('sha256');
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
export function createApp(store: Store) {
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
        return json(res, 200, await store.save(input));
      }
      const match = /^\/api\/automations\/([\w-]+)(\/runs)?$/.exec(path);
      if (match && req.method === 'DELETE' && !match[2]) {
        await store.remove(match[1]!, Number(url.searchParams.get('revision')));
        return json(res, 200, { deleted: true });
      }
      if (match?.[2] && req.method === 'POST') return json(res, 200, await store.start(match[1]!));
      if (path.startsWith('/api/')) throw new RequestError(404, 'Unknown endpoint.');
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new RequestError(405, 'Method not allowed.');
      const file = files[path];
      if (file) {
        let content = await readFile(new URL(file[0], root), 'utf8');
        if (file[0].endsWith('.ts')) content = stripTypeScriptTypes(content);
        res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
        return res.end(content);
      }
      if (path === '/' || /^\/automations(?:\/[\w-]+)?$/.test(path)) {
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
