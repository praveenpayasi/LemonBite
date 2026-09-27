import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { OnboardingData } from '@/types';

/** Persists the basic user info captured during Sign Up. */
export async function saveOnboardingData(data: OnboardingData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboarding, JSON.stringify(data));
}

/** Loads onboarding info, or null when none is stored or the JSON is invalid. */
export async function loadOnboardingData(): Promise<OnboardingData | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.onboarding);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
    };
  } catch {
    return null;
  }
}

/** Marks onboarding as finished so the app can route to the Menu on launch. */
export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
}

/** Whether onboarding has been completed. */
export async function isOnboardingComplete(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete)) === 'true';
}

/** Clears onboarding info and completion flag (used on logout). */
export async function clearOnboardingData(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.onboarding, STORAGE_KEYS.onboardingComplete]);
}
