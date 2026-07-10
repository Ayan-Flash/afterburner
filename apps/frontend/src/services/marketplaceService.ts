import { invoke } from '@tauri-apps/api/core';

export interface MarketplaceProfile {
  id: string;
  name: string;
  description: string;
  author: string;
  author_id: string;
  gpu_model: string;
  gpu_vendor: string;
  driver_version: string;
  profile_data: unknown;
  tags: string[];
  rating_avg: number;
  rating_count: number;
  download_count: number;
  created_at: number;
  updated_at: number;
  version: string;
}

export interface ProfileRating {
  profile_id: string;
  score: number;
  comment: string;
  author: string;
  timestamp: number;
}

export const marketplaceService = {
  list: (filter: string, search: string) =>
    invoke<MarketplaceProfile[]>('list_marketplace_profiles', { filter, search }),

  get: (id: string) =>
    invoke<MarketplaceProfile | null>('get_marketplace_profile', { id }),

  publish: (profile: MarketplaceProfile) =>
    invoke<MarketplaceProfile>('publish_marketplace_profile', { profile }),

  delete: (id: string) =>
    invoke<boolean>('delete_marketplace_profile', { id }),

  rate: (profileId: string, rating: ProfileRating) =>
    invoke<MarketplaceProfile>('rate_marketplace_profile', { profileId, rating }),

  download: (id: string) =>
    invoke<MarketplaceProfile>('download_marketplace_profile', { id }),

  import: (json: string) =>
    invoke<MarketplaceProfile>('import_marketplace_profile', { json }),

  export: (id: string) =>
    invoke<string>('export_marketplace_profile', { id }),
};
