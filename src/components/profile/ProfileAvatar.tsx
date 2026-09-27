import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radii, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface ProfileAvatarProps extends Testable {
  /** Local/remote image URI, or null to show initials. */
  uri: string | null;
  /** Initials fallback, e.g. "TD". */
  initials: string;
  /** Diameter in points. */
  size: number;
  accessibilityLabel?: string;
}

/** Circular avatar: shows the image when present, otherwise initials. */
export function ProfileAvatar({ uri, initials, size, accessibilityLabel, testID }: ProfileAvatarProps) {
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        testID={testID}
        source={{ uri }}
        resizeMode="cover"
        accessibilityLabel={accessibilityLabel ?? 'Profile photo'}
        style={[circle, styles.image]}
      />
    );
  }

  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={accessibilityLabel ?? `Profile initials ${initials}`}
      style={[circle, styles.fallback]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  initials: {
    ...textVariants.button,
    color: colors.textOnPrimary,
  },
});
