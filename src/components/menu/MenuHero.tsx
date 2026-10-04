import { Image, StyleSheet, Text, View } from 'react-native';

import { MenuSearch } from '@/components/menu/MenuSearch';
import { AppHeader } from '@/components/navigation';
import { colors, layout, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

import heroImage from '@/assets/images/welcome-hero.jpg';

const CITY = 'Chicago';
const DESCRIPTION =
  'We are a family-owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.';

export interface MenuHeroProps extends Testable {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  avatarUri: string | null;
  avatarInitials: string;
  onPressProfile: () => void;
}

/** Menu screen header: app header with cart badge, green restaurant hero, and search field. */
export function MenuHero({
  searchQuery,
  onSearchChange,
  avatarUri,
  avatarInitials,
  onPressProfile,
}: MenuHeroProps) {
  return (
    <View>
      <AppHeader
        showLogo
        showCart
        avatarUri={avatarUri}
        avatarInitials={avatarInitials}
        onPressAvatar={onPressProfile}
        style={styles.header}
      />

      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroText}>
            <Text accessibilityRole="header" style={styles.brand}>
              LemonBite
            </Text>
            <Text style={styles.city}>{CITY}</Text>
            <Text style={styles.description}>{DESCRIPTION}</Text>
          </View>
          <Image
            source={heroImage}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="A plate of fresh Mediterranean dishes"
          />
        </View>
        <MenuSearch value={searchQuery} onChangeText={onSearchChange} testID="menu-search" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  hero: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  brand: {
    ...textVariants.display,
    color: colors.secondary,
  },
  city: {
    ...textVariants.subtitle,
    color: colors.textOnPrimary,
  },
  description: {
    ...textVariants.lead,
    color: colors.surface,
  },
  heroImage: {
    width: sizing.heroThumbnail,
    height: sizing.heroThumbnail,
    borderRadius: radii.lg,
  },
});
