import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProfileScreen from '@/app/profile';
import { CartProvider } from '@/context/CartContext';
import {
  loadCategoryPreferences,
  loadProfile,
  saveCategoryPreferences,
  saveProfile,
} from '@/services/storage/profileStorage';
import { loadOnboardingData, saveOnboardingData } from '@/services/storage/onboardingStorage';
import type { UserProfile } from '@/types';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: jest.fn(),
    navigate: mockNavigate,
  }),
  usePathname: () => '/profile',
}));

const mockRequestPermission = jest.fn();
const mockLaunchLibrary = jest.fn();
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () => mockRequestPermission(),
  launchImageLibraryAsync: () => mockLaunchLibrary(),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const savedProfile: UserProfile = {
  firstName: 'Tilly',
  lastName: 'Doe',
  email: 'tilly@doe.com',
  phoneNumber: '(217) 555-0113',
  avatarUri: 'file:///avatar.jpg',
  notifications: {
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsletter: true,
  },
};

function renderProfile() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <CartProvider>
        <ProfileScreen />
      </CartProvider>
    </SafeAreaProvider>,
  );
}

describe('ProfileScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockBack.mockClear();
    mockReplace.mockClear();
    mockRequestPermission.mockReset();
    mockLaunchLibrary.mockReset();
  });

  it('shows a loading state, then populates first name and email from onboarding', async () => {
    await saveOnboardingData({ firstName: 'Tilly', email: 'tilly@doe.com' });

    renderProfile();
    expect(screen.getByLabelText('Loading profile')).toBeOnTheScreen();

    expect(await screen.findByDisplayValue('Tilly')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('tilly@doe.com')).toBeOnTheScreen();
  });

  it('prefers a saved profile over onboarding data', async () => {
    await saveOnboardingData({ firstName: 'Onboard', email: 'onboard@x.com' });
    await saveProfile({ ...savedProfile, avatarUri: null });

    renderProfile();

    expect(await screen.findByDisplayValue('Tilly')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('Doe')).toBeOnTheScreen();
  });

  it('lets the user edit fields and formats the phone number', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.changeText(screen.getByTestId('profile-last-name'), 'Smith');
    fireEvent.changeText(screen.getByTestId('profile-phone'), '3125550199');

    expect(screen.getByDisplayValue('Smith')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('(312) 555-0199')).toBeOnTheScreen();
  });

  it('prevents saving an invalid email', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.changeText(screen.getByTestId('profile-email'), 'not-an-email');
    fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Please enter a valid email address.')).toBeOnTheScreen();
  });

  it('prevents saving an incomplete phone number', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.changeText(screen.getByTestId('profile-phone'), '312555');
    fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Enter a 10-digit US phone number.')).toBeOnTheScreen();
  });

  it('toggles a notification preference', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    const newsletter = screen.getByRole('checkbox', { name: 'Newsletter' });
    expect(newsletter).toBeChecked();

    fireEvent.press(newsletter);
    expect(screen.getByRole('checkbox', { name: 'Newsletter' })).not.toBeChecked();
  });

  it('persists valid changes on Save', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.changeText(screen.getByTestId('profile-last-name'), 'Smith');
    fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(async () => {
      const stored = await loadProfile();
      expect(stored?.lastName).toBe('Smith');
    });
  });

  it('discards edits back to the last saved values', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Doe');

    fireEvent.changeText(screen.getByTestId('profile-last-name'), 'Smith');
    expect(screen.getByDisplayValue('Smith')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Discard changes' }));
    expect(screen.getByDisplayValue('Doe')).toBeOnTheScreen();
  });

  it('removes the avatar to show initials and persists the removal on Save', async () => {
    await saveProfile(savedProfile);
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Remove avatar' }));
    expect(screen.getAllByText('TD').length).toBeGreaterThan(0);

    fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(async () => {
      const stored = await loadProfile();
      expect(stored?.avatarUri).toBeNull();
    });
  });

  it('updates the draft avatar from the image picker without persisting until Save', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    mockRequestPermission.mockResolvedValue({ granted: true });
    mockLaunchLibrary.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///new.jpg' }] });

    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Change avatar' }));

    await waitFor(() => {
      expect(mockLaunchLibrary).toHaveBeenCalled();
    });
    const stored = await loadProfile();
    expect(stored?.avatarUri).toBeNull();
  });

  it('leaves the avatar unchanged when image selection is cancelled', async () => {
    await saveProfile(savedProfile);
    mockRequestPermission.mockResolvedValue({ granted: true });
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: [] });

    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Change avatar' }));

    await waitFor(() => {
      expect(mockLaunchLibrary).toHaveBeenCalled();
    });
    expect(screen.queryByText('TD')).toBeNull();
  });

  it('shows a message when photo permission is denied', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    mockRequestPermission.mockResolvedValue({ granted: false });

    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Change avatar' }));

    expect(await screen.findByText('Allow photo access to change your avatar.')).toBeOnTheScreen();
    expect(mockLaunchLibrary).not.toHaveBeenCalled();
  });

  it('shows an error when saving fails', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    fireEvent.changeText(screen.getByTestId('profile-last-name'), 'Smith');
    fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText(/couldn’t save your changes/i)).toBeOnTheScreen();
  });

  it('navigates back when the back control is pressed', async () => {
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Go back' }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('logs out by clearing user data and routing to Welcome', async () => {
    await saveOnboardingData({ firstName: 'Tilly', email: 'tilly@doe.com' });
    await saveProfile({ ...savedProfile, avatarUri: null });
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
    expect(await loadProfile()).toBeNull();
    expect(await loadOnboardingData()).toBeNull();
  });

  it('clears saved course preferences on logout so they do not leak to the next user', async () => {
    await saveOnboardingData({ firstName: 'Tilly', email: 'tilly@doe.com' });
    await saveProfile({ ...savedProfile, avatarUri: null });
    await saveCategoryPreferences(['Starters', 'Mains']);
    renderProfile();
    await screen.findByDisplayValue('Tilly');

    fireEvent.press(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
    expect(await loadCategoryPreferences()).toEqual([]);
  });
});
