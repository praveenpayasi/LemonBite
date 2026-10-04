import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/common';
import {
  borderWidth,
  colors,
  elevation,
  radii,
  sizing,
  spacing,
  textVariants,
} from '@/theme';
import type { Testable } from '@/types';

export interface SuccessModalCardProps extends Testable {
  orderNumber: string;
  estimatedTime: string;
  onTrackOrder: () => void;
  onBackToHome: () => void;
}

const SUBHEADING = 'Your order will be with you shortly.';
const GRATITUDE = 'Thank you for your business.';

/** Checkmark drawn with views so the app needs no icon dependency. */
function SuccessCheck() {
  return (
    <View
      style={styles.iconCircle}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.checkShort} />
      <View style={styles.checkLong} />
    </View>
  );
}

/** Elevated confirmation card: success branding, order reference and actions. */
export function SuccessModalCard({
  orderNumber,
  estimatedTime,
  onTrackOrder,
  onBackToHome,
  testID,
}: SuccessModalCardProps) {
  return (
    <View style={styles.card} testID={testID}>
      <SuccessCheck />

      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.headline}>
          Success!
        </Text>
        <Text style={styles.subheading}>{SUBHEADING}</Text>
      </View>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{orderNumber}</Text>
        </View>
        <View style={[styles.badge, styles.badgeAccent]}>
          <Text style={styles.badgeText}>{`Estimated Arrival: ${estimatedTime}`}</Text>
        </View>
      </View>

      <Text style={styles.gratitude}>{GRATITUDE}</Text>

      <View style={styles.actions}>
        <PrimaryButton
          title="Track Order"
          variant="secondary"
          onPress={onTrackOrder}
          accessibilityHint="Shows the status of your order"
          testID="track-order"
        />
        <PrimaryButton
          title="Back to Home"
          variant="outline"
          onPress={onBackToHome}
          accessibilityHint="Clears your cart and returns to the menu"
          testID="back-to-home"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: elevation.card,
    shadowOffset: { width: 0, height: spacing.xs },
    elevation: elevation.card,
  },
  iconCircle: {
    width: sizing.successIcon,
    height: sizing.successIcon,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkShort: {
    position: 'absolute',
    width: spacing.md,
    height: borderWidth.thick * 2,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    transform: [{ translateX: -spacing.sm }, { translateY: spacing.xs }, { rotate: '45deg' }],
  },
  checkLong: {
    position: 'absolute',
    width: spacing.xl,
    height: borderWidth.thick * 2,
    borderRadius: radii.sm,
    backgroundColor: colors.secondary,
    transform: [{ translateX: spacing.xs }, { rotate: '-45deg' }],
  },
  copy: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  headline: {
    ...textVariants.heading,
    color: colors.primary,
    textAlign: 'center',
  },
  subheading: {
    ...textVariants.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  badges: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  badgeAccent: {
    backgroundColor: colors.accentSoft,
  },
  badgeText: {
    ...textVariants.category,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gratitude: {
    ...textVariants.lead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.smd,
  },
});
