import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface CutleryOptionProps extends Testable {
  selected: boolean;
  onToggle: () => void;
}

const SUBTITLE = 'Help reduce plastic waste, only ask for cutlery if you need it';

/** Cutlery preference row. The whole row toggles the preference. */
function CutleryOptionComponent({ selected, onToggle, testID }: CutleryOptionProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: selected }}
      accessibilityLabel="Cutlery"
      accessibilityHint={SUBTITLE}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={styles.title}>Cutlery</Text>
        <Text style={styles.subtitle}>{SUBTITLE}</Text>
      </View>
      <View style={[styles.radio, selected ? styles.radioSelected : styles.radioUnselected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
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
    padding: spacing.md,
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
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...textVariants.compactBody,
    color: colors.textSecondary,
  },
  radio: {
    width: sizing.checkbox,
    height: sizing.checkbox,
    borderRadius: radii.pill,
    borderWidth: borderWidth.thick,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselected: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  radioSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  radioDot: {
    width: sizing.iconSm / 2,
    height: sizing.iconSm / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
});

export const CutleryOption = memo(CutleryOptionComponent);
