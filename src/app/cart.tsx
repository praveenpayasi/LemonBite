import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/common';
import { AppHeader } from '@/components/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/menu';
import { colors, spacing, textVariants } from '@/theme';

/**
 * Cart screen placeholder. The cart currently reports its totals only; the full
 * line-item list and checkout flow land in a later phase.
 */
export default function CartScreen() {
  const { totalItemsCount, subtotal } = useCart();

  return (
    <ScreenContainer style={styles.screen}>
      <AppHeader showBack />
      <View style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>
          Your cart
        </Text>
        <Text style={styles.summary}>
          {totalItemsCount === 0
            ? 'Your cart is empty.'
            : `${totalItemsCount} item${totalItemsCount === 1 ? '' : 's'} · ${formatPrice(subtotal)}`}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.md,
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
  },
  summary: {
    ...textVariants.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
