import { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { MenuItem as MenuItemModel, Testable } from '@/types';

export interface MenuItemProps extends Testable {
  item: MenuItemModel;
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Presentational menu item card (Figma "Dish card"): image, title, price and
 * description. Owns no data or navigation logic.
 */
function MenuItemComponent({ item, testID }: MenuItemProps) {
  const price = formatPrice(item.price);

  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${item.title}, ${price}. ${item.description}`}
      style={styles.card}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />
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
    </View>
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
