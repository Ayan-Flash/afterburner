import { useGpuStore, useUiStore } from '../../stores';

export function GpuSelector() {
  const { gpus } = useGpuStore();
  const { selectedGpuId, setSelectedGpu } = useUiStore();

  if (gpus.length === 0) {
    return (
      <div className="text-surface-500 text-sm">No GPUs detected</div>
    );
  }

  return (
    <div className="flex gap-2">
      {gpus.map((gpu) => (
        <button
          key={gpu.id}
          onClick={() => setSelectedGpu(gpu.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedGpuId === gpu.id
              ? 'bg-primary-600 text-white'
              : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
          }`}
        >
          {gpu.name.split('(')[0].trim()}
        </button>
      ))}
    </div>
  );
}
