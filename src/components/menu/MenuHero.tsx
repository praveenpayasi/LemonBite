import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { MenuSearch } from '@/components/menu/MenuSearch';
import { ProfileAvatar } from '@/components/profile';
import { colors, radii, sizing, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

import heroImage from '@/assets/images/welcome-hero.jpg';
import lemonMark from '@/assets/images/little-lemon-mark.png';

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

/** Menu screen header: brand nav bar, green restaurant hero, and search field. */
export function MenuHero({
  searchQuery,
  onSearchChange,
  avatarUri,
  avatarInitials,
  onPressProfile,
}: MenuHeroProps) {
  return (
    <View>
      <View style={styles.navBar}>
        <Image
          source={lemonMark}
          style={styles.navMark}
          accessibilityLabel="LemonBite"
        />
        <Pressable
          onPress={onPressProfile}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          testID="open-profile"
        >
          <ProfileAvatar uri={avatarUri} initials={avatarInitials} size={sizing.avatarSm} />
        </Pressable>
      </View>

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
  navBar: {
    height: sizing.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  navMark: {
    width: sizing.logoMark,
    height: sizing.logoMark,
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
