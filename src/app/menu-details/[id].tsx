import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  DeliveryInfoRow,
  PrimaryButton,
  QuantitySelector,
  ScreenContainer,
} from '@/components/common';
import { AddOnRow } from '@/components/menu';
import { AppHeader } from '@/components/navigation';
import { useHeaderAvatar, useMenuDetails } from '@/hooks';
import { formatPrice } from '@/utils/menu';
import { routes } from '@/constants/routes';
import { colors, radii, sizing, spacing, textVariants } from '@/theme';

/**
 * Menu details screen (`/menu-details/[id]`). Composition only: all dish
 * resolution, add-on selection and pricing live in `useMenuDetails`.
 */
export default function MenuDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const dishId = typeof params.id === 'string' ? params.id : '';

  const {
    status,
    dish,
    availableAddOns,
    quantity,
    selectedAddOns,
    totalPrice,
    toggleAddOn,
    incrementQuantity,
    decrementQuantity,
    handleAddToCart,
  } = useMenuDetails(dishId);

  const avatar = useHeaderAvatar();
  const [feedback, setFeedback] = useState<string | null>(null);

  const header = (
    <AppHeader
      showBack
      showCart
      avatarUri={avatar.uri}
      avatarInitials={avatar.initials}
      onPressAvatar={() => router.push(routes.profile)}
    />
  );

  if (status === 'loading') {
    return (
      <ScreenContainer style={styles.screen}>
        {header}
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading dish" />
        </View>
      </ScreenContainer>
    );
  }

  if (status !== 'ready' || !dish) {
    const message =
      status === 'not-found'
        ? 'We couldn’t find that dish.'
        : 'We couldn’t load this dish. Please check your connection and try again.';

    return (
      <ScreenContainer style={styles.screen}>
        {header}
        <View style={styles.centered}>
          <Text accessibilityRole="alert" style={styles.stateText}>
            {message}
          </Text>
          <PrimaryButton
            title="Back to menu"
            variant="outline"
            onPress={() => router.replace(routes.menu)}
            style={styles.stateButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  const onAddToCart = () => {
    if (handleAddToCart()) {
      setFeedback(`${dish.title} added to your cart.`);
      router.back();
    }
  };

  return (
    <ScreenContainer
      scroll
      style={styles.screen}
      footer={
        <PrimaryButton
          title={`Add to Cart — ${formatPrice(totalPrice)}`}
          variant="secondary"
          onPress={onAddToCart}
          accessibilityHint="Adds this dish to your cart"
          testID="add-to-cart"
        />
      }
    >
      {header}

      <Image
        source={{ uri: dish.image }}
        style={styles.hero}
        resizeMode="cover"
        accessibilityLabel={`A photo of ${dish.title}`}
      />

      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>
          {dish.title}
        </Text>
        <Text style={styles.basePrice}>{formatPrice(dish.price)}</Text>
      </View>

      <Text style={styles.description}>{dish.description}</Text>

      <DeliveryInfoRow onChange={() => setFeedback('Delivery options are coming soon.')} />

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Add
        </Text>
        <View style={styles.addOns}>
          {availableAddOns.map((addOn) => (
            <AddOnRow
              key={addOn.id}
              name={addOn.name}
              price={addOn.price}
              selected={selectedAddOns.has(addOn.id)}
              onToggle={() => toggleAddOn(addOn.id)}
              testID={`addon-${addOn.id}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Quantity
        </Text>
        <QuantitySelector
          quantity={quantity}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          testID="quantity"
        />
      </View>

      {feedback ? (
        <Text accessibilityRole="alert" style={styles.feedback}>
          {feedback}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  stateText: {
    ...textVariants.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stateButton: {
    alignSelf: 'stretch',
  },
  hero: {
    width: '100%',
    height: sizing.detailHeroHeight,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...textVariants.heading,
    flex: 1,
    color: colors.primary,
  },
  basePrice: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  description: {
    ...textVariants.body,
    color: colors.textPrimary,
  },
  section: {
    gap: spacing.smd,
  },
  sectionTitle: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  addOns: {
    gap: spacing.sm,
  },
  feedback: {
    ...textVariants.lead,
    color: colors.primary,
  },
});
