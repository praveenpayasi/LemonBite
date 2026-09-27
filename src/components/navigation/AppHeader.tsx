import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LittleLemonLogo } from '@/components/common';
import { borderWidth, colors, spacing } from '@/theme';
import type { Testable } from '@/types';

export interface AppHeaderProps extends Testable {
  /** Optional element pinned to the leading edge (e.g. a back button). */
  left?: ReactNode;
  /** Optional element pinned to the trailing edge (e.g. an avatar). */
  right?: ReactNode;
  /** Optional style overrides for the header container. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Top-of-screen branding header showing the Little Lemon wordmark.
 * Lives under `navigation/` because it is part of the app's chrome; it renders
 * branding only and holds no routing logic. Screens pass interactive controls
 * through the `left`/`right` slots so the header stays decoupled from navigation.
 */
export function AppHeader({ left, right, style, testID }: AppHeaderProps) {
  return (
    <View testID={testID} style={[styles.header, style]}>
      <View style={styles.side}>{left}</View>
      <LittleLemonLogo />
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  side: {
    minWidth: spacing.xxl,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
});
