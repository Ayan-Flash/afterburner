import { create } from 'zustand';

type Theme = 'dark' | 'light' | 'system';
type Page =
  | 'dashboard'
  | 'control'
  | 'profiles'
  | 'alerts'
  | 'remote'
  | 'overlay'
  | 'automation'
  | 'integrations'
  | 'reports'
  | 'enterprise'
  | 'sync'
  | 'ai'
  | 'monitoring'
  | 'settings';

interface UiStore {
  theme: Theme;
  sidebarOpen: boolean;
  currentPage: Page;
  selectedGpuId: string | null;

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  navigateTo: (page: Page) => void;
  setSelectedGpu: (gpuId: string | null) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  currentPage: 'dashboard',
  selectedGpuId: null,

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  navigateTo: (page) => set({ currentPage: page }),
  setSelectedGpu: (gpuId) => set({ selectedGpuId: gpuId }),
}));
