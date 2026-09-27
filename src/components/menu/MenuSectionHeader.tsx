import { StyleSheet, Text } from 'react-native';

import { colors, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface MenuSectionHeaderProps extends Testable {
  title: string;
}

/** Category heading between menu sections. */
export function MenuSectionHeader({ title, testID }: MenuSectionHeaderProps) {
  return (
    <Text testID={testID} accessibilityRole="header" style={styles.title}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...textVariants.sectionTitle,
    color: colors.textPrimary,
  },
});
