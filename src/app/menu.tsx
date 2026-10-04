import { useCallback, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/common';
import { MenuItem, MenuListHeader, MenuSectionHeader } from '@/components/menu';
import { useMenu } from '@/hooks';
import { loadOnboardingData } from '@/services/storage/onboardingStorage';
import { loadProfile } from '@/services/storage/profileStorage';
import { getInitials, mergeProfile } from '@/utils/profile';
import { menuDetailsRoute, routes } from '@/constants/routes';
import { colors, layout, spacing, textVariants } from '@/theme';

interface HeaderAvatar {
  uri: string | null;
  initials: string;
}

/**
 * Menu / Home screen (Figma node 2:2). Requests menu data through the repository
 * (via `useMenu`) and renders it grouped by category, with a debounced search and
 * multi-select category filtering resolved by a SQLite query. Owns UI concerns only.
 */
export default function MenuScreen() {
  const router = useRouter();
  const {
    status,
    sections,
    categories,
    isMenuEmpty,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    reload,
  } = useMenu();
  const [avatar, setAvatar] = useState<HeaderAvatar>({ uri: null, initials: '' });

  // Reflect the latest saved avatar/initials whenever the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [profile, onboarding] = await Promise.all([loadProfile(), loadOnboardingData()]);
        const merged = mergeProfile(profile, onboarding);
        if (active) {
          setAvatar({
            uri: merged.avatarUri,
            initials: getInitials(merged.firstName, merged.lastName),
          });
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const openProfile = () => router.push(routes.profile);
  const openDish = (dishId: string) => router.push(menuDetailsRoute(dishId));

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Loading menu" />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text accessibilityRole="alert" style={styles.stateText}>
            We couldn’t load the menu. Please check your connection and try again.
          </Text>
          <PrimaryButton
            title="Try again"
            onPress={reload}
            accessibilityHint="Reloads the menu"
            style={styles.retry}
          />
        </View>
      </SafeAreaView>
    );
  }

  const emptyMessage = isMenuEmpty
    ? 'No menu items are available right now.'
    : 'No menu items match your search.';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <MenuItem item={item} onPress={() => openDish(item.id)} />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderWrapper}>
            <MenuSectionHeader title={section.title} />
          </View>
        )}
        ListHeaderComponent={
          <MenuListHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            avatarUri={avatar.uri}
            avatarInitials={avatar.initials}
            onPressProfile={openProfile}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyResults}>
            <Text accessibilityRole="text" style={styles.stateText}>
              {emptyMessage}
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.contentPaddingHorizontal,
    gap: spacing.md,
  },
  stateText: {
    ...textVariants.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyResults: {
    alignItems: 'center',
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingVertical: spacing.xl,
  },
  retry: {
    alignSelf: 'stretch',
  },
  sectionHeaderWrapper: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  itemWrapper: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingBottom: spacing.smd,
  },
});
