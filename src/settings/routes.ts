export const settingsSections = ['linear', 'mcp', 'accounts', 'general'] as const;
export type SettingsSection = typeof settingsSections[number];
export const titles: Record<SettingsSection, string> = {
  linear: 'Linear connection', mcp: 'MCP connectors', accounts: 'Accounts', general: 'General',
};
export function settingsSection(path: string): SettingsSection | null {
  const name = path.replace(/\/$/, '').split('/')[2];
  return settingsSections.includes(name as SettingsSection) ? name as SettingsSection : null;
}
export function isSettingsRoute(path: string): boolean {
  return path === '/settings' || settingsSections.some(section => path === `/settings/${section}`);
}
