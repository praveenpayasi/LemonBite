import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { DeliveryInfoRow, ScreenContainer } from '@/components/common';
import { SuccessModalCard } from '@/components/cart';
import { AppHeader } from '@/components/navigation';
import { useHeaderAvatar, useOrderConfirmation } from '@/hooks';
import { formatPrice } from '@/utils/menu';
import { routes } from '@/constants/routes';
import { colors, layout, spacing, textVariants } from '@/theme';

/**
 * Order confirmation screen (`/order-confirmation`). The placed order is shown
 * as read-only context behind a centered success card; `useOrderConfirmation`
 * snapshots the cart and resets it.
 */
export default function OrderConfirmationScreen() {
  const router = useRouter();
  const avatar = useHeaderAvatar();
  const { order, orderNumber, estimatedTime, handleTrackOrder, handleBackToHome } =
    useOrderConfirmation();

  return (
    <View style={styles.root}>
      <ScreenContainer scroll style={styles.screen}>
        <AppHeader
          showBack={false}
          showLogo
          avatarUri={avatar.uri}
          avatarInitials={avatar.initials}
          onPressAvatar={() => router.push(routes.profile)}
        />

        <DeliveryInfoRow />

        <Text style={styles.cutlery}>
          {`Cutlery requested: ${order.cutleryRequested ? 'Yes' : 'No'}`}
        </Text>

        {order.items.length > 0 ? (
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Order Summary
            </Text>
            <View style={styles.items}>
              {order.items.map((item) => (
                <Text key={item.id} style={styles.item} testID={`summary-${item.dishId}`}>
                  {`${item.quantity} × ${item.title} — ${formatPrice(item.totalPrice)}`}
                </Text>
              ))}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total paid</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </View>
          </View>
        ) : null}
      </ScreenContainer>

      <View style={styles.overlay}>
        <SuccessModalCard
          orderNumber={orderNumber}
          estimatedTime={estimatedTime}
          onTrackOrder={handleTrackOrder}
          onBackToHome={handleBackToHome}
          testID="success-card"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  cutlery: {
    ...textVariants.lead,
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  items: {
    gap: spacing.xs,
  },
  item: {
    ...textVariants.body,
    color: colors.textSecondary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  totalValue: {
    ...textVariants.sectionTitle,
    color: colors.primary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: colors.scrim,
  },
});
