import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearCategoryPreferences,
  clearProfile,
  loadCategoryPreferences,
  loadProfile,
  saveCategoryPreferences,
  saveProfile,
} from '@/services/storage/profileStorage';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import type { UserProfile } from '@/types';

const profile: UserProfile = {
  firstName: 'Tilly',
  lastName: 'Doe',
  email: 'tilly@doe.com',
  phoneNumber: '(217) 555-0113',
  avatarUri: 'file:///avatar.jpg',
  notifications: {
    orderStatuses: true,
    passwordChanges: false,
    specialOffers: true,
    newsletter: false,
  },
};

describe('profileStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('saves and loads a profile including avatar, names, email, phone and notifications', async () => {
    await saveProfile(profile);

    expect(await loadProfile()).toEqual(profile);
  });

  it('returns null when no profile is stored', async () => {
    expect(await loadProfile()).toBeNull();
  });

  it('returns null when the stored JSON is malformed', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.profile, 'not-json{');

    expect(await loadProfile()).toBeNull();
  });

  it('fills defaults for a partial stored object', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ firstName: 'Tilly' }));

    const loaded = await loadProfile();

    expect(loaded?.firstName).toBe('Tilly');
    expect(loaded?.lastName).toBe('');
    expect(loaded?.avatarUri).toBeNull();
    expect(loaded?.notifications.newsletter).toBe(false);
  });

  it('clears the stored profile', async () => {
    await saveProfile(profile);
    await clearProfile();

    expect(await loadProfile()).toBeNull();
  });

  it('propagates storage write errors', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));

    await expect(saveProfile(profile)).rejects.toThrow('disk full');
  });
});

describe('category preferences storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.restoreAllMocks();
  });

  it('returns an empty list when nothing is stored', async () => {
    await expect(loadCategoryPreferences()).resolves.toEqual([]);
  });

  it('round-trips the selected categories', async () => {
    await saveCategoryPreferences(['Starters', 'Desserts']);

    await expect(loadCategoryPreferences()).resolves.toEqual(['Starters', 'Desserts']);
  });

  it('persists an empty selection', async () => {
    await saveCategoryPreferences([]);

    await expect(loadCategoryPreferences()).resolves.toEqual([]);
  });

  it('ignores malformed JSON', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.categoryPreferences, '{not json');

    await expect(loadCategoryPreferences()).resolves.toEqual([]);
  });

  it('drops non-string entries', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.categoryPreferences,
      JSON.stringify(['Mains', 42, null, 'Sides']),
    );

    await expect(loadCategoryPreferences()).resolves.toEqual(['Mains', 'Sides']);
  });

  it('returns an empty list when the stored value is not an array', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.categoryPreferences, JSON.stringify({ a: 1 }));

    await expect(loadCategoryPreferences()).resolves.toEqual([]);
  });

  it('clears the stored preferences', async () => {
    await saveCategoryPreferences(['Mains']);
    await clearCategoryPreferences();

    await expect(loadCategoryPreferences()).resolves.toEqual([]);
  });
});
