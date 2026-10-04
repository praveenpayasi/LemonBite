import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { loadOnboardingData } from '@/services/storage/onboardingStorage';
import { loadProfile } from '@/services/storage/profileStorage';
import { getInitials, mergeProfile } from '@/utils/profile';

export interface HeaderAvatar {
  uri: string | null;
  initials: string;
}

/**
 * Resolves the avatar shown in app headers, refreshing whenever the screen
 * regains focus so profile edits appear immediately.
 */
export function useHeaderAvatar(): HeaderAvatar {
  const [avatar, setAvatar] = useState<HeaderAvatar>({ uri: null, initials: '' });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [profile, onboarding] = await Promise.all([loadProfile(), loadOnboardingData()]);
        const merged = mergeProfile(profile, onboarding);
        if (active) {
          setAvatar({
            uri: merged.avatarUri,
            initials: getInitials(merged.firstName, merged.lastName),
          });
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  return avatar;
}
