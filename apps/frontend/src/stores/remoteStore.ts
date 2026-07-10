import { create } from 'zustand';
import { remoteService } from '../services';

interface RemoteStore {
  running: boolean;
  url: string | null;
  port: number;
  apiKey: string;
  loading: boolean;
  error: string | null;

  setPort: (port: number) => void;
  setApiKey: (key: string) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  generateKey: () => Promise<void>;
}

export const useRemoteStore = create<RemoteStore>((set, get) => ({
  running: false,
  url: null,
  port: 8080,
  apiKey: '',
  loading: false,
  error: null,

  setPort: (port) => set({ port }),
  setApiKey: (key) => set({ apiKey: key }),

  start: async () => {
    set({ loading: true, error: null });
    try {
      const { port, apiKey } = get();
      const url = await remoteService.start(port, apiKey || undefined);
      set({ running: true, url, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },

  stop: async () => {
    set({ loading: true, error: null });
    try {
      await remoteService.stop();
      set({ running: false, url: null, loading: false });
    } catch (err) {
      set({ loading: false, error: String(err) });
    }
  },

  fetchStatus: async () => {
    try {
      const status = await remoteService.getStatus();
      set({
        running: status.running,
        url: status.url ?? null,
        port: status.port ?? get().port,
      });
    } catch {
      // server not reachable
    }
  },

  generateKey: async () => {
    try {
      const key = await remoteService.generateKey();
      set({ apiKey: key });
    } catch (err) {
      set({ error: String(err) });
    }
  },
}));
