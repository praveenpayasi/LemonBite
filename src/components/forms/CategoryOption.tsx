import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface CategoryOptionProps extends Testable {
  /** Visible label and accessible name for the option. */
  label: string;
  /** Whether the option is currently selected. */
  selected: boolean;
  /** Toggles the option's selected state. */
  onToggle: () => void;
  /** Optional style overrides for the row. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Selectable category row with a check indicator (Figma "Category Button").
 * Controlled and presentational — selection state lives in the calling screen.
 */
function CategoryOptionComponent({ label, selected, onToggle, style, testID }: CategoryOptionProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      testID={testID}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        selected ? styles.rowSelected : styles.rowDefault,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelDefault]}>
        {label}
      </Text>
      <View
        style={[styles.indicator, selected ? styles.indicatorSelected : styles.indicatorDefault]}
      >
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: sizing.categoryButtonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.mlg,
    borderRadius: radii.md,
    borderWidth: borderWidth.thick,
  },
  rowDefault: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  rowSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    ...textVariants.category,
  },
  labelDefault: {
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.textOnPrimary,
  },
  indicator: {
    width: sizing.iconMd,
    height: sizing.iconMd,
    borderRadius: radii.pill,
    borderWidth: borderWidth.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  indicatorSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  check: {
    ...textVariants.category,
    color: colors.primary,
  },
});

export const CategoryOption = memo(CategoryOptionComponent);
