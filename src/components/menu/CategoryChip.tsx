import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { borderWidth, colors, radii, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface CategoryChipProps extends Testable {
  label: string;
  active: boolean;
  onPress: () => void;
}

/** Pill-shaped category filter chip (Figma "Category filters"). */
function CategoryChipComponent({ label, active, onPress, testID }: CategoryChipProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: borderWidth.hairline,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  label: {
    ...textVariants.category,
  },
  labelActive: {
    color: colors.surface,
  },
  labelInactive: {
    color: colors.textPrimary,
  },
});

export const CategoryChip = memo(CategoryChipComponent);
