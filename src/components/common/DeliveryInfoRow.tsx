import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface DeliveryInfoRowProps extends Testable {
  /** Human-readable delivery estimate. */
  label?: string;
  onChange: () => void;
}

/** Delivery truck glyph drawn with views so the app needs no icon dependency. */
function TruckIcon() {
  return (
    <View
      style={styles.truck}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.truckBody} />
      <View style={styles.truckCab} />
      <View style={[styles.truckWheel, styles.truckWheelLeft]} />
      <View style={[styles.truckWheel, styles.truckWheelRight]} />
    </View>
  );
}

/** Delivery estimate with a secondary "Change" action. Presentational. */
export function DeliveryInfoRow({
  label = 'Delivery time: 20 minutes',
  onChange,
  testID,
}: DeliveryInfoRowProps) {
  return (
    <View style={styles.row} testID={testID}>
      <TruckIcon />
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onChange}
        accessibilityRole="button"
        accessibilityLabel="Change delivery time"
        accessibilityHint="Opens delivery time options"
        testID="change-delivery"
        style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
      >
        <Text style={styles.changeLabel}>Change</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.sm,
  },
  label: {
    ...textVariants.lead,
    flex: 1,
    color: colors.textPrimary,
  },
  changeButton: {
    minHeight: sizing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  changeLabel: {
    ...textVariants.category,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
  truck: {
    width: sizing.iconMd,
    height: sizing.iconSm,
  },
  truckBody: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  truckCab: {
    position: 'absolute',
    right: 0,
    top: 3,
    width: 9,
    height: 7,
    borderTopRightRadius: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  truckWheel: {
    position: 'absolute',
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.textPrimary,
  },
  truckWheelLeft: {
    left: 3,
  },
  truckWheelRight: {
    right: 3,
  },
});
