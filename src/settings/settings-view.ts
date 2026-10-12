// Original read-only views; identity is always a local placeholder.
export const settingsPages=[['Overview','/dashboard','⌂'],['Settings','/dashboard/settings','☷'],['Integrations','/dashboard/integrations','♧'],['Spending','/dashboard/spending','◴']] as const;
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const evidence=(id:string)=>`data-evidence="st-${id}"`;
const button=(copy:string,id:string,extra='')=>`<button type="button" data-unavailable ${evidence(id)} ${extra}>${copy}</button>`;
export function settingsShell(path:string):string {
  const title=settingsPages.find(p=>p[1]===path)?.[0]??'Settings';
  return `<aside ${evidence('side')} aria-label="Settings sidebar">
    <header><a href="/automations?state=upgrade" aria-label="Back to Agents"><span>‹</span><b aria-hidden="true">◈</b><span ${evidence('agents')}>Agents</span></a><button data-unavailable aria-label="Search">⌕</button></header>
    <nav ${evidence('nav')} aria-label="Account navigation">${settingsPages.map(([name,href,glyph],i)=>`${i>1?'<div class="nav-space"></div>':''}<a href="${href}" ${evidence(name.toLowerCase())} ${path===href?'aria-current="page"':''}><span aria-hidden="true">${glyph}</span><span>${name}</span></a>`).join('')}</nav>
    <div class="sidebar-bottom">${button('✧ &nbsp; Upgrade to Pro','upgrade')}
    <button class="user" data-user-menu aria-haspopup="menu" ${evidence('user')} aria-label="User menu"><span class="avatar">L</span><span>Local preview<small>Free</small></span><span>⋯</span></button></div>
  </aside><main><h1 ${evidence('title')}>${title}</h1>${path==='/dashboard/settings'?accountPanel():path==='/dashboard'?overviewPanel():'<section class="unverified"><h2>UNVERIFIED panel</h2><p>Navigation is captured; this panel awaits its own evidence slice.</p></section>'}</main>`;
}
const heading=(text:string,id:string)=>`<h2 ${evidence(id+'-head')}>${text}</h2>`;
const row=(label:string,id:string,control:string,kind='')=>`<div class="setting-row ${kind}" ${evidence(id+'-row')}><div class="setting-label" ${evidence(id+'-label')}>${label}</div><div class="setting-value">${control}</div></div>`;
export function accountPanel():string {
  return `<section class="account-panel">${heading('Privacy','privacy')}
  <div class="privacy-card card" ${evidence('privacy')}><div><div class="privacy-title">Privacy Mode <span>Active</span></div><p ${evidence('privacy-copy')}>Your code data will not be trained on or used to improve the product. Code may be stored for Cloud Agent, Team Rules, and other features.</p></div>${button('Edit','edit')}</div>
  <div class="learn">${button('Learn More','learn')}</div>
  ${heading('Profile','profile')}<div class="profile-card card" ${evidence('profile')}>
  ${row('Email','email','<span class="email">local@example.invalid</span>')}
  ${row('Profile Image','image',`<div class="profile-image"><span class="avatar">L</span>${button('Upload image','upload')}<small>PNG, JPEG, or WebP up to 2 MB</small></div>`,'image-row')}
  ${row('First Name','first','<input aria-label="First name" value="Local" readonly data-evidence="st-first">')}
  ${row('Last Name','last','<input aria-label="Last name" value="Preview" readonly data-evidence="st-last">')}
  ${row('Handle','handle',button('Claim handle','claim'))}
  <div class="links" role="group" aria-label="Profile page links">${row('Link 1','link','<input aria-label="Link 1" placeholder="x.com/handle" readonly data-evidence="st-link">')}${row('','add',button('Add link','add-link'))}</div>
  <div class="setting-row public-row"><div><div ${evidence('public-label')}>Public profile</div><p ${evidence('public-copy')}>When enabled, your cursor.com profile page is visible to anyone with the link.</p></div>${button('<span></span>','public','role="switch" aria-label="Public profile" aria-checked="false"')}</div>
  <footer>${button('Save','save','disabled aria-disabled="true"')}</footer></div>
  <p class="local-note">Read-only local preview. Identity is synthetic; account changes and lower settings panels are unavailable.</p></section>`;
}
export function overviewPanel():string {
  return `<section class="overview"><div class="overview-grid">
    <div class="card usage" ${evidence('usage')}><div ${evidence('usage-title')}>Your included usage</div><div class="usage-middle"><span ${evidence('usage-value')}>0% used</span><div class="progress"></div></div><div>Resets &nbsp; Oct 29, 2026</div></div>
    <div class="card plan" ${evidence('plan')}><div class="plan-title">Pro <small>$20 /mo.</small></div><p ${evidence('plan-copy')}>Entry-level plan with access to premium models, unlimited Tab completions, and more.</p>${button('Upgrade to Pro','plan-upgrade')}</div>
  </div><p class="local-note">Reference-derived preview, not live usage or a purchase offer. No team/admin panel was observed for the captured Free account.</p>
  <div class="download card" ${evidence('download')}><span aria-hidden="true">▣</span><div><span ${evidence('download-title')}>Download the Desktop App</span><small ${evidence('download-copy')}>Open your code and keep building locally.</small></div><button data-unavailable aria-label="Dismiss">×</button></div></section>`;
}
export function settingsUserMenu():string {
  return `<div class="user-menu" role="menu" tabindex="-1" aria-label="User menu" ${evidence('menu')}>
    <div class="menu-profile"><div>Local preview</div><small>local@example.invalid</small>${button('✧ &nbsp; Upgrade to Pro','menu-upgrade')}</div><hr>
    ${menuRow('Download Cursor','download','↓')}${menuRow('Appearance','appearance','◐','System ›')}${menuRow('Help','help','?','›')}<hr>${menuRow('Log Out','logout','⇥')}
  </div>`;
}
function menuRow(label:string,id:string,glyph:string,after=''):string {
  return `<button role="menuitem" data-unavailable ${evidence('menu-'+id)}><span class="menu-symbol" aria-hidden="true">${glyph}</span><span ${evidence('menu-'+id+'-label')}>${escape(label)}</span>${after?`<small>${after}</small>`:''}</button>`;
}
