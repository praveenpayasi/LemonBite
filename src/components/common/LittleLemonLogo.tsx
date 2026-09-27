import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface LittleLemonLogoProps extends Testable {
  /** Optional style overrides for the wordmark text. */
  style?: StyleProp<TextStyle>;
  /** Wordmark text. Defaults to the brand name. */
  label?: string;
}

/**
 * Text-based brand wordmark rendered in the brand display typeface.
 * Kept asset-free so the brand mark can be reused anywhere without image loading.
 */
export function LittleLemonLogo({ style, testID, label = 'Little Lemon' }: LittleLemonLogoProps) {
  return (
    <Text testID={testID} accessibilityRole="header" style={[styles.wordmark, style]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    ...textVariants.display,
    color: colors.primary,
  },
});
