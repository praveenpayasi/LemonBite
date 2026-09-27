import { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, spacing, textVariants } from '@/theme';
import type { Testable } from '@/types';

export interface MenuSearchProps extends Testable {
  value: string;
  onChangeText: (text: string) => void;
}

/** Magnifier drawn with views so no icon dependency is needed. */
function SearchIcon() {
  return (
    <View style={styles.icon}>
      <View style={styles.iconLens} />
      <View style={styles.iconHandle} />
    </View>
  );
}

/** Search field for the menu (Figma node 2:34). Presentational + controlled. */
function MenuSearchComponent({ value, onChangeText, testID }: MenuSearchProps) {
  return (
    <View style={styles.container}>
      <SearchIcon />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search menu, dishes, or ingredients"
        placeholderTextColor={colors.textPlaceholder}
        accessibilityLabel="Search the menu"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={spacing.sm}
          style={styles.clear}
        >
          <View style={styles.clearLineA} />
          <View style={styles.clearLineB} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.smd,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  input: {
    ...textVariants.body,
    flex: 1,
    padding: 0,
    color: colors.textPrimary,
  },
  icon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLens: {
    width: 12,
    height: 12,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.textPlaceholder,
  },
  iconHandle: {
    position: 'absolute',
    right: 1,
    bottom: 0,
    width: 2,
    height: 6,
    borderRadius: 1,
    backgroundColor: colors.textPlaceholder,
    transform: [{ rotate: '45deg' }],
  },
  clear: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLineA: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: '45deg' }],
  },
  clearLineB: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.textSecondary,
    transform: [{ rotate: '-45deg' }],
  },
});

export const MenuSearch = memo(MenuSearchComponent);
