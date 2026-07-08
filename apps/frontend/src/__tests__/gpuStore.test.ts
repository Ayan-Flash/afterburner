import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGpuStore } from '../stores/gpuStore';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('GpuStore', () => {
  beforeEach(() => {
    useGpuStore.setState({
      gpus: [],
      currentData: new Map(),
      history: new Map(),
      aggregated: new Map(),
      controlStates: new Map(),
      alerts: [],
      loading: false,
      error: null,
    });
  });

  it('should initialize with empty state', () => {
    const state = useGpuStore.getState();
    expect(state.gpus).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should have correct initial alert count', () => {
    const state = useGpuStore.getState();
    expect(state.alerts).toHaveLength(0);
  });

  it('should update loading state during fetch', () => {
    useGpuStore.setState({ loading: true });
    expect(useGpuStore.getState().loading).toBe(true);
  });
});
