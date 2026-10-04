import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPrice } from '@/utils/menu';
import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { MenuItem as MenuItemModel, Testable } from '@/types';

export interface MenuItemProps extends Testable {
  item: MenuItemModel;
  /** When provided the card becomes a button that opens the dish details. */
  onPress?: () => void;
}

/**
 * Presentational menu item card (Figma "Dish card"): image, title, price and
 * description. Owns no data or navigation logic.
 */
function MenuItemComponent({ item, onPress, testID }: MenuItemProps) {
  const price = formatPrice(item.price);
  const label = `${item.title}, ${price}. ${item.description}`;

  const content = (
    <>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.price}>{price}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={styles.card}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Navigates to dish details"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.smd,
    padding: spacing.smd,
    borderRadius: radii.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: sizing.menuItemImage,
    height: sizing.menuItemImage,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...textVariants.cardTitle,
    flex: 1,
    color: colors.textPrimary,
  },
  price: {
    ...textVariants.lead,
    color: colors.primary,
  },
  description: {
    ...textVariants.compactBody,
    color: colors.textPrimary,
  },
});

export const MenuItem = memo(MenuItemComponent);
