import { memo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, borderWidth, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export type PrimaryButtonVariant = 'primary' | 'secondary' | 'outline';

export interface PrimaryButtonProps extends Testable {
  /** Text label shown inside the button. */
  title: string;
  /** Called when the button is pressed. */
  onPress: () => void;
  /** Visual style. `primary` (green), `secondary` (yellow), `outline` (bordered). */
  variant?: PrimaryButtonVariant;
  /** Disables interaction and dims the button. */
  disabled?: boolean;
  /** Shows a spinner and blocks interaction while an async action runs. */
  loading?: boolean;
  /** Accessible label for screen readers. Defaults to `title`. */
  accessibilityLabel?: string;
  /** Supplementary hint describing the outcome of pressing the button. */
  accessibilityHint?: string;
  /** Optional style overrides for the button container. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Brand call-to-action button. Presentational only — it owns no business or
 * navigation logic.
 */
function PrimaryButtonComponent({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant].button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].label.color} />
      ) : (
        <Text style={[styles.label, variantStyles[variant].label]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizing.buttonHeight,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  label: {
    ...textVariants.button,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    button: { backgroundColor: colors.primary },
    label: { color: colors.secondary },
  }),
  secondary: StyleSheet.create({
    button: { backgroundColor: colors.secondary },
    label: { color: colors.primary },
  }),
  outline: StyleSheet.create({
    button: {
      backgroundColor: colors.background,
      borderWidth: borderWidth.thick,
      borderColor: colors.primary,
    },
    label: { color: colors.primary },
  }),
} as const;

export const PrimaryButton = memo(PrimaryButtonComponent);
