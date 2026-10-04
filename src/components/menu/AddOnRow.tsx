import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrice } from '@/utils/menu';
import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface AddOnRowProps extends Testable {
  name: string;
  price: number;
  selected: boolean;
  onToggle: () => void;
}

/** Full-width selectable add-on row: name, `+$1.00`, and a checkbox indicator. */
function AddOnRowComponent({ name, price, selected, onToggle, testID }: AddOnRowProps) {
  const formattedPrice = `+${formatPrice(price)}`;

  return (
    <Pressable
      testID={testID}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${name}, ${formattedPrice}`}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}
    >
      <View style={[styles.box, selected ? styles.boxChecked : styles.boxUnchecked]}>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>{formattedPrice}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: sizing.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  rowSelected: {
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  box: {
    width: sizing.checkbox,
    height: sizing.checkbox,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thick,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  boxUnchecked: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  check: {
    ...textVariants.caption,
    color: colors.textOnPrimary,
  },
  name: {
    ...textVariants.body,
    flex: 1,
    color: colors.textPrimary,
  },
  price: {
    ...textVariants.lead,
    color: colors.primary,
  },
});

export const AddOnRow = memo(AddOnRowComponent);
