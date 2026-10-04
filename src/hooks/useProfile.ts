import { useCallback, useEffect, useMemo, useState } from 'react';

import { loadOnboardingData, clearOnboardingData } from '@/services/storage/onboardingStorage';
import {
  clearCategoryPreferences,
  clearProfile,
  loadProfile,
  saveProfile,
} from '@/services/storage/profileStorage';
import {
  createDefaultProfile,
  mergeProfile,
  profilesEqual,
  validateProfile,
  type ProfileValidationErrors,
} from '@/utils/profile';
import { formatUsPhoneNumber } from '@/utils/phone';
import type { EmailNotificationPreferences, UserProfile } from '@/types';

export type ProfileTextField = 'firstName' | 'lastName' | 'email' | 'phoneNumber';

export interface UseProfileResult {
  loading: boolean;
  loadError: boolean;
  saving: boolean;
  saveError: string | null;
  draft: UserProfile;
  errors: ProfileValidationErrors;
  hasUnsavedChanges: boolean;
  updateField: (field: ProfileTextField, value: string) => void;
  updateNotification: (key: keyof EmailNotificationPreferences, value: boolean) => void;
  setAvatar: (uri: string | null) => void;
  save: () => Promise<boolean>;
  discard: () => void;
  logout: () => Promise<void>;
}

const EMPTY_PROFILE = createDefaultProfile(null);

/**
 * Owns the Profile screen's saved/draft state and persistence orchestration.
 * Storage stays in the service modules; this hook is the React boundary.
 */
export function useProfile(): UseProfileResult {
  const [saved, setSaved] = useState<UserProfile>(EMPTY_PROFILE);
  const [draft, setDraft] = useState<UserProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedProfile, onboarding] = await Promise.all([loadProfile(), loadOnboardingData()]);
        const merged = mergeProfile(savedProfile, onboarding);
        if (active) {
          setSaved(merged);
          setDraft(merged);
        }
      } catch (error) {
        console.error('Failed to load profile', error);
        if (active) {
          setLoadError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateField = useCallback((field: ProfileTextField, value: string) => {
    setDraft((current) => ({
      ...current,
      [field]: field === 'phoneNumber' ? formatUsPhoneNumber(value) : value,
    }));
  }, []);

  const updateNotification = useCallback(
    (key: keyof EmailNotificationPreferences, value: boolean) => {
      setDraft((current) => ({
        ...current,
        notifications: { ...current.notifications, [key]: value },
      }));
    },
    [],
  );

  const setAvatar = useCallback((uri: string | null) => {
    setDraft((current) => ({ ...current, avatarUri: uri }));
  }, []);

  const save = useCallback(async () => {
    const normalized: UserProfile = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
    };

    const validation = validateProfile(normalized);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return false;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await saveProfile(normalized);
      setSaved(normalized);
      setDraft(normalized);
      return true;
    } catch (error) {
      console.error('Failed to save profile', error);
      setSaveError('We couldn’t save your changes. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const discard = useCallback(() => {
    setDraft(saved);
    setErrors({});
    setSaveError(null);
  }, [saved]);

  const logout = useCallback(async () => {
    await Promise.all([clearProfile(), clearOnboardingData(), clearCategoryPreferences()]);
  }, []);

  const hasUnsavedChanges = useMemo(() => !profilesEqual(draft, saved), [draft, saved]);

  return {
    loading,
    loadError,
    saving,
    saveError,
    draft,
    errors,
    hasUnsavedChanges,
    updateField,
    updateNotification,
    setAvatar,
    save,
    discard,
    logout,
  };
}
