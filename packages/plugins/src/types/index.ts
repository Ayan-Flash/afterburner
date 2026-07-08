export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entrypoint: string;
  permissions: string[];
}

export type PluginStatus = 'loaded' | 'running' | 'stopped' | 'error';

export interface PluginInstance {
  manifest: PluginManifest;
  status: PluginStatus;
  loadedAt: number | null;
}
