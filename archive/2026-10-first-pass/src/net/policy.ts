import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { request as http } from 'node:http';
import { request as https } from 'node:https';
import type { RequestOptions } from 'node:https';
// Stricter than public-only: every host requires an explicit admin allowlist entry.
export async function destination(url:URL,hosts:string[],credential=false):Promise<RequestOptions>{
 const host=url.hostname.replace(/^\[|\]$/g,'').toLowerCase();
 if(url.username||url.password||!['https:','http:'].includes(url.protocol)||!hosts.some(h=>h.replace(/^\[|\]$/g,'').toLowerCase()===host))throw Error('Destination denied. Add this exact host to Settings → MCP Servers destination policy.');
 if(url.protocol==='http:'&&(credential||!['127.0.0.1','::1','localhost'].includes(host)))throw Error('HTTPS is required for credentials and non-loopback destinations.');
 const address=isIP(host)?{address:host,family:isIP(host)}:await lookup(host);
 // Resolve once; the socket uses this exact checked address. Redirects are never followed.
 return {hostname:host,port:url.port||undefined,path:url.pathname+url.search,servername:isIP(host)?undefined:host,
  lookup:((_host:unknown,options:unknown,callback:Function)=>{
   if((options as {all?:boolean}).all)callback(null,[address]);else callback(null,address.address,address.family);
  }) as RequestOptions['lookup']};
}
export async function postJson(url:URL,hosts:string[],payload:unknown,token=''):Promise<Record<string,unknown>>{
 const options=await destination(url,hosts,true),form=payload instanceof URLSearchParams;
 const body=form?payload.toString():JSON.stringify(payload);
 return new Promise((resolve,reject)=>{
  const req=(url.protocol==='https:'?https:http)({...options,method:'POST',headers:{'Content-Type':form?'application/x-www-form-urlencoded':'application/json','Content-Length':Buffer.byteLength(body),...(token?{Authorization:`Bearer ${token}`}:{})}},res=>{
   let size=0;const chunks:Buffer[]=[];
   res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>1048576)res.destroy(Error('Response too large'));else chunks.push(chunk);});
   res.on('error',reject);res.on('end',()=>{
    if(res.statusCode!==200){reject(Error(res.statusCode===401||res.statusCode===403?'Pairing expired or revoked. Pair again.':`Environment request failed (${res.statusCode}).`));return;}
    try{resolve(JSON.parse(Buffer.concat(chunks).toString()) as Record<string,unknown>);}catch{reject(Error('Invalid environment response.'));}
   });
  });req.setTimeout(15000,()=>req.destroy(Error('Environment request timed out.')));req.on('error',()=>reject(Error('Environment connection failed.')));req.end(body);
 });
}
