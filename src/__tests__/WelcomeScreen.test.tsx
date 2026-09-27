import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import WelcomeScreen from '@/app/index';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderWelcome() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <WelcomeScreen />
    </SafeAreaProvider>,
  );
}

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });
  it('renders the LemonBite branding and welcome heading', () => {
    renderWelcome();

    expect(screen.getByText('LemonBite')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Welcome to LemonBite' })).toBeOnTheScreen();
  });

  it('renders the supporting introduction copy', () => {
    renderWelcome();

    expect(screen.getByText(/Fresh Mediterranean favorites/i)).toBeOnTheScreen();
  });

  it('renders a pressable primary call to action', () => {
    renderWelcome();

    const cta = screen.getByRole('button', { name: 'Get Started' });

    expect(cta).toBeOnTheScreen();
    expect(() => fireEvent.press(cta)).not.toThrow();
  });

  it('navigates to the Sign Up screen when Get Started is pressed', () => {
    renderWelcome();

    fireEvent.press(screen.getByRole('button', { name: 'Get Started' }));

    expect(mockPush).toHaveBeenCalledWith('/signup');
  });
});
