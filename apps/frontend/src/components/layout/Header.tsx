import { useUiStore } from '../../stores';

export function Header() {
  const { currentPage } = useUiStore();

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    control: 'GPU Control',
    profiles: 'Profile Manager',
    alerts: 'Alerts',
    settings: 'Settings',
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-700 bg-surface-800 px-6">
      <h2 className="text-lg font-semibold text-surface-100">
        {pageTitles[currentPage] ?? 'Dashboard'}
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-surface-700 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-surface-300">Running</span>
        </div>
      </div>
    </header>
  );
}
