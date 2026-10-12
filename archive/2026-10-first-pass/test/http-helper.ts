export async function signIn(base:string){
 const response=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json','X-Local-Request':'1'},body:JSON.stringify({email:'local@example.invalid',password:'test-only-passphrase'})});
 if(!response.ok)throw Error('Test account setup failed');
 const cookie=response.headers.get('set-cookie')!.split(';')[0]!;
 return (path:string,options:RequestInit={})=>{
  const headers=new Headers(options.headers);headers.set('Cookie',cookie);
  return fetch(base+path,{...options,headers});
 };
}
