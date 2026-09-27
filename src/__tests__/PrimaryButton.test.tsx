import { fireEvent, render, screen } from '@testing-library/react-native';

import { PrimaryButton } from '@/components/common';

describe('PrimaryButton', () => {
  it('renders the provided title', () => {
    render(<PrimaryButton title="Get started" onPress={() => {}} />);

    expect(screen.getByText('Get started')).toBeOnTheScreen();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<PrimaryButton title="Get started" onPress={onPress} testID="cta" />);

    fireEvent.press(screen.getByTestId('cta'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress while disabled', () => {
    const onPress = jest.fn();
    render(<PrimaryButton title="Get started" onPress={onPress} disabled testID="cta" />);

    fireEvent.press(screen.getByTestId('cta'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress while loading and hides the label', () => {
    const onPress = jest.fn();
    render(<PrimaryButton title="Get started" onPress={onPress} loading testID="cta" />);

    fireEvent.press(screen.getByTestId('cta'));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.queryByText('Get started')).toBeNull();
  });

  it('exposes an accessible role and busy/disabled state', () => {
    render(<PrimaryButton title="Get started" onPress={() => {}} loading />);

    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toBeBusy();
  });

  it('uses an explicit accessibilityLabel when provided', () => {
    render(
      <PrimaryButton title="Go" onPress={() => {}} accessibilityLabel="Get started with sign up" />,
    );

    expect(screen.getByLabelText('Get started with sign up')).toBeOnTheScreen();
  });
});
