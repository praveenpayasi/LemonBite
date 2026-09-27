import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearProfile, loadProfile, saveProfile } from '@/services/storage/profileStorage';
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
