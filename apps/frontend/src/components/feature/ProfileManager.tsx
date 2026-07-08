import { useState } from 'react';
import { useGpuStore, useProfileStore, useUiStore } from '../../stores';
import { profileService } from '../../services';

export function ProfileManager() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { controlStates } = useGpuStore();
  const { selectedGpuId } = useUiStore();
  const { profiles, setProfiles } = useProfileStore();

  const control = selectedGpuId ? controlStates.get(selectedGpuId) : null;

  const handleSave = async () => {
    if (!name.trim() || !selectedGpuId || !control) return;
    setSaving(true);
    try {
      await profileService.save(
        name,
        selectedGpuId,
        control.core_clock_offset_mhz,
        control.memory_clock_offset_mhz,
        control.voltage_offset_mv,
        control.target_fan_speed ?? 50,
        control.power_limit_percent ?? 100,
      );
      setName('');
      const loaded = await profileService.load();
      setProfiles(loaded as typeof profiles);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async () => {
    try {
      const loaded = await profileService.load();
      setProfiles(loaded as typeof profiles);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const handleDelete = async (fn: string) => {
    try {
      await profileService.delete(fn);
      await handleLoad();
    } catch (err) {
      console.error('Failed to delete profile:', err);
    }
  };

  return (
    <div className="card flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-surface-200">Profile Manager</h3>

      <div className="flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Profile name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn-primary text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400">Saved Profiles</span>
        <button onClick={handleLoad} className="text-xs text-primary-400 hover:underline">
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {profiles.length === 0 && (
          <div className="py-3 text-center text-xs text-surface-500">No saved profiles</div>
        )}
        {profiles.map((profile, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-surface-700 px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-surface-200">{profile.name}</span>
              <span className="text-[10px] text-surface-500">
                Core: {profile.core_offset}MHz | Mem: {profile.mem_offset}MHz
              </span>
            </div>
            <button
              onClick={() => handleDelete(`${profile.name?.replace(/ /g, '_')}_${profile.gpu_id}.json`)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-surface-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
