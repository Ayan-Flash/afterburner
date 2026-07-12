import { useEffect, useMemo } from 'react';
import { useUiStore, useGpuStore } from './stores';
import { MainLayout } from './components/layout';
import {
  DashboardPage,
  ControlPage,
  ProfilesPage,
  AlertsPage,
  SettingsPage,
  RemotePage,
  OverlayPage,
  AutomationPage,
  IntegrationsPage,
  ReportsPage,
  EnterprisePage,
  SyncPage,
  AiPage,
  BackupPage,
  MarketplacePage,
} from './pages';

const pageComponents: Record<string, React.ComponentType> = {
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
  const { initialized, selectedGpuId, loadSettings, setSelectedGpu, currentPage } = useUiStore();
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

  const PageComponent = useMemo(() => pageComponents[currentPage] ?? DashboardPage, [currentPage]);

  if (!initialized) {
    return null;
  }

  return (
    <MainLayout>
      <PageComponent />
    </MainLayout>
  );
}
