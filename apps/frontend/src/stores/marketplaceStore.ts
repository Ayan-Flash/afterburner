import { create } from 'zustand';
import type { MarketplaceProfile } from '../services/marketplaceService';
import { marketplaceService } from '../services/marketplaceService';

interface MarketplaceState {
  profiles: MarketplaceProfile[];
  selected: MarketplaceProfile | null;
  filter: string;
  search: string;
  loading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  setFilter: (filter: string) => void;
  setSearch: (search: string) => void;
  selectProfile: (id: string | null) => Promise<void>;
  publishProfile: (profile: MarketplaceProfile) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  rateProfile: (profileId: string, score: number, comment: string, author: string) => Promise<void>;
  importProfile: (json: string) => Promise<void>;
  exportProfile: (id: string) => Promise<string>;
  clearError: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  profiles: [],
  selected: null,
  filter: 'all',
  search: '',
  loading: false,
  error: null,

  fetchProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const { filter, search } = get();
      const profiles = await marketplaceService.list(filter, search);
      set({ profiles, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  setFilter: (filter: string) => {
    set({ filter });
    get().fetchProfiles();
  },

  setSearch: (search: string) => {
    set({ search });
    get().fetchProfiles();
  },

  selectProfile: async (id: string | null) => {
    if (!id) {
      set({ selected: null });
      return;
    }
    try {
      const profile = await marketplaceService.get(id);
      set({ selected: profile });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  publishProfile: async (profile: MarketplaceProfile) => {
    set({ loading: true, error: null });
    try {
      await marketplaceService.publish(profile);
      await get().fetchProfiles();
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  deleteProfile: async (id: string) => {
    try {
      await marketplaceService.delete(id);
      if (get().selected?.id === id) set({ selected: null });
      await get().fetchProfiles();
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  rateProfile: async (profileId: string, score: number, comment: string, author: string) => {
    try {
      const profile = await marketplaceService.rate(profileId, {
        profile_id: profileId,
        score,
        comment,
        author,
        timestamp: Math.floor(Date.now() / 1000),
      });
      set({ selected: profile });
      await get().fetchProfiles();
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  importProfile: async (json: string) => {
    set({ loading: true, error: null });
    try {
      await marketplaceService.import(json);
      await get().fetchProfiles();
      set({ loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  exportProfile: async (id: string) => {
    try {
      return await marketplaceService.export(id);
    } catch (e: any) {
      set({ error: String(e) });
      return '';
    }
  },

  clearError: () => set({ error: null }),
}));
