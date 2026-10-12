import { mkdir, readFile, rename, writeFile, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
export class JsonFile<T> {
  file: string; initial: () => T; queue: Promise<unknown> = Promise.resolve();
  constructor(file: string, initial: () => T) { this.file=file; this.initial=initial; }
  async read(): Promise<T> {
    try { return JSON.parse(await readFile(this.file,'utf8')) as T; }
    catch(e) { if((e as NodeJS.ErrnoException).code==='ENOENT') return this.initial(); throw e; }
  }
  change<R>(update:(data:T)=>R|Promise<R>):Promise<R> {
    const action=this.queue.then(async()=>{
      const data=await this.read(), result=await update(data), temp=`${this.file}.${randomUUID()}.tmp`;
      await mkdir(dirname(this.file),{recursive:true,mode:0o700});
      try { await writeFile(temp,JSON.stringify(data),{mode:0o600}); await rename(temp,this.file); }
      finally { await rm(temp,{force:true}); }
      return result;
    });
    this.queue=action.catch(()=>undefined);return action;
  }
}
