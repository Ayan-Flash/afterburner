import { useEffect } from 'react';
import { useUiStore, useGpuStore } from './stores';
import { MainLayout } from './components/layout';
import { DashboardPage, ControlPage, ProfilesPage, AlertsPage, SettingsPage, RemotePage, OverlayPage, AutomationPage, IntegrationsPage, ReportsPage, EnterprisePage, SyncPage, AiPage, BackupPage, MarketplacePage } from './pages';
import { IconMonitor } from './components/base/Icons';

const pages: Record<string, React.FC> = {
  dashboard: DashboardPage,
  control: ControlPage,
  profiles: ProfilesPage,
  alerts: AlertsPage,
  settings: SettingsPage,
  remote: RemotePage,
  overlay: OverlayPage,
  automation: AutomationPage,
  integrations: IntegrationsPage,
  reports: ReportsPage,
  enterprise: EnterprisePage,
  sync: SyncPage,
  ai: AiPage,
  backup: BackupPage,
  marketplace: MarketplacePage,
};

export function App() {
  const { currentPage, initialized, selectedGpuId, loadSettings, setSelectedGpu } = useUiStore();
  const { gpus, fetchGpus } = useGpuStore();

  useEffect(() => {
    loadSettings();
    fetchGpus();
  }, [loadSettings, fetchGpus]);

  useEffect(() => {
    if (gpus.length > 0 && !selectedGpuId) {
      setSelectedGpu(gpus[0].id);
    }
  }, [gpus, selectedGpuId, setSelectedGpu]);

  if (!initialized) {
    return null;
  }

  const PageComponent = pages[currentPage] ?? DashboardPage;

  return (
    <MainLayout>
      {gpus.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="bg-gpu-700 border-gpu-600 flex size-14 items-center justify-center rounded-2xl border">
              <IconMonitor size={28} className="text-text-muted" />
            </div>
            <h2 className="text-text-secondary text-base font-semibold">Initializing GPU Monitoring</h2>
            <p className="text-text-muted text-sm">
              Detecting hardware and starting monitoring engine...
            </p>
          </div>
        </div>
      ) : (
        <PageComponent />
      )}
    </MainLayout>
  );
}
