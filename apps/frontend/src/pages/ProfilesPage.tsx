import { useEffect } from 'react';
import { ProfileManager } from '../components/feature/ProfileManager';
import { profileService } from '../services';
import { useProfileStore } from '../stores';

export function ProfilesPage() {
  const { setProfiles } = useProfileStore();

  useEffect(() => {
    (async () => {
      try {
        const loaded = await profileService.load();
        setProfiles(loaded as any[]);
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <ProfileManager />
    </div>
  );
}
