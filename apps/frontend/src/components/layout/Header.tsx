import { useUiStore, useGpuStore } from '../../stores';
import { IconMonitor } from '../base/Icons';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  control: 'GPU Control',
  profiles: 'Profile Manager',
  alerts: 'Alerts & Events',
  remote: 'Remote Monitoring',
  overlay: 'In-Game Overlay',
  automation: 'Automation Rules',
  integrations: 'Integrations',
  reports: 'Performance Reports',
  enterprise: 'Enterprise',
  sync: 'Cloud Sync',
  ai: 'AI Insights',
  backup: 'Backup & Restore',
  marketplace: 'Profile Marketplace',
  settings: 'Settings',
};

export function Header() {
  const { currentPage } = useUiStore();
  const gpuCount = useGpuStore((s) => s.gpus.length);

  return (
    <header className="border-gpu-700 bg-gpu-900/50 flex h-12 flex-shrink-0 items-center justify-between border-b px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-text-primary text-base font-semibold tracking-tight">
          {pageTitles[currentPage] ?? 'Dashboard'}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-gpu-700/50 border-gpu-600 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
          <IconMonitor size={14} className="text-text-muted" />
          <span className="text-text-secondary text-xs font-medium">{gpuCount} GPU</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
          <span className="text-xs font-medium text-emerald-400">MONITORING</span>
        </div>
      </div>
    </header>
  );
}
