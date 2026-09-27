import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface NotificationCheckboxProps extends Testable {
  label: string;
  checked: boolean;
  onToggle: () => void;
  /** Renders a bottom divider (omit on the last row). */
  divider?: boolean;
}

/** A single email-notification preference row with a checkbox. */
export function NotificationCheckbox({
  label,
  checked,
  onToggle,
  divider = true,
  testID,
}: NotificationCheckboxProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={[styles.row, divider && styles.divider]}
    >
      <View style={[styles.box, checked ? styles.boxChecked : styles.boxUnchecked]}>
        {checked ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    height: sizing.rowHeight,
    paddingHorizontal: spacing.smd,
    backgroundColor: colors.background,
  },
  divider: {
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  box: {
    width: sizing.checkbox,
    height: sizing.checkbox,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.primary,
  },
  boxUnchecked: {
    backgroundColor: colors.background,
    borderWidth: borderWidth.thick,
    borderColor: colors.border,
  },
  check: {
    ...textVariants.category,
    color: colors.textOnPrimary,
  },
  label: {
    ...textVariants.body,
    flex: 1,
    color: colors.textPrimary,
  },
});
