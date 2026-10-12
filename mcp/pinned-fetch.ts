import { request as http } from 'node:http';
import { request as https } from 'node:https';
import { Readable } from 'node:stream';
import { destination } from '../src/net/policy.ts';
export function pinnedFetch(hosts:string[],authenticated:boolean):typeof fetch{
 return async(input,init)=>{
  const request=new Request(input,init),url=new URL(request.url),headers=Object.fromEntries(request.headers);
  const options=await destination(url,hosts,authenticated||request.headers.has('authorization'));
  const body=request.method==='GET'||request.method==='HEAD'?undefined:Buffer.from(await request.arrayBuffer());
  if(body&&body.length>1048576)throw Error('Request too large.');
  return new Promise<Response>((resolve,reject)=>{
   const req=(url.protocol==='https:'?https:http)({...options,method:request.method,headers,signal:request.signal},res=>{
    if(res.statusCode!>=300&&res.statusCode!<400){res.resume();reject(Error('MCP redirects are denied.'));return;}
    let size=0;res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>1048576)res.destroy(Error('MCP response too large.'));});
    const responseHeaders=new Headers();for(const [k,v] of Object.entries(res.headers))if(v!==undefined)responseHeaders.set(k,Array.isArray(v)?v.join(', '):v);
    const noBody=request.method==='HEAD'||[204,304].includes(res.statusCode!);
    resolve(new Response(noBody?null:Readable.toWeb(res) as ReadableStream<Uint8Array>,{status:res.statusCode,headers:responseHeaders}));
   });req.setTimeout(10000,()=>req.destroy(Error('MCP connection timed out.')));req.on('error',()=>reject(Error('MCP destination unavailable.')));req.end(body);
  });
 };
}
