import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LittleLemonLogo, PrimaryButton, ScreenContainer } from '@/components/common';
import { CategoryOption } from '@/components/forms';
import { setOnboardingComplete } from '@/services/storage/onboardingStorage';
import { prepareMenuForHome } from '@/repositories/menuRepository';
import { colors, layout, radii, sizing, spacing, textVariants } from '@/theme';
import { routes } from '@/constants/routes';

import lemonMark from '@/assets/images/little-lemon-mark.png';

const HEADING = 'What do you like?';
const SUBTEXT = 'Choose the courses you enjoy and we’ll personalize your menu.';
const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Sides'] as const;
type Category = (typeof CATEGORIES)[number];

/**
 * Preferences screen (Figma node 61:175) — onboarding course selection.
 * Users toggle the courses they enjoy; selections live in local state only.
 * Onward navigation to Home/Menu arrives in a later phase.
 */
export default function PreferencesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<ReadonlySet<Category>>(new Set());
  const [completing, setCompleting] = useState(false);

  const toggleCategory = (category: Category) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleComplete = async () => {
    if (completing) {
      return;
    }
    setCompleting(true);
    // Prepare the menu (and warm its images) before Home is shown, so it has
    // no visible pop-in; remember completion for future launches.
    try {
      await Promise.all([setOnboardingComplete(), prepareMenuForHome()]);
    } catch (error) {
      console.error('Failed to prepare onboarding completion', error);
    }
    router.replace(routes.menu);
  };

  return (
    <ScreenContainer scroll style={styles.screen}>
      <View style={styles.header}>
        <LittleLemonLogo label="LemonBite" />
        <Image source={lemonMark} style={styles.lemonMark} />
      </View>

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.introHeading}>
            {HEADING}
          </Text>
          <Text style={styles.introSubtext}>{SUBTEXT}</Text>
        </View>

        <View style={styles.choices}>
          {CATEGORIES.map((category) => (
            <CategoryOption
              key={category}
              label={category}
              selected={selected.has(category)}
              onToggle={() => toggleCategory(category)}
              testID={`preference-${category.toLowerCase()}`}
            />
          ))}
        </View>
      </View>

      <PrimaryButton
        title="Next"
        onPress={handleComplete}
        loading={completing}
        accessibilityHint="Confirms your selected courses"
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
  content: {
    width: '100%',
    gap: spacing.lg,
  },
  intro: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.smd,
  },
  introHeading: {
    ...textVariants.display,
    color: colors.secondary,
    textAlign: 'center',
  },
  introSubtext: {
    ...textVariants.lead,
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
  choices: {
    width: '100%',
    gap: spacing.smd,
  },
});
