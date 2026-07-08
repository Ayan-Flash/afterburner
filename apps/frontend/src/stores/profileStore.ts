import { create } from 'zustand';

interface Profile {
  name: string;
  gpu_id: string;
  core_offset: number;
  mem_offset: number;
  voltage_offset: number;
  fan_speed: number;
  power_limit: number;
  created_at?: string;
}

interface ProfileStore {
  profiles: Profile[];
  loading: boolean;
  activeProfile: string | null;

  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (name: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profiles: [],
  loading: false,
  activeProfile: null,

  setProfiles: (profiles) => set({ profiles }),
  setActiveProfile: (name) => set({ activeProfile: name }),
  setLoading: (loading) => set({ loading }),
}));
