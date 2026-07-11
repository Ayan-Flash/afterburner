import { useEffect } from 'react';
import { useUiStore, useGpuStore } from './stores';
import { MainLayout } from './components/layout';
import { DashboardPage } from './pages';

/* ================================================================
   App — Armoury Crate shell.

   Initialises settings + GPU list, auto-selects the first GPU,
   then renders the MainLayout with the DashboardPage inside.
   ================================================================ */

export function App() {
  const { initialized, selectedGpuId, loadSettings, setSelectedGpu } = useUiStore();
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

  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  );
}
