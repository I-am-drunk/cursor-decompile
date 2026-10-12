const form=document.querySelector<HTMLFormElement>('form')!,button=form.querySelector('button')!,error=document.querySelector<HTMLElement>('#error')!;
let configured=true;
void fetch('/api/auth/status').then(r=>r.json()).then(s=>{
 if(s.identity){location.replace('/automations');return;}configured=s.configured;
 if(!configured){document.querySelector('#title')!.textContent='Create local account';button.textContent='Create account';form.querySelector<HTMLInputElement>('[name=password]')!.autocomplete='new-password';}
}).catch(()=>{error.textContent='Cannot reach local server.';});
form.addEventListener('submit',e=>{
 e.preventDefault();button.disabled=true;error.textContent='';const data=new FormData(form);
 void fetch(`/api/auth/${configured?'login':'register'}`,{method:'POST',headers:{'Content-Type':'application/json','X-Local-Request':'1'},body:JSON.stringify(Object.fromEntries(data))}).then(async r=>{const result=await r.json();if(!r.ok)throw Error(result.error);form.reset();location.replace('/automations');}).catch(e=>{error.textContent=e.message;}).finally(()=>{button.disabled=false;});
});
