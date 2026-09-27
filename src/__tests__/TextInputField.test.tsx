import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextInputField } from '@/components/forms';

describe('TextInputField', () => {
  it('renders its label and current value', () => {
    render(<TextInputField label="Email" value="hi@little.lemon" onChangeText={() => {}} />);

    expect(screen.getByText('Email')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('hi@little.lemon')).toBeOnTheScreen();
  });

  it('calls onChangeText as the user types', () => {
    const onChangeText = jest.fn();
    render(
      <TextInputField label="Email" value="" onChangeText={onChangeText} testID="email-field" />,
    );

    fireEvent.changeText(screen.getByTestId('email-field'), 'a@b.com');

    expect(onChangeText).toHaveBeenCalledWith('a@b.com');
  });

  it('announces the error message to assistive tech', () => {
    render(
      <TextInputField label="Email" value="" onChangeText={() => {}} error="Email is required" />,
    );

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('Email is required');
  });

  it('falls back to the label for its accessible name', () => {
    render(<TextInputField label="Password" value="" onChangeText={() => {}} secureTextEntry />);

    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
  });

  it('is not editable when editable is false', () => {
    render(
      <TextInputField
        label="Email"
        value="locked"
        onChangeText={() => {}}
        editable={false}
        testID="email-field"
      />,
    );

    expect(screen.getByTestId('email-field').props.editable).toBe(false);
  });
});
