import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, ScreenContainer } from '@/components/common';
import { AppHeader } from '@/components/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/menu';
import { routes } from '@/constants/routes';
import { useRouter } from 'expo-router';
import { colors, spacing, textVariants } from '@/theme';

/**
 * Order confirmation placeholder. Shows what was ordered and clears the cart;
 * tracking and order history arrive in a later phase.
 */
export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { totalItemsCount, total, cutleryRequested, clearCart } = useCart();

  const handleDone = () => {
    clearCart();
    router.replace(routes.menu);
  };

  return (
    <ScreenContainer style={styles.screen}>
      <AppHeader showLogo />
      <View style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>
          Order confirmed
        </Text>
        <Text style={styles.summary}>
          {`${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'} · ${formatPrice(total)}`}
        </Text>
        <Text style={styles.detail}>
          {cutleryRequested ? 'Cutlery included.' : 'No cutlery — thanks for helping us cut waste.'}
        </Text>
        <Text style={styles.detail}>Your order will arrive in about 20 minutes.</Text>
      </View>
      <PrimaryButton
        title="Back to Menu"
        onPress={handleDone}
        accessibilityHint="Clears your cart and returns to the menu"
        testID="confirmation-done"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    ...textVariants.heading,
    color: colors.primary,
    textAlign: 'center',
  },
  summary: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  detail: {
    ...textVariants.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
