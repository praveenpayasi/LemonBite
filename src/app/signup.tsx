import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LittleLemonLogo, PrimaryButton, ScreenContainer } from '@/components/common';
import { TextInputField } from '@/components/forms';
import { saveOnboardingData } from '@/services/storage/onboardingStorage';
import { colors, layout, radii, sizing, spacing, textVariants } from '@/theme';
import { routes } from '@/constants/routes';

import lemonMark from '@/assets/images/little-lemon-mark.png';

const HEADING = 'Let us get to know you';
const SUBTEXT = 'Enter your details below to start ordering fresh Mediterranean meals.';

// Matches "something@something.tld"; deliberately lightweight, not RFC-exhaustive.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_HAS_NUMBER = /\d/;

function validateFirstName(value: string): string | undefined {
  if (!value.trim()) {
    return 'Please enter your first name.';
  }
  if (NAME_HAS_NUMBER.test(value)) {
    return 'First name cannot contain numbers.';
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Please enter your email address.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return undefined;
}

/**
 * Sign Up screen (Figma node 59:25) — first onboarding step.
 * Collects the user's first name and email with live client-side validation:
 * errors appear once the user starts typing and clear as soon as the value is
 * valid. A valid submission continues to the Preferences step.
 */
export default function SignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const firstNameError = firstNameTouched ? validateFirstName(firstName) : undefined;
  const emailError = emailTouched ? validateEmail(email) : undefined;

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    setFirstNameTouched(true);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailTouched(true);
  };

  const handleNext = () => {
    setFirstNameTouched(true);
    setEmailTouched(true);
    if (validateFirstName(firstName) || validateEmail(email)) {
      return;
    }
    // Persist for the Profile screen; navigation shouldn't wait on storage.
    saveOnboardingData({ firstName: firstName.trim(), email: email.trim() }).catch((error) => {
      console.error('Failed to persist onboarding data', error);
    });
    router.push(routes.preferences);
  };

  return (
    <ScreenContainer scroll keyboardAvoiding style={styles.screen}>
      <View style={styles.header}>
        <LittleLemonLogo label="LemonBite" />
        <Image source={lemonMark} style={styles.lemonMark} />
      </View>

      <View style={styles.hero}>
        <Text accessibilityRole="header" style={styles.heroHeading}>
          {HEADING}
        </Text>
        <Text style={styles.heroSubtext}>{SUBTEXT}</Text>
      </View>

      <View style={styles.form}>
        <TextInputField
          label="First Name"
          placeholder="e.g. John"
          value={firstName}
          onChangeText={handleFirstNameChange}
          error={firstNameError}
          keyboardType="default"
          autoCapitalize="words"
          autoCorrect={false}
          testID="signup-first-name"
        />
        <TextInputField
          label="Email"
          placeholder="e.g. john.doe@example.com"
          value={email}
          onChangeText={handleEmailChange}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID="signup-email"
        />
      </View>

      <PrimaryButton
        title="Next"
        onPress={handleNext}
        accessibilityHint="Validates your details to continue signing up"
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
  hero: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.smd,
  },
  heroHeading: {
    ...textVariants.display,
    color: colors.secondary,
    textAlign: 'center',
  },
  heroSubtext: {
    ...textVariants.lead,
    color: colors.textOnPrimary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: spacing.mlg,
  },
});
