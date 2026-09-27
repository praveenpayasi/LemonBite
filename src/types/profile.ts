/**
 * User profile domain types. Persisted locally (AsyncStorage); no backend.
 */

/** Cosmetic email notification opt-ins. */
export interface EmailNotificationPreferences {
  orderStatuses: boolean;
  passwordChanges: boolean;
  specialOffers: boolean;
  newsletter: boolean;
}

/** The complete, editable user profile. */
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUri: string | null;
  notifications: EmailNotificationPreferences;
}

/** Minimal user info captured during onboarding (Sign Up). */
export interface OnboardingData {
  firstName: string;
  email: string;
}
