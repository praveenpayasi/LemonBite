import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface QuantitySelectorProps extends Testable {
  /** Current quantity, owned by the caller. */
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Lowest allowed quantity; decrement is disabled at this value. Defaults to 1. */
  min?: number;
  /** Highest allowed quantity; increment is disabled at this value. Defaults to 99. */
  max?: number;
  /** Optional style overrides for the outer row. */
  style?: StyleProp<ViewStyle>;
}

/** Stepper control `[-] n [+]` with accessible 44x44pt targets. Controlled and presentational. */
function QuantitySelectorComponent({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  style,
  testID,
}: QuantitySelectorProps) {
  const decrementDisabled = quantity <= min;
  const incrementDisabled = quantity >= max;

  return (
    <View style={[styles.row, style]} testID={testID}>
      <Pressable
        onPress={onDecrement}
        disabled={decrementDisabled}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        accessibilityState={{ disabled: decrementDisabled }}
        testID={testID ? `${testID}-decrement` : undefined}
        style={({ pressed }) => [
          styles.button,
          decrementDisabled && styles.buttonDisabled,
          pressed && !decrementDisabled && styles.pressed,
        ]}
      >
        <Text style={[styles.symbol, decrementDisabled && styles.symbolDisabled]}>−</Text>
      </Pressable>

      <Text accessibilityLabel={`Quantity ${quantity}`} style={styles.quantity}>
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrement}
        disabled={incrementDisabled}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        accessibilityState={{ disabled: incrementDisabled }}
        testID={testID ? `${testID}-increment` : undefined}
        style={({ pressed }) => [
          styles.button,
          incrementDisabled && styles.buttonDisabled,
          pressed && !incrementDisabled && styles.pressed,
        ]}
      >
        <Text style={[styles.symbol, incrementDisabled && styles.symbolDisabled]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
  },
  button: {
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    borderRadius: radii.pill,
    borderWidth: borderWidth.thick,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    borderColor: colors.disabled,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.85,
  },
  symbol: {
    ...textVariants.sectionTitle,
    color: colors.primary,
  },
  symbolDisabled: {
    color: colors.disabled,
  },
  quantity: {
    ...textVariants.sectionTitle,
    minWidth: sizing.touchTarget,
    textAlign: 'center',
    color: colors.textPrimary,
  },
});

export const QuantitySelector = memo(QuantitySelectorComponent);
