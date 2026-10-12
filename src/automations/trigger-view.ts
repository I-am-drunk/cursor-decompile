import { btn, esc, icon } from './view.ts';
export const triggerChoices=['Scheduled','Slack','Microsoft Teams','Sentry','Linear','Webhook Triggered','PagerDuty'] as const;
export const scheduleChoices=['Hourly','Daily','Weekly','Custom (cron)'] as const;
export const observedDates=['Thu, Dec 31, 7:00 p.m. EST','Fri, Dec 31, 7:00 p.m. EST','Sun, Dec 31, 7:00 p.m. EST','…'];
export function triggerMenu(query:string,submenu:boolean):string {
  const choices=triggerChoices.filter(name=>name.toLowerCase().includes(query.toLowerCase()));
  return `<div class="tr-pop tr-menu" role="dialog" aria-label="Triggers" data-evidence="tr-menu">
    <div class="tr-search"><span>${icon('search')}</span><input name="trigger-search" role="combobox"
      aria-label="Search menu items" aria-controls="trigger-options" aria-expanded="true" aria-autocomplete="list"
      placeholder="Search Triggers..." value="${esc(query)}" data-evidence="tr-search"></div>
    <div id="trigger-options" class="tr-options" role="listbox" aria-label="Triggers" data-evidence="tr-options">
      ${choices.map(name=>`<div role="option" tabindex="-1" aria-selected="false" data-act="tr-provider:${name}"
        ${name==='Scheduled'?'aria-haspopup="menu" aria-controls="schedule-options"':name==='Linear'?'aria-haspopup="menu"':''}
        class="tr-option" data-evidence="tr-row-${triggerChoices.indexOf(name)}">
        <span class="tr-symbol">${name==='Scheduled'?icon('clock'):name==='Webhook Triggered'?icon('plug'):'◇'}</span>
        <span class="tr-label" data-evidence="tr-label-${triggerChoices.indexOf(name)}">${name}</span>
        ${name==='Webhook Triggered'?'':'<span class="tr-chevron">›</span>'}</div>`).join('')}
      ${choices.length?'':'<p class="tr-empty">No triggers found</p>'}</div></div>`+
    (submenu?`<div id="schedule-options" class="tr-pop tr-schedules" role="menu" aria-label="Scheduled" data-evidence="tr-schedules">
      ${scheduleChoices.map((name,i)=>btn(`<span data-evidence="tr-schedule-label-${i}">${name}</span>`,`tr-preset:${i}`,'',
        `role="menuitem" data-evidence="tr-schedule-row-${i}"`)).join('')}</div>`:'');
}
export function cronMenu(value:string,error:string,referenceDates:boolean):string {
  return `<div class="tr-pop tr-cron" role="menu" aria-label="Cron expression editor" data-evidence="tr-cron">
    <div class="tr-cron-title"><label for="cron-expression"><span data-evidence="tr-cron-title">Cron expression (UTC)</span></label></div>
    <div class="tr-cron-input"><input id="cron-expression" name="cron-expression" aria-label="Cron expression"
      aria-invalid="${!!error}" aria-describedby="cron-hint" placeholder="0 * * * *" value="${esc(value)}" data-evidence="tr-cron-input"></div>
    <div class="tr-cron-hint" id="cron-hint"><span data-evidence="tr-cron-hint">5-7 fields or @daily/@hourly</span></div>
    <div class="tr-dates" data-evidence="tr-dates">${referenceDates?observedDates.map((date,i)=>
      `<div data-evidence="tr-date-${i}">${date}</div>`).join(''):'<div>Local preview unavailable</div>'}</div>
    ${error?`<p class="tr-error" role="alert">${esc(error)}</p>`:''}</div>`;
}
