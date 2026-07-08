import { useUiStore, useGpuStore } from './stores';
import { MainLayout } from './components/layout';
import { DashboardPage, ControlPage, ProfilesPage, AlertsPage, SettingsPage, RemotePage, OverlayPage, AutomationPage, IntegrationsPage, ReportsPage, EnterprisePage, SyncPage, AiPage, BackupPage } from './pages';
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
};

export function App() {
  const { currentPage } = useUiStore();
  const { gpus } = useGpuStore();

  const PageComponent = pages[currentPage] ?? DashboardPage;

  return (
    <MainLayout>
      {gpus.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gpu-700 border border-gpu-600 flex items-center justify-center">
              <IconMonitor size={28} className="text-text-muted" />
            </div>
            <h2 className="text-base font-semibold text-text-secondary">Initializing GPU Monitoring</h2>
            <p className="text-sm text-text-muted">
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
