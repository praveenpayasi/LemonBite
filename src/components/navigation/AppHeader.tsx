import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import { LittleLemonLogo } from '@/components/common';
import { ProfileAvatar } from '@/components/profile';
import { useCart } from '@/context/CartContext';
import { routes } from '@/constants/routes';
import { borderWidth, colors, fontSizes, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface AppHeaderProps extends Testable {
  /** Renders the built-in back button in the leading slot. Ignored when `left` is set. */
  showBack?: boolean;
  /** Custom leading element; takes precedence over `showBack`. */
  left?: ReactNode;
  /** Renders the centered brand wordmark. Defaults to true. */
  showLogo?: boolean;
  /** Renders the built-in cart button with its item-count badge. */
  showCart?: boolean;
  /** Renders a profile avatar in the trailing slot when provided (may be null for initials). */
  avatarUri?: string | null;
  avatarInitials?: string;
  /** Omit to render the avatar as a non-interactive image rather than a button. */
  onPressAvatar?: () => void;
  /** Accessible name for the avatar. */
  avatarLabel?: string;
  /** Custom trailing element; takes precedence over the built-in cart/avatar. */
  right?: ReactNode;
  /** Optional style overrides for the header container. */
  style?: StyleProp<ViewStyle>;
}

/** Shopping-bag glyph drawn with views so the app needs no icon dependency. */
function CartGlyph() {
  return (
    <View style={styles.bag}>
      <View style={styles.bagHandle} />
      <View style={styles.bagBody} />
    </View>
  );
}

/** Cart button + live count badge. Split out so `useCart` is never called conditionally. */
function CartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const isOnCart = pathname === routes.cart;
  const label =
    totalItemsCount > 0 ? `Open cart, ${totalItemsCount} items` : 'Open cart, cart is empty';

  return (
    <Pressable
      // `navigate` reuses an existing cart screen instead of stacking duplicates.
      onPress={() => router.navigate(routes.cart)}
      disabled={isOnCart}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={isOnCart ? undefined : 'Opens your cart'}
      accessibilityState={{ disabled: isOnCart }}
      testID="header-cart-button"
      style={({ pressed }) => [styles.cartButton, pressed && !isOnCart && styles.pressed]}
    >
      <CartGlyph />
      {totalItemsCount > 0 ? (
        <View style={styles.badge} testID="header-cart-badge">
          <Text style={styles.badgeText}>{totalItemsCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Top-of-screen app chrome: optional back button, centered wordmark and a
 * trailing slot (built-in cart badge + avatar, or a custom element).
 * Holds no screen logic beyond `back`/`cart` navigation.
 */
export function AppHeader({
  showBack = false,
  left,
  showLogo = true,
  showCart = false,
  avatarUri,
  avatarInitials = '',
  onPressAvatar,
  avatarLabel,
  right,
  style,
  testID,
}: AppHeaderProps) {
  const router = useRouter();
  const showAvatar = avatarUri !== undefined;

  const leading =
    left ??
    (showBack ? (
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        testID="header-back-button"
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
    ) : null);

  const trailing =
    right ??
    (showCart || showAvatar ? (
      <View style={styles.trailing}>
        {showCart ? <CartButton /> : null}
        {showAvatar ? (
          onPressAvatar ? (
            <Pressable
              onPress={onPressAvatar}
              accessibilityRole="button"
              accessibilityLabel={avatarLabel ?? 'Open profile'}
              accessibilityHint="Opens your profile"
              testID="header-avatar-button"
              style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
            >
              <ProfileAvatar
                uri={avatarUri ?? null}
                initials={avatarInitials}
                size={sizing.iconLg}
              />
            </Pressable>
          ) : (
            <ProfileAvatar
              uri={avatarUri ?? null}
              initials={avatarInitials}
              size={sizing.iconLg}
              accessibilityLabel={avatarLabel ?? 'Your profile photo'}
              testID="header-avatar"
            />
          )
        ) : null}
      </View>
    ) : null);

  return (
    <View testID={testID} style={[styles.header, style]}>
      <View style={styles.side}>{leading}</View>
      {showLogo ? <LittleLemonLogo label="LemonBite" style={styles.logo} /> : null}
      <View style={[styles.side, styles.sideRight]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  side: {
    minWidth: sizing.avatarLg,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    fontSize: fontSizes.xxxl,
  },
  pressed: {
    opacity: 0.7,
  },
  backButton: {
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    borderRadius: radii.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl,
    color: colors.textPrimary,
  },
  avatarButton: {
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    width: sizing.touchTarget,
    height: sizing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bag: {
    width: sizing.iconMd,
    height: sizing.iconMd,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bagHandle: {
    width: 12,
    height: 8,
    borderWidth: borderWidth.thick,
    borderBottomWidth: 0,
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
    borderColor: colors.primary,
  },
  bagBody: {
    width: sizing.iconMd,
    height: 15,
    borderWidth: borderWidth.thick,
    borderColor: colors.primary,
    borderRadius: radii.sm,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: sizing.badge,
    height: sizing.badge,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...textVariants.caption,
    color: colors.textOnSecondary,
  },
});
