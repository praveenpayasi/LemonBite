import { useCallback, useEffect, useMemo, useState } from 'react';

import { getMenu, peekMenuCache } from '@/repositories/menuRepository';
import { getFilteredMenuItems } from '@/services/database/menuDatabase';
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

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const hasActiveFilters = debouncedSearch.trim() !== '' || selectedCategories.length > 0;

  const load = useCallback(async () => {
    try {
      const data = await getMenu();
      setAllItems(data);
      setFilteredItems(data);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to load menu', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (initialCache) {
      return;
    }
    // Intentional load-on-mount; all state updates happen after awaits.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, initialCache]);

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
