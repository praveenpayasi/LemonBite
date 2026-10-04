import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DeliveryInfoRow, PrimaryButton, ScreenContainer } from '@/components/common';
import { CartItemRow, CutleryOption, PriceSummary, RecommendedDishes } from '@/components/cart';
import { AppHeader } from '@/components/navigation';
import { useCartScreen, useHeaderAvatar } from '@/hooks';
import { formatPrice } from '@/utils/menu';
import { routes } from '@/constants/routes';
import { colors, spacing, textVariants } from '@/theme';

/**
 * Order summary screen (`/cart`). Composition only: cart totals, fees and
 * recommendations are resolved by `useCartScreen`.
 */
export default function CartScreen() {
  const router = useRouter();
  const avatar = useHeaderAvatar();
  const {
    items,
    isEmpty,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    cutleryRequested,
    toggleCutlery,
    incrementItem,
    decrementItem,
    removeItem,
    recommendedDishes,
    addRecommendedDish,
    handleCheckout,
    exploreMenu,
  } = useCartScreen();
  const [notice, setNotice] = useState<string | null>(null);

  const header = (
    <AppHeader
      showBack
      showCart
      avatarUri={avatar.uri}
      avatarInitials={avatar.initials}
      onPressAvatar={() => router.push(routes.profile)}
    />
  );

  if (isEmpty) {
    return (
      <ScreenContainer style={styles.screen}>
        {header}
        <View style={styles.empty}>
          <Text accessibilityRole="header" style={styles.emptyTitle}>
            Your cart is empty
          </Text>
          <Text style={styles.emptyBody}>
            Browse the menu and add a few Mediterranean favourites to get started.
          </Text>
          <PrimaryButton
            title="Explore Menu"
            onPress={exploreMenu}
            accessibilityHint="Returns to the menu"
            style={styles.emptyButton}
            testID="explore-menu"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scroll
      style={styles.screen}
      footer={
        <PrimaryButton
          title={`Checkout — ${formatPrice(total)}`}
          variant="secondary"
          onPress={handleCheckout}
          accessibilityHint="Places your order"
          testID="checkout"
        />
      }
    >
      {header}

      <DeliveryInfoRow onChange={() => setNotice('Delivery options are coming soon.')} />

      <CutleryOption selected={cutleryRequested} onToggle={toggleCutlery} testID="cutlery" />

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Order Summary
        </Text>
        <Text accessibilityRole="header" style={styles.subsectionTitle}>
          Items
        </Text>
        <View style={styles.items}>
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onIncrement={() => incrementItem(item.id)}
              onDecrement={() => decrementItem(item.id)}
              onRemove={() => removeItem(item.id)}
              testID={`cart-item-${item.dishId}`}
            />
          ))}
        </View>
      </View>

      <RecommendedDishes dishes={recommendedDishes} onAddDish={addRecommendedDish} />

      <PriceSummary
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        serviceFee={serviceFee}
        total={total}
        testID="price-summary"
      />

      {notice ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          {notice}
        </Text>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.smd,
  },
  emptyTitle: {
    ...textVariants.heading,
    color: colors.primary,
    textAlign: 'center',
  },
  emptyBody: {
    ...textVariants.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.smd,
  },
  sectionTitle: {
    ...textVariants.heading,
    color: colors.primary,
  },
  subsectionTitle: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  items: {
    gap: spacing.smd,
  },
  notice: {
    ...textVariants.lead,
    color: colors.primary,
  },
});
