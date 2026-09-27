import type { MenuItem, MenuSection } from '@/types';

// Canonical onboarding order; unknown categories are appended alphabetically.
const CATEGORY_ORDER = ['Starters', 'Mains', 'Desserts', 'Sides'];

function categoryRank(category: string): number {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

/**
 * Groups flat menu items into SectionList sections by category.
 * Pure: does not mutate the input array.
 */
export function getSectionListData(menuItems: MenuItem[]): MenuSection[] {
  const byCategory = new Map<string, MenuItem[]>();

  for (const item of menuItems) {
    const group = byCategory.get(item.category);
    if (group) {
      group.push(item);
    } else {
      byCategory.set(item.category, [item]);
    }
  }

  return Array.from(byCategory, ([title, data]) => ({ title, data })).sort((a, b) => {
    const rankDiff = categoryRank(a.title) - categoryRank(b.title);
    return rankDiff !== 0 ? rankDiff : a.title.localeCompare(b.title);
  });
}

/** Unique categories present in the menu, in the canonical order. */
export function getMenuCategories(menuItems: MenuItem[]): string[] {
  return Array.from(new Set(menuItems.map((item) => item.category))).sort((a, b) => {
    const rankDiff = categoryRank(a) - categoryRank(b);
    return rankDiff !== 0 ? rankDiff : a.localeCompare(b);
  });
}
