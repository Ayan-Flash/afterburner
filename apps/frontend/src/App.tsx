import { useUiStore, useGpuStore } from './stores';
import { MainLayout } from './components/layout';
import { DashboardPage, ControlPage, ProfilesPage, AlertsPage, SettingsPage, RemotePage, OverlayPage } from './pages';

const pages: Record<string, React.FC> = {
  dashboard: DashboardPage,
  control: ControlPage,
  profiles: ProfilesPage,
  alerts: AlertsPage,
  settings: SettingsPage,
  remote: RemotePage,
  overlay: OverlayPage,
};

export function App() {
  const { currentPage } = useUiStore();
  const { gpus } = useGpuStore();

  const PageComponent = pages[currentPage] ?? DashboardPage;

  return (
    <MainLayout>
      {gpus.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mb-2 text-4xl">🖥️</div>
            <h2 className="text-lg font-semibold text-surface-300">Initializing GPU Monitoring</h2>
            <p className="mt-1 text-sm text-surface-500">
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
