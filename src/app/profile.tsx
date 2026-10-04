import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { PrimaryButton, ScreenContainer } from '@/components/common';
import { TextInputField } from '@/components/forms';
import { AppHeader } from '@/components/navigation';
import { AvatarEditor, NotificationCheckbox } from '@/components/profile';
import { useProfile } from '@/hooks';
import { getInitials } from '@/utils/profile';
import { routes } from '@/constants/routes';
import { borderWidth, colors, radii, spacing, textVariants } from '@/theme';

interface Feedback {
  tone: 'success' | 'error';
  message: string;
}

/**
 * Profile screen (Figma node 65:213). Loads saved profile + onboarding data,
 * edits a draft, and persists on Save. All storage stays in `useProfile`.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const {
    loading,
    loadError,
    saving,
    saveError,
    draft,
    errors,
    updateField,
    updateNotification,
    setAvatar,
    save,
    discard,
    logout,
  } = useProfile();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const initials = getInitials(draft.firstName, draft.lastName);

  const handleChangeAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setFeedback({ tone: 'error', message: 'Allow photo access to change your avatar.' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      const asset = result.canceled ? undefined : result.assets[0];
      if (asset) {
        setAvatar(asset.uri);
        setFeedback(null);
      }
    } catch {
      setFeedback({ tone: 'error', message: 'We couldn’t open your photos. Please try again.' });
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setFeedback(null);
  };

  const handleSave = async () => {
    const ok = await save();
    setFeedback(ok ? { tone: 'success', message: 'Changes saved.' } : null);
  };

  const handleDiscard = () => {
    discard();
    setFeedback(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace(routes.home);
    } catch {
      setFeedback({ tone: 'error', message: 'We couldn’t log you out. Please try again.' });
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading profile" />
      </ScreenContainer>
    );
  }

  const bannerMessage = saveError ?? feedback?.message;
  const bannerTone: Feedback['tone'] = saveError ? 'error' : (feedback?.tone ?? 'error');

  return (
    <ScreenContainer scroll keyboardAvoiding style={styles.screen}>
      <AppHeader
        showBack
        showLogo
        showCart
        avatarUri={draft.avatarUri}
        avatarInitials={initials}
        avatarLabel="Your profile photo"
      />

      {loadError ? (
        <Text accessibilityRole="alert" style={styles.errorBanner}>
          We couldn’t load your saved profile. Showing your onboarding details.
        </Text>
      ) : null}

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Personal information
        </Text>

        <AvatarEditor
          uri={draft.avatarUri}
          initials={initials}
          onChange={handleChangeAvatar}
          onRemove={handleRemoveAvatar}
        />

        <View style={styles.fields}>
          <TextInputField
            label="First name"
            value={draft.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            error={errors.firstName}
            autoCapitalize="words"
            autoCorrect={false}
            testID="profile-first-name"
          />
          <TextInputField
            label="Last name"
            value={draft.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            autoCapitalize="words"
            autoCorrect={false}
            testID="profile-last-name"
          />
          <TextInputField
            label="Email"
            value={draft.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="profile-email"
          />
          <TextInputField
            label="Phone number"
            value={draft.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
            error={errors.phoneNumber}
            keyboardType="phone-pad"
            testID="profile-phone"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Email notifications
        </Text>
        <View style={styles.notificationsCard}>
          <NotificationCheckbox
            label="Order statuses"
            checked={draft.notifications.orderStatuses}
            onToggle={() => updateNotification('orderStatuses', !draft.notifications.orderStatuses)}
            testID="notif-order-statuses"
          />
          <NotificationCheckbox
            label="Password changes"
            checked={draft.notifications.passwordChanges}
            onToggle={() =>
              updateNotification('passwordChanges', !draft.notifications.passwordChanges)
            }
            testID="notif-password-changes"
          />
          <NotificationCheckbox
            label="Special offers"
            checked={draft.notifications.specialOffers}
            onToggle={() => updateNotification('specialOffers', !draft.notifications.specialOffers)}
            testID="notif-special-offers"
          />
          <NotificationCheckbox
            label="Newsletter"
            checked={draft.notifications.newsletter}
            onToggle={() => updateNotification('newsletter', !draft.notifications.newsletter)}
            divider={false}
            testID="notif-newsletter"
          />
        </View>
      </View>

      {bannerMessage ? (
        <Text
          accessibilityRole="alert"
          style={[styles.banner, bannerTone === 'success' ? styles.bannerSuccess : styles.bannerError]}
        >
          {bannerMessage}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          title="Log out"
          variant="secondary"
          onPress={handleLogout}
          accessibilityHint="Signs you out and returns to the welcome screen"
        />
        <View style={styles.actionRow}>
          <PrimaryButton
            title="Discard changes"
            variant="outline"
            onPress={handleDiscard}
            style={styles.actionButton}
          />
          <PrimaryButton
            title="Save changes"
            onPress={handleSave}
            loading={saving}
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    gap: spacing.md,
    paddingTop: spacing.smd,
    paddingBottom: spacing.lg,
  },
  section: {
    width: '100%',
    gap: spacing.smd,
  },
  sectionTitle: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
  fields: {
    width: '100%',
    gap: spacing.sm,
  },
  notificationsCard: {
    width: '100%',
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  actions: {
    width: '100%',
    gap: spacing.smd,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.smd,
  },
  actionButton: {
    flex: 1,
  },
  errorBanner: {
    ...textVariants.body,
    color: colors.accent,
  },
  banner: {
    ...textVariants.lead,
  },
  bannerSuccess: {
    color: colors.primary,
  },
  bannerError: {
    color: colors.accent,
  },
});
