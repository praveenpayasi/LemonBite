import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { QuantitySelector } from '@/components/common';
import { formatPrice } from '@/utils/menu';
import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { CartItem, Testable } from '@/types';

export interface CartItemRowProps extends Testable {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

/** Compact cart line: thumbnail, `1 × Dish`, add-on breakdown, price and controls. */
function CartItemRowComponent({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  testID,
}: CartItemRowProps) {
  const heading = `${item.quantity} × ${item.title}`;

  return (
    <View style={styles.row} testID={testID}>
      <Image
        source={{ uri: item.image }}
        style={styles.thumbnail}
        resizeMode="cover"
        accessibilityLabel={`A photo of ${item.title}`}
      />

      <View style={styles.details}>
        <View style={styles.headingRow}>
          <Text style={styles.heading} numberOfLines={2}>
            {heading}
          </Text>
          <Text style={styles.price}>{formatPrice(item.totalPrice)}</Text>
        </View>

        {item.selectedAddOns.length > 0 ? (
          <View style={styles.addOns}>
            {item.selectedAddOns.map((addOn) => (
              <Text key={addOn.id} style={styles.addOn}>
                {`+ ${addOn.name} (${formatPrice(addOn.price)})`}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.controls}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            testID={testID ? `${testID}-quantity` : undefined}
          />
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title}`}
            accessibilityHint="Removes this dish from your cart"
            testID={testID ? `${testID}-remove` : undefined}
            style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
          >
            <Text style={styles.removeLabel}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.smd,
    padding: spacing.smd,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  thumbnail: {
    width: sizing.cartThumbnail,
    height: sizing.cartThumbnail,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heading: {
    ...textVariants.cardTitle,
    flex: 1,
    color: colors.textPrimary,
  },
  price: {
    ...textVariants.lead,
    color: colors.primary,
  },
  addOns: {
    gap: spacing.xs,
  },
  addOn: {
    ...textVariants.compactBody,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  remove: {
    minHeight: sizing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  removeLabel: {
    ...textVariants.category,
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.7,
  },
});

export const CartItemRow = memo(CartItemRowComponent);
