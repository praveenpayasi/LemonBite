import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton, QuantitySelector, ScreenContainer } from '@/components/common';
import { AddOnRow } from '@/components/menu';
import { AppHeader } from '@/components/navigation';
import { useMenuDetails } from '@/hooks';
import { loadOnboardingData } from '@/services/storage/onboardingStorage';
import { loadProfile } from '@/services/storage/profileStorage';
import { getInitials, mergeProfile } from '@/utils/profile';
import { formatPrice } from '@/utils/menu';
import { routes } from '@/constants/routes';
import { colors, radii, sizing, spacing, textVariants } from '@/theme';

const DELIVERY_TIME = 'Delivery time: 20 minutes';

interface HeaderAvatar {
  uri: string | null;
  initials: string;
}

/** Delivery truck glyph drawn with views so the app needs no icon dependency. */
function TruckIcon() {
  return (
    <View style={styles.truck} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.truckBody} />
      <View style={styles.truckCab} />
      <View style={[styles.truckWheel, styles.truckWheelLeft]} />
      <View style={[styles.truckWheel, styles.truckWheelRight]} />
    </View>
  );
}

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

  const [avatar, setAvatar] = useState<HeaderAvatar>({ uri: null, initials: '' });
  const [feedback, setFeedback] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [profile, onboarding] = await Promise.all([loadProfile(), loadOnboardingData()]);
        const merged = mergeProfile(profile, onboarding);
        if (active) {
          setAvatar({
            uri: merged.avatarUri,
            initials: getInitials(merged.firstName, merged.lastName),
          });
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

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

      <View style={styles.deliveryRow}>
        <TruckIcon />
        <Text style={styles.deliveryText}>{DELIVERY_TIME}</Text>
        <Pressable
          onPress={() => setFeedback('Delivery options are coming soon.')}
          accessibilityRole="button"
          accessibilityLabel="Change delivery time"
          testID="change-delivery"
          style={({ pressed }) => [styles.changeButton, pressed && styles.pressed]}
        >
          <Text style={styles.changeLabel}>Change</Text>
        </Pressable>
      </View>

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
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
    paddingVertical: spacing.sm,
  },
  deliveryText: {
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
