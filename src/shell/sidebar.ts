// Captured shell: an explicit click toggles 280px / 44px. No observed drag reveal.
export function installSidebar(root: Document = document): () => void {
  const controller = new AbortController();
  root.addEventListener('click', event => {
    const button = (event.target as Element).closest('[data-act="collapse"]');
    if (!button) return;
    const collapsed = root.body.classList.toggle('collapsed');
    button.setAttribute('aria-expanded', String(!collapsed));
    button.setAttribute('aria-label', collapsed ? 'Open sidebar' : 'Collapse sidebar');
  }, { signal: controller.signal });
  return () => controller.abort();
}
