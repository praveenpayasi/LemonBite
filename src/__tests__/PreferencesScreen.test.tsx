import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PreferencesScreen from '@/app/preferences';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/repositories/menuRepository', () => ({
  prepareMenuForHome: jest.fn(() => Promise.resolve()),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Sides'];

function renderPreferences() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <PreferencesScreen />
    </SafeAreaProvider>,
  );
}

describe('PreferencesScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });
  it('renders the heading, every option and the primary action', () => {
    renderPreferences();

    expect(screen.getByText('LemonBite')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'What do you like?' })).toBeOnTheScreen();
    CATEGORIES.forEach((category) => {
      expect(screen.getByRole('checkbox', { name: category })).toBeOnTheScreen();
    });
    expect(screen.getByRole('button', { name: 'Next' })).toBeOnTheScreen();
  });

  it('starts with every option unselected', () => {
    renderPreferences();

    CATEGORIES.forEach((category) => {
      expect(screen.getByRole('checkbox', { name: category })).not.toBeChecked();
    });
  });

  it('selects an option when pressed', () => {
    renderPreferences();

    const starters = screen.getByRole('checkbox', { name: 'Starters' });
    fireEvent.press(starters);

    expect(starters).toBeChecked();
  });

  it('unselects an option when pressed again', () => {
    renderPreferences();

    const mains = screen.getByRole('checkbox', { name: 'Mains' });
    fireEvent.press(mains);
    expect(mains).toBeChecked();

    fireEvent.press(mains);
    expect(mains).not.toBeChecked();
  });

  it('tracks each option independently', () => {
    renderPreferences();

    fireEvent.press(screen.getByRole('checkbox', { name: 'Starters' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'Desserts' }));

    expect(screen.getByRole('checkbox', { name: 'Starters' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Desserts' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Mains' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Sides' })).not.toBeChecked();
  });

  it('preserves selections when the primary action is pressed', () => {
    renderPreferences();

    const starters = screen.getByRole('checkbox', { name: 'Starters' });
    fireEvent.press(starters);
    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(starters).toBeChecked();
  });

  it('navigates to the Menu screen when completed', async () => {
    renderPreferences();

    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/menu');
    });
  });
});
