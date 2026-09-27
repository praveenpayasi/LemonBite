import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { UserProfile } from '@/types';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Coerces arbitrary parsed JSON into a valid `UserProfile`, filling defaults. */
function normalizeStoredProfile(raw: unknown): UserProfile {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const notifications = (
    obj.notifications && typeof obj.notifications === 'object' ? obj.notifications : {}
  ) as Record<string, unknown>;

  return {
    firstName: asString(obj.firstName),
    lastName: asString(obj.lastName),
    email: asString(obj.email),
    phoneNumber: asString(obj.phoneNumber),
    avatarUri: typeof obj.avatarUri === 'string' ? obj.avatarUri : null,
    notifications: {
      orderStatuses: asBoolean(notifications.orderStatuses),
      passwordChanges: asBoolean(notifications.passwordChanges),
      specialOffers: asBoolean(notifications.specialOffers),
      newsletter: asBoolean(notifications.newsletter),
    },
  };
}

/** Persists the profile as JSON. */
export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

/** Loads the saved profile, or null when none is stored or the JSON is invalid. */
export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
  if (!raw) {
    return null;
  }
  try {
    return normalizeStoredProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Removes the saved profile. */
export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.profile);
}
