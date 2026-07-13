import { useState, useEffect } from 'react';
import { useGpuStore, useProfileStore, useUiStore } from '../stores';
import { profileService } from '../services';
import type { Profile } from '../stores/profileStore';

export function ProfilesPage() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { controlStates } = useGpuStore();
  const { selectedGpuId } = useUiStore();
  const { profiles, setProfiles } = useProfileStore();

  const control = selectedGpuId ? controlStates.get(selectedGpuId) : null;

  useEffect(() => {
    (async () => {
      try {
        const loaded = await profileService.load();
        setProfiles(loaded as Profile[]);
      } catch {
        // ignore
      }
    })();
  }, [setProfiles]);

  const handleSave = async () => {
    if (!name.trim() || !selectedGpuId || !control) return;
    setSaving(true);
    try {
      await profileService.save(name, selectedGpuId,
        control.core_clock_offset_mhz, control.memory_clock_offset_mhz,
        control.voltage_offset_mv, control.target_fan_speed ?? 50,
        control.power_limit_percent ?? 100);
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
    <div className="ac-page ac-page--compact">
      <div className="ac-page-header">
        <div className="ac-page-header__left">
          <span className="ac-page-header__title">Profiles</span>
          <span className="ac-page-header__desc">Save and manage GPU overclock profiles</span>
        </div>
      </div>

      <div className="ac-page-card">
        <div className="ac-page-card__header">
          <span className="ac-page-card__title">
            <svg className="ac-page-card__title-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Profile Manager
          </span>
        </div>

        <div className="ac-page-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="ac-input ac-input--wide" placeholder="Profile name..."
              value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={handleSave} disabled={saving || !name.trim()}
              className="ac-btn ac-btn--primary">
              {saving ? 'Saving...' : 'Save Current'}
            </button>
          </div>

          <div className="ac-divider" />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ac-text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Saved Profiles</span>
            <button onClick={handleLoad} className="ac-btn ac-btn--ghost ac-btn--icon" title="Refresh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profiles.length === 0 && (
              <div className="ac-empty" style={{ padding: '24px 16px' }}>
                <svg className="ac-empty__icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                <span className="ac-empty__text">No saved profiles</span>
              </div>
            )}
            {profiles.map((profile, i) => (
              <div key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--ac-bg-input)',
                  borderRadius: 'var(--ac-radius-panel)',
                  border: '1px solid var(--ac-border-subtle)',
                }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ac-text-primary)' }}>{profile.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--ac-text-muted)', fontFamily: 'var(--ac-font-mono)' }}>
                    Core: {profile.core_offset}MHz | Mem: {profile.mem_offset}MHz
                  </span>
                </div>
                <button onClick={() => handleDelete(`${profile.name?.replace(/ /g, '_')}_${profile.gpu_id}.json`)}
                  className="ac-btn ac-btn--ghost ac-btn--sm ac-btn--icon" style={{ color: '#f55' }} title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
