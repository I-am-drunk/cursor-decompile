import type { Automation, Tool } from './model.ts';
import { blankMcp, parseMcp, serializeMcp, validateMcp } from './editor-state.ts';
import type { EditorModel, McpConfig, McpProvider } from './editor-state.ts';
import { browseMcp, mcpForm, modelMenu, toolsMenu } from './editor-view.ts';
interface Host {
  form:()=>Automation; render:()=>void; changed:()=>void; closeOther:()=>void;
  notify:(message:string)=>void; overlays:HTMLElement;
  api:<T>(path:string,method?:string,data?:unknown)=>Promise<T>;
}
export class EditorController {
  host:Host; models:EditorModel[]=[]; providers:McpProvider[]=[];
  panel=''; optionsFor=''; query=''; config=blankMcp(); json=false; text='';
  error=''; jsonHeight=156; editing=''; busy=false; anchor='ed-tools';
  constructor(host:Host){this.host=host;}
  close(){this.panel='';this.optionsFor='';this.host.overlays.innerHTML='';
    document.querySelector<HTMLButtonElement>(`[data-act="${this.anchor}"]`)?.focus();}
  open(panel:string){this.host.closeOther();this.panel=panel;this.error='';this.query='';
    if(panel==='models')this.anchor='ed-models';else if(panel==='tools')this.anchor='ed-tools';this.render();}
  async handle(command:string):Promise<boolean>{
    const [action,id='',value='']=command.split(':');
    if(action==='ed-tools'){this.open('tools');return true;}
    if(action==='ed-mcp-menu'){this.panel='mcp-menu';this.render();return true;}
    if(action==='ed-browse'){this.open('browse');return true;}
    if(action==='ed-close'){this.close();return true;}
    if(action==='ed-custom'){this.config=blankMcp();this.editing='';this.json=false;this.open('custom');return true;}
    if(action==='ed-models'){this.optionsFor='';this.open('models');return true;}
    if(action==='ed-provider'){this.host.notify('Provider authorization is not connected in this local build.');return true;}
    if(action==='ed-mcp-type'){this.collect();this.config.type=id==='command'?'command':'url';this.render();return true;}
    if(action==='ed-mcp-json'){
      try{if(this.json){this.config=parseMcp(this.text);this.json=false;}
        else{this.collect();this.text=serializeMcp(this.config);this.jsonHeight=this.config.type==='command'?198:156;this.json=true;}
        this.error='';}catch(e){this.error=(e as Error).message;}this.render();return true;
    }
    if(action==='ed-commit-mcp'){await this.commit();return true;}
    if(action==='ed-tool'){await this.edit(id);return true;}
    if(action==='ed-add-tool'){this.addTool(id);return true;}
    if(action==='ed-select-model'||action==='ed-model-options'){this.selectModel(id,action==='ed-model-options');return true;}
    if(action==='ed-param'){this.setParameter(id,value);return true;}
    return false;
  }
  collect(){
    const root=this.host.overlays, read=(name:string,fallback='')=>root.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value??fallback;
    if(this.json){this.text=read('mcp-json',this.text);return;}
    this.config.name=read('mcp-name',this.config.name);this.config.url=read('mcp-url',this.config.url);
    this.config.command=read('mcp-command',this.config.command);
    this.config.args=[...root.querySelectorAll<HTMLInputElement>('[name^="arg-"]')].map(e=>e.value).filter(Boolean);
    for(const key of ['headers','env'] as const){
      const entries=[...root.querySelectorAll<HTMLInputElement>(`[name^="${key}-key-"]`)]
        .map(e=>[e.value,read(`${key}-value-${e.name.split('-').at(-1)}`)]).filter(([k])=>k);
      if(entries.length||root.querySelector(`[name^="${key}-key-"]`)) this.config[key]=Object.fromEntries(entries);
    }
  }
  async commit(){
    if(this.busy)return;this.collect();this.busy=true;
    try{
      const config=this.json?parseMcp(this.text):this.config;validateMcp(config);
      const {ref}=await this.host.api<{ref:string}>('/api/configurations','POST',{text:serializeMcp(config)});
      const tool:Tool={id:this.editing||crypto.randomUUID(),kind:'MCP',name:config.name,url:'',configurationRef:ref};
      const a=this.host.form();a.tools=[...a.tools.filter(t=>t.id!==tool.id),tool];
      this.host.changed();this.close();this.host.render();this.host.notify('MCP configuration staged locally. Save the automation to keep this binding; no connection was authorized.');
    }catch(e){this.error=(e as Error).message;this.render();}finally{this.busy=false;}
  }
  async edit(id:string){
    const t=this.host.form().tools.find(t=>t.id===id);if(!t)return;
    if(t.kind!=='MCP'){this.host.notify('This integration requires a connected execution adapter.');return;}
    this.config=t.configurationRef?await this.host.api<McpConfig>(`/api/configurations/${t.configurationRef}`):{...blankMcp(),name:t.name,url:t.url};
    this.editing=id;this.json=false;this.open('custom');
  }
  addTool(name:string){
    const a=this.host.form();if(a.tools.some(t=>t.name===name))return;
    const kind:Tool['kind']=name==='Memories'?'Memories':name.includes('Slack')?'Slack':name.includes('Teams')?'Microsoft Teams':'Source Control';
    a.tools.push({id:crypto.randomUUID(),kind,name,url:''});this.host.changed();this.close();this.host.render();
  }
  selectModel(id:string,options:boolean){
    const m=this.models.find(m=>m.id===id);if(!m)return;
    const a=this.host.form();if(a.model!==id){a.model=id;a.modelParameters={...m.defaults};this.host.changed();}
    if(!a.modelParameters) a.modelParameters=id==='composer-2.5'?{fast:'false'}:{...m.defaults};
    this.optionsFor=options?id:'';this.host.render();if(options)this.render();else this.close();
  }
  setParameter(id:string,value:string){
    const a=this.host.form(),m=this.models.find(m=>m.id===a.model);
    if(!m?.parameters.some(p=>p.id===id&&p.options.some(o=>o.value===value)))return;
    a.modelParameters={...(a.modelParameters??m.defaults),[id]:value};
    this.host.changed();this.host.render();this.render();
  }
  render(){
    const root=this.host.overlays,focused=document.activeElement as HTMLInputElement,name=focused?.name,position=focused?.selectionStart;
    const a=this.host.form(),m=this.models.find(m=>m.id===a.model);
    if(this.panel==='tools'||this.panel==='mcp-menu')root.innerHTML=toolsMenu(a,this.panel==='mcp-menu');
    else if(this.panel==='browse')root.innerHTML=browseMcp(this.providers,this.query);
    else if(this.panel==='custom')root.innerHTML=mcpForm(this.config,this.json,this.text,this.error,this.jsonHeight);
    else if(this.panel==='models')root.innerHTML=modelMenu(this.models,a.model,a.modelParameters??(a.model==='composer-2.5'?{fast:'false'}:m?.defaults??{}),this.query,this.optionsFor);
    else return;
    const dialog=root.querySelector('dialog');if(dialog){dialog.addEventListener('cancel',e=>{e.preventDefault();this.close();});dialog.showModal();}
    this.position();
    const next=name?root.querySelector<HTMLInputElement>(`[name="${name}"]`):null;
    if(next){next.focus();if(position!==null)next.setSelectionRange(position,position);}
    else if(this.panel==='models')root.querySelector<HTMLInputElement>('input')?.focus();
    else if(this.panel==='browse')root.querySelector<HTMLInputElement>('input')?.focus();
    else if(!dialog)(root.firstElementChild as HTMLElement)?.focus();
  }
  position(){
    const root=this.host.overlays, pop=root.querySelector<HTMLElement>('.ed-pop');
    if(!pop)return;
    const anchor=document.querySelector<HTMLElement>(`[data-act="${this.anchor}"]`);if(!anchor)return;
    const r=anchor.getBoundingClientRect(),h=pop.offsetHeight;
    pop.style.left=`${Math.max(8,Math.min(r.left,innerWidth-pop.offsetWidth-8))}px`;
    pop.style.top=`${r.bottom+h+4>innerHeight?Math.max(8,r.top-h-4):r.bottom+4}px`;
    const sub=root.querySelector<HTMLElement>('.ed-mcp-menu');
    if(sub){const item=root.querySelector<HTMLElement>('[data-act="ed-mcp-menu"]')!.getBoundingClientRect();sub.style.left=`${pop.getBoundingClientRect().right-4}px`;sub.style.top=`${item.top}px`;}
    const opts=root.querySelector<HTMLElement>('.ed-model-options');
    if(opts){const item=root.querySelector<HTMLElement>(`[data-model="${this.optionsFor}"]`)!.getBoundingClientRect();opts.style.left=`${pop.getBoundingClientRect().right+2}px`;opts.style.top=`${Math.max(8,item.top+item.height/2-opts.offsetHeight/2)}px`;}
  }
  input(target:HTMLInputElement):boolean {
    if(!this.panel)return false;
    if(target.name==='provider-search'||target.name==='ed-model-search'){
      this.query=target.value;
      if(target.name==='ed-model-search')this.optionsFor='';
      this.render();return true;
    }
    if(this.panel==='custom'){this.collect();return true;}return false;
  }
  key(event:KeyboardEvent):boolean {
    if(!this.panel)return false;
    if(event.key==='Escape'){
      event.preventDefault();if(this.optionsFor){this.optionsFor='';this.render();}
      else if(this.panel==='mcp-menu'){this.panel='tools';this.render();}else this.close();return true;
    }
    const root=this.host.overlays,target=event.target as HTMLElement;
    if(this.panel==='models'&&event.key==='ArrowRight'){
      const row=target.closest<HTMLElement>('[data-model]');if(row){event.preventDefault();this.selectModel(row.dataset.model!,true);return true;}
    }
    if(this.panel==='models'&&(event.key==='Enter'||event.key===' ')&&target.matches('[data-model]')){
      event.preventDefault();this.selectModel(target.dataset.model!,false);return true;
    }
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      const items=[...root.querySelectorAll<HTMLElement>(this.panel==='models'?'[data-model]':'[role="menuitem"]:not(:disabled)')];
      if(!items.length)return false;event.preventDefault();
      const current=items.indexOf(document.activeElement as HTMLElement),delta=event.key==='ArrowDown'?1:-1;
      items[current<0?(delta===1?0:items.length-1):(current+delta+items.length)%items.length]?.focus();return true;
    }
    return false;
  }
  pointer(target:Node){
    if(!this.panel||this.host.overlays.querySelector('dialog'))return;
    if(!this.host.overlays.contains(target)&&!document.querySelector(`[data-act="${this.anchor}"]`)?.contains(target))this.close();
  }
  captureState():string {
    if(this.panel==='custom')return this.json?'mcp-json':this.config.type==='command'?'mcp-command':'mcp-url';
    if(this.panel==='models')return this.optionsFor?'model-options':'model-picker';
    return ({tools:'tools-menu','mcp-menu':'mcp-menu',browse:'mcp-browse'} as Record<string,string>)[this.panel]??'saved-editor';
  }
}
