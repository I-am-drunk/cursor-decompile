import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { JsonFile } from '../persistence.ts';
import { RequestError } from '../store.ts';
const derive=promisify(scrypt), lifetime=7*24*60*60*1000;
export interface Identity {id:string;email:string;role:'admin'}
interface Account extends Identity {salt:string;hash:string}
interface AuthData {account:Account|null;sessions:{hash:string;userId:string;expires:number}[]}
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
export class AuthStore {
 disk:JsonFile<AuthData>;
 constructor(file:string){this.disk=new JsonFile(file,()=>({account:null,sessions:[]}));}
 async configured(){return !!(await this.disk.read()).account;}
 async register(email:string,password:string){
  validate(email,password);
  const salt=randomBytes(16).toString('hex'),hash=(await derive(password,salt,64) as Buffer).toString('hex');
  return this.disk.change(s=>{
   if(s.account)throw new RequestError(409,'Local account already exists. Sign in.');
   s.account={id:randomUUID(),email:email.trim().toLowerCase(),role:'admin',salt,hash};
   return this.session(s);
  });
 }
 async login(email:string,password:string){
  validate(email,password);
  const data=await this.disk.read(), account=data.account;
  const hash=await derive(password,account?.salt??'unconfigured-local-account',64) as Buffer;
  if(!account||!timingSafeEqual(hash,Buffer.from(account.hash,'hex'))||email.trim().toLowerCase()!==account.email)throw new RequestError(401,'Invalid email or password.');
  return this.disk.change(s=>this.session(s));
 }
 private session(data:AuthData){
  const token=randomBytes(32).toString('base64url'),user=data.account!;
  data.sessions=data.sessions.filter(s=>s.expires>Date.now()).slice(-9);
  data.sessions.push({hash:digest(token),userId:user.id,expires:Date.now()+lifetime});
  return {token,identity:{id:user.id,email:user.email,role:user.role}};
 }
 async identify(token:string):Promise<Identity|null>{
  if(!/^[\w-]{43}$/.test(token))return null;
  const s=await this.disk.read(),session=s.sessions.find(t=>t.hash===digest(token)&&t.expires>Date.now());
  const user=s.account;
  return session&&user&&session.userId===user.id?{id:user.id,email:user.email,role:user.role}:null;
 }
 async logout(token:string){await this.disk.change(s=>{s.sessions=s.sessions.filter(t=>t.hash!==digest(token));});}
}
function validate(email:string,password:string){
 if(typeof email!=='string'||email.length>254||!/^\S+@\S+\.\S+$/.test(email.trim())||typeof password!=='string'||password.length<12||password.length>1024)throw new RequestError(400,'Use a valid email and a password of 12–1024 characters.');
}
export const sessionCookie=(token:string)=>`workspace_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${token?lifetime/1000:0}`;
export const cookieToken=(cookie:string)=>cookie.split(';').map(p=>p.trim()).find(p=>p.startsWith('workspace_session='))?.slice(18)??'';
