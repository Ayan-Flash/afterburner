import { useEffect } from 'react';
import { ProfileManager } from '../components/feature/ProfileManager';
import { profileService } from '../services';
import { useProfileStore } from '../stores';
import type { Profile } from '../stores/profileStore';

export function ProfilesPage() {
  const { setProfiles } = useProfileStore();

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

  return (
    <div className="mx-auto max-w-2xl">
      <ProfileManager />
    </div>
  );
}
