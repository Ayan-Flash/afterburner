import { create } from 'zustand';
import { settingsService } from '../services';

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
  | 'backup'
  | 'marketplace'
  | 'monitoring'
  | 'settings';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

interface UiStore {
  theme: Theme;
  sidebarOpen: boolean;
  currentPage: Page;
  selectedGpuId: string | null;
  initialized: boolean;

  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  navigateTo: (page: Page) => void;
  setSelectedGpu: (gpuId: string | null) => void;
  loadSettings: () => Promise<void>;
  persistTheme: (theme: Theme) => Promise<void>;
}

export const useUiStore = create<UiStore>((set, get) => ({
  theme: 'dark',
  sidebarOpen: true,
  currentPage: 'dashboard',
  selectedGpuId: null,
  initialized: false,

  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  navigateTo: (page) => set({ currentPage: page }),
  setSelectedGpu: (gpuId) => set({ selectedGpuId: gpuId }),

  loadSettings: async () => {
    try {
      const settings = await settingsService.getAll();
      const theme = (settings['theme'] as Theme) || 'dark';
      const sidebarOpen = settings['sidebarOpen'] !== 'false';
      set({ theme, sidebarOpen, initialized: true });
      applyTheme(theme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (get().theme === 'system') {
          applyTheme('system');
        }
      });
    } catch {
      applyTheme('dark');
      set({ initialized: true });
    }
  },

  persistTheme: async (theme: Theme) => {
    set({ theme });
    applyTheme(theme);
    try {
      await settingsService.set('theme', theme);
    } catch { /* ignore */ }
  },
}));
