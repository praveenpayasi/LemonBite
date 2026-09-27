import { fetchMenuItems } from '@/services/api/menuApi';
import { getMenuItems, initDatabase, saveMenuItems } from '@/services/database/menuDatabase';
import { prefetchMenuImages } from '@/utils/imagePrefetch';
import type { MenuItem } from '@/types';

// Session-speed cache. SQLite remains the durable source.
let cachedMenuItems: MenuItem[] | null = null;
// Shared in-flight load so concurrent callers never trigger duplicate work.
let inFlight: Promise<MenuItem[]> | null = null;

/** Returns the hydrated in-memory menu, or null if it hasn't been loaded yet. */
export function peekMenuCache(): MenuItem[] | null {
  return cachedMenuItems;
}

/** Clears the in-memory cache (e.g. for tests or forced refresh). */
export function resetMenuCache(): void {
  cachedMenuItems = null;
  inFlight = null;
}

/** SQLite-first load: local cache when present, otherwise fetch + persist. */
async function loadFromSources(): Promise<MenuItem[]> {
  await initDatabase();

  const localItems = await getMenuItems();
  if (localItems.length > 0) {
    return localItems;
  }

  const remoteItems = await fetchMenuItems();
  await saveMenuItems(remoteItems);
  return remoteItems;
}

/**
 * Single entry point the UI uses for menu data. Order: in-memory cache →
 * SQLite → remote API. Hides the data source and dedupes concurrent loads.
 */
export async function getMenu(): Promise<MenuItem[]> {
  if (cachedMenuItems) {
    return cachedMenuItems;
  }
  if (inFlight) {
    return inFlight;
  }

  inFlight = loadFromSources()
    .then((items) => {
      cachedMenuItems = items;
      return items;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * Prepares the menu before Home becomes visible: hydrates the cache (SQLite or
 * API) and warms the image cache so the list has no visible pop-in.
 */
export async function prepareMenuForHome(): Promise<void> {
  const items = await getMenu();
  await prefetchMenuImages(items);
}
