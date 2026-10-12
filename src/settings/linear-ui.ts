// Local connection intent only. The connection lane will replace this adapter
// with its account registry and sign-in flow; intent is never identity.
export function linearAccounts(): string {
  return '<table><caption>Connected Linear accounts</caption><thead><tr><th>Account</th><th>Workspace</th><th>Status</th></tr></thead><tbody><tr><td colspan="3">No Linear accounts connected.</td></tr></tbody></table>';
}
export function mountLinear(root: HTMLElement, requested: boolean, save: (requested: boolean) => Promise<void>) {
  const accounts = root.querySelector('#linear-accounts');
  if (accounts) accounts.innerHTML = linearAccounts();
  const button = root.querySelector<HTMLButtonElement>('#connect-linear');
  const target = root.querySelector<HTMLElement>('#linear-connect');
  if (!button || !target) return;
  target.setAttribute('role', 'status');
  if (requested) target.textContent = 'Connection requested. Linear sign-in is not available yet; no account has been connected.';
  button.textContent = requested ? 'Cancel connection request' : 'Connect Linear';
  button.onclick = () => {
    button.disabled = true;
    void save(!requested).catch(error => { target.textContent = (error as Error).message; })
      .finally(() => { button.disabled = false; });
  };
}
