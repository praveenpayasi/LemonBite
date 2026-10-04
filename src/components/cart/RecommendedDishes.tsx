import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatPrice } from '@/utils/menu';
import { borderWidth, colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { MenuItem, Testable } from '@/types';

export interface RecommendedDishesProps extends Testable {
  /** Dishes to suggest. Sourced by the screen's hook, never fetched here. */
  dishes: MenuItem[];
  onAddDish: (dish: MenuItem) => void;
}

/** Horizontally scrollable upsell row shown beneath the cart's item list. */
export function RecommendedDishes({ dishes, onAddDish, testID }: RecommendedDishesProps) {
  if (dishes.length === 0) {
    return null;
  }

  return (
    <View style={styles.section} testID={testID}>
      <Text accessibilityRole="header" style={styles.heading}>
        Add More To Your Order!
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}
      >
        {dishes.map((dish) => (
          <View key={dish.id} style={styles.card} testID={`recommended-${dish.id}`}>
            <Image
              source={{ uri: dish.image }}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={`A photo of ${dish.title}`}
            />
            <Text style={styles.title} numberOfLines={1}>
              {dish.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {dish.description}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.price}>{formatPrice(dish.price)}</Text>
              <Pressable
                onPress={() => onAddDish(dish)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${dish.title}`}
                accessibilityHint="Adds this dish to your cart"
                testID={`add-recommended-${dish.id}`}
                style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
              >
                <Text style={styles.addLabel}>+ Add</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.smd,
  },
  heading: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  track: {
    gap: spacing.smd,
    paddingBottom: spacing.xs,
  },
  card: {
    width: sizing.recommendedCardWidth,
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: sizing.recommendedImageHeight,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  title: {
    ...textVariants.cardTitle,
    color: colors.textPrimary,
  },
  description: {
    ...textVariants.compactBody,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  price: {
    ...textVariants.lead,
    color: colors.primary,
  },
  addButton: {
    minWidth: sizing.touchTarget,
    minHeight: sizing.touchTarget,
    paddingHorizontal: spacing.smd,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    ...textVariants.category,
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
