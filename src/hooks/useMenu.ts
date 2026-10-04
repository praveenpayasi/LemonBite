import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import { getFilteredMenuItems } from '@/services/database/menuDatabase';
import { loadCategoryPreferences } from '@/services/storage/profileStorage';
import { getMenuCategories, getSectionListData } from '@/utils/menu';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { MenuItem, MenuSection } from '@/types';

const SEARCH_DEBOUNCE_MS = 500;

export type MenuStatus = 'loading' | 'ready' | 'error';

export interface UseMenuResult {
  status: MenuStatus;
  sections: MenuSection[];
  categories: string[];
  /** True when the loaded menu has no items at all (distinct from no filter matches). */
  isMenuEmpty: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  reload: () => void;
}

/**
 * Menu screen state: loads data through the repository (cache-first) and derives
 * the SectionList grouping from the current filters. Search is debounced and both
 * search and category filters run as one parameterized SQLite query.
 */
export function useMenu(): UseMenuResult {
  // Hydrate synchronously from the prepared cache so Home renders without a flash.
  const initialCache = useMemo(() => peekMenuCache(), []);
  const [allItems, setAllItems] = useState<MenuItem[]>(initialCache ?? []);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(initialCache ?? []);
  const [status, setStatus] = useState<MenuStatus>(initialCache ? 'ready' : 'loading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // Preferences seed the filters once; later user toggles must never be overwritten.
  const preferencesAppliedRef = useRef(false);

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const hasActiveFilters = debouncedSearch.trim() !== '' || selectedCategories.length > 0;

  /** Seeds the chips from onboarding, limited to categories the menu actually has. */
  const applyPreferences = useCallback((saved: string[], menuItems: MenuItem[]) => {
    if (preferencesAppliedRef.current) {
      return;
    }
    preferencesAppliedRef.current = true;
    const available = new Set(menuItems.map((item) => item.category));
    const applicable = saved.filter((category) => available.has(category));
    if (applicable.length > 0) {
      setSelectedCategories(applicable);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const [data, saved] = await Promise.all([getMenu(), loadCategoryPreferences()]);
      setAllItems(data);
      setFilteredItems(data);
      applyPreferences(saved, data);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to load menu', error);
      setStatus('error');
    }
  }, [applyPreferences]);

  useEffect(() => {
    if (initialCache) {
      return;
    }
    // Intentional load-on-mount; all state updates happen after awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, initialCache]);

  // The cached path skips `load`, so preferences are resolved separately.
  useEffect(() => {
    if (!initialCache) {
      return;
    }
    let active = true;
    loadCategoryPreferences()
      .then((saved) => {
        if (active) {
          applyPreferences(saved, initialCache);
        }
      })
      .catch((error) => {
        console.error('Failed to load category preferences', error);
      });
    return () => {
      active = false;
    };
  }, [initialCache, applyPreferences]);

  // Run the SQLite filter query whenever active filters change (search is debounced).
  useEffect(() => {
    if (status !== 'ready' || !hasActiveFilters) {
      return;
    }
    let active = true;
    getFilteredMenuItems(debouncedSearch.trim(), selectedCategories)
      .then((results) => {
        if (active) {
          setFilteredItems(results);
        }
      })
      .catch((error) => {
        console.error('Failed to filter menu', error);
      });
    return () => {
      active = false;
    };
  }, [status, hasActiveFilters, debouncedSearch, selectedCategories]);

  const reload = useCallback(() => {
    setStatus('loading');
    load();
  }, [load]);

  const toggleCategory = useCallback((category: string) => {
    preferencesAppliedRef.current = true;
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  }, []);

  const displayItems = hasActiveFilters ? filteredItems : allItems;
  const categories = useMemo(() => getMenuCategories(allItems), [allItems]);
  const sections = useMemo(() => getSectionListData(displayItems), [displayItems]);

  return {
    status,
    sections,
    categories,
    isMenuEmpty: allItems.length === 0,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    reload,
  };
}
