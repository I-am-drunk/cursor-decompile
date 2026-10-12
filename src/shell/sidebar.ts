// Pinning affects layout; transient pointer/focus/drag reveal never does.
export function installSidebar(root: Document = document): () => void {
  const controller = new AbortController(), options = { signal: controller.signal };
  let collapsed = false, dismissed = false;
  const sidebar = () => root.querySelector<HTMLElement>('.shell-sidebar');
  const clearDrag = () => root.querySelectorAll('.drag-hover').forEach(e=>e.classList.remove('drag-hover'));
  const sync = () => {
    root.body.classList.toggle('collapsed', collapsed);
    root.querySelector('[data-act="collapse"]')?.setAttribute('aria-expanded', String(!collapsed));
  };
  const inside = (target: EventTarget | null) => target instanceof Node && !!sidebar()?.contains(target);
  root.addEventListener('click', e => {
    if (!(e.target as Element).closest('[data-act="collapse"]')) return;
    collapsed = !collapsed; dismissed = collapsed;
    root.body.classList.remove('rail-revealed'); sync();
  }, options);
  root.addEventListener('pointerover', e => {
    if (collapsed && !dismissed && inside(e.target)) root.body.classList.add('rail-revealed');
  }, options);
  root.addEventListener('pointerout', e => {
    if (inside(e.target) && !inside(e.relatedTarget)) {
      dismissed = false; root.body.classList.remove('rail-revealed');
    }
  }, options);
  root.addEventListener('focusin', e => { root.body.classList.toggle('rail-focus', inside(e.target) && !(e.target as Element).closest('[data-act="collapse"]')); }, options);
  root.addEventListener('focusout', e => { if (!inside(e.relatedTarget)) root.body.classList.remove('rail-focus'); }, options);
  root.addEventListener('dragover', e => { clearDrag(); if (inside(e.target)) {if(collapsed)root.body.classList.add('rail-revealed');(e.target as Element).closest('.destination')?.classList.add('drag-hover');} }, options);
  root.addEventListener('dragleave', e => { if (!inside(e.relatedTarget)) {clearDrag();root.body.classList.remove('rail-revealed');} }, options);
  const endDrag=()=>{clearDrag();root.body.classList.remove('rail-revealed');};
  root.addEventListener('dragend', endDrag, options);
  root.addEventListener('drop', endDrag, options);
  root.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === 'KeyB') {
      e.preventDefault(); collapsed = !collapsed; dismissed=collapsed;root.body.classList.remove('rail-revealed','rail-focus');sync();
    }
    if (e.key === 'Escape') { dismissed = true; clearDrag();root.body.classList.remove('rail-revealed','rail-focus'); }
  }, options);
  return () => controller.abort();
}
