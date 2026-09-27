import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LittleLemonLogo, PrimaryButton, ScreenContainer } from '@/components/common';
import { colors, layout, radii, sizing, spacing, textVariants } from '@/theme';
import { routes } from '@/constants/routes';

import heroImage from '@/assets/images/welcome-hero.jpg';
import lemonMark from '@/assets/images/little-lemon-mark.png';

const INTRO_COPY =
  'Fresh Mediterranean favorites, family recipes, and warm hospitality—made for every table.';

/**
 * Welcome / landing screen (Figma node 61:154) — the app's entry route.
 * Composition only: branding header, hero story and the primary call to action.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push(routes.signUp);
  };

  return (
    <ScreenContainer scroll style={styles.screen}>
      <View style={styles.header}>
        <LittleLemonLogo label="LemonBite" />
        <Image source={lemonMark} style={styles.lemonMark} />
      </View>

      <View style={styles.story}>
        <Image
          source={heroImage}
          style={styles.hero}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="A wooden table laid with fresh Mediterranean dishes"
        />
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.heading}>
            Welcome to LemonBite
          </Text>
          <Text style={styles.intro}>{INTRO_COPY}</Text>
        </View>
      </View>

      <PrimaryButton
        title="Get Started"
        onPress={handleGetStarted}
        accessibilityHint="Begins setting up your LemonBite experience"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
    paddingTop: layout.contentPaddingTop,
    paddingBottom: layout.contentPaddingBottom,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lemonMark: {
    width: sizing.logoMark,
    height: sizing.logoMark,
  },
  story: {
    gap: spacing.lg,
  },
  hero: {
    width: '100%',
    height: sizing.heroImageHeight,
    borderRadius: radii.lg,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heading: {
    ...textVariants.display,
    color: colors.primary,
    textAlign: 'center',
  },
  intro: {
    ...textVariants.lead,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
