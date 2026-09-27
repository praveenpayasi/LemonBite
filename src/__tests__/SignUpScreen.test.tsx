import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SignUpScreen from '@/app/signup';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderSignUp() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <SignUpScreen />
    </SafeAreaProvider>,
  );
}

describe('SignUpScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });
  it('renders the branding, heading and required form fields', () => {
    renderSignUp();

    expect(screen.getByText('LemonBite')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Let us get to know you' })).toBeOnTheScreen();
    expect(screen.getByText('First Name')).toBeOnTheScreen();
    expect(screen.getByText('Email')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next' })).toBeOnTheScreen();
  });

  it('lets the user enter a first name and an email', () => {
    renderSignUp();

    fireEvent.changeText(screen.getByTestId('signup-first-name'), 'John');
    fireEvent.changeText(screen.getByTestId('signup-email'), 'john.doe@example.com');

    expect(screen.getByDisplayValue('John')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeOnTheScreen();
  });

  it('shows validation feedback when required fields are empty', () => {
    renderSignUp();

    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Please enter your first name.')).toBeOnTheScreen();
    expect(screen.getByText('Please enter your email address.')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows validation feedback for an invalid email format', () => {
    renderSignUp();

    fireEvent.changeText(screen.getByTestId('signup-first-name'), 'John');
    fireEvent.changeText(screen.getByTestId('signup-email'), 'not-an-email');
    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Please enter a valid email address.')).toBeOnTheScreen();
  });

  it('rejects a first name that contains numbers as the user types', () => {
    renderSignUp();

    fireEvent.changeText(screen.getByTestId('signup-first-name'), 'John3');

    expect(screen.getByText('First name cannot contain numbers.')).toBeOnTheScreen();
  });

  it('shows the email error live and clears it once the value is valid', () => {
    renderSignUp();

    const emailInput = screen.getByTestId('signup-email');
    fireEvent.changeText(emailInput, 'not-an-email');
    expect(screen.getByText('Please enter a valid email address.')).toBeOnTheScreen();

    fireEvent.changeText(emailInput, 'john.doe@example.com');
    expect(screen.queryByText('Please enter a valid email address.')).toBeNull();
  });

  it('accepts a valid submission and navigates to Preferences', () => {
    renderSignUp();

    fireEvent.changeText(screen.getByTestId('signup-first-name'), 'John');
    fireEvent.changeText(screen.getByTestId('signup-email'), 'john.doe@example.com');
    fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/preferences');
  });
});
