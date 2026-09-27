import { isValidUsPhoneNumber } from '@/utils/phone';
import type { OnboardingData, UserProfile } from '@/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ProfileValidationErrors {
  firstName?: string;
  email?: string;
  phoneNumber?: string;
}

/** Initials from first/last name, e.g. "Tilly Doe" → "TD". Safe for empty values. */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase();
}

/** Default profile seeded from onboarding data; notifications default on. */
export function createDefaultProfile(onboarding: OnboardingData | null): UserProfile {
  return {
    firstName: onboarding?.firstName ?? '',
    lastName: '',
    email: onboarding?.email ?? '',
    phoneNumber: '',
    avatarUri: null,
    notifications: {
      orderStatuses: true,
      passwordChanges: true,
      specialOffers: true,
      newsletter: true,
    },
  };
}

/**
 * Merges a saved profile with onboarding data. Precedence: saved value →
 * onboarding value → default. Real saved values are never overwritten by empty
 * onboarding defaults.
 */
export function mergeProfile(
  saved: UserProfile | null,
  onboarding: OnboardingData | null,
): UserProfile {
  const base = createDefaultProfile(onboarding);
  if (!saved) {
    return base;
  }
  return {
    ...saved,
    firstName: saved.firstName || base.firstName,
    email: saved.email || base.email,
  };
}

/** Validates required first name, email format, and (optional) phone number. */
export function validateProfile(profile: UserProfile): ProfileValidationErrors {
  const errors: ProfileValidationErrors = {};

  if (!profile.firstName.trim()) {
    errors.firstName = 'Please enter your first name.';
  }

  const email = profile.email.trim();
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (profile.phoneNumber.trim() && !isValidUsPhoneNumber(profile.phoneNumber)) {
    errors.phoneNumber = 'Enter a 10-digit US phone number.';
  }

  return errors;
}

/** Deep-equality for the profile shape, used to detect unsaved changes. */
export function profilesEqual(a: UserProfile, b: UserProfile): boolean {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.email === b.email &&
    a.phoneNumber === b.phoneNumber &&
    a.avatarUri === b.avatarUri &&
    a.notifications.orderStatuses === b.notifications.orderStatuses &&
    a.notifications.passwordChanges === b.notifications.passwordChanges &&
    a.notifications.specialOffers === b.notifications.specialOffers &&
    a.notifications.newsletter === b.notifications.newsletter
  );
}
