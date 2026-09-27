import { ScrollView, StyleSheet } from 'react-native';

import { CategoryChip } from '@/components/menu/CategoryChip';
import { MenuHero } from '@/components/menu/MenuHero';
import { layout, spacing } from '@/theme';

export interface MenuListHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  avatarUri: string | null;
  avatarInitials: string;
  onPressProfile: () => void;
}

/**
 * Stable SectionList header: brand hero + search + horizontal category chips.
 * Kept as one component so the search field keeps focus across list re-renders.
 */
export function MenuListHeader({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategories,
  onToggleCategory,
  avatarUri,
  avatarInitials,
  onPressProfile,
}: MenuListHeaderProps) {
  return (
    <>
      <MenuHero
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        avatarUri={avatarUri}
        avatarInitials={avatarInitials}
        onPressProfile={onPressProfile}
      />
      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chips}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              active={selectedCategories.includes(category)}
              onPress={() => onToggleCategory(category)}
              testID={`category-${category.toLowerCase()}`}
            />
          ))}
        </ScrollView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: spacing.sm,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingVertical: spacing.md,
  },
});
