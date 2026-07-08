import type { PluginManifest, PluginInstance } from '../types';

export class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();

  register(manifest: PluginManifest): void {
    this.plugins.set(manifest.id, {
      manifest,
      status: 'loaded',
      loadedAt: null,
    });
  }

  unregister(id: string): boolean {
    return this.plugins.delete(id);
  }

  get(id: string): PluginInstance | undefined {
    return this.plugins.get(id);
  }

  list(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  count(): number {
    return this.plugins.size;
  }
}
