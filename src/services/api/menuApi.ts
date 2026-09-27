import { MENU_API_URL, getMenuImageUrl } from '@/constants/api';
import type { MenuApiItem, MenuItem } from '@/types';

/** Turns "Greek Salad" into a stable, unique id like "greek-salad". */
function toId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

/** Reads the category as a display string whether the API sends a string or object. */
function normalizeCategory(category: MenuApiItem['category']): string {
  const raw = typeof category === 'string' ? category : category.title;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Whether a value has the essential fields of an API menu item. */
function isValidApiItem(value: unknown): value is MenuApiItem {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const item = value as Record<string, unknown>;
  const categoryOk =
    typeof item.category === 'string' ||
    (typeof item.category === 'object' &&
      item.category !== null &&
      typeof (item.category as Record<string, unknown>).title === 'string');

  return (
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.description === 'string' &&
    typeof item.image === 'string' &&
    categoryOk
  );
}

/**
 * Maps a raw API item to the normalized `MenuItem` used by the app.
 * Pure: generates a stable id, maps name→title, resolves the image filename to
 * a full URL, and normalizes the category for display.
 */
export function normalizeMenuItem(item: MenuApiItem): MenuItem {
  return {
    id: toId(item.name),
    title: item.name,
    price: item.price,
    description: item.description,
    image: getMenuImageUrl(item.image),
    category: normalizeCategory(item.category),
  };
}

/**
 * Fetches the remote menu and returns normalized items.
 * Throws on network failure, a non-OK response, or a malformed payload so the
 * UI can surface an error rather than showing an empty menu.
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const response = await fetch(MENU_API_URL);
  if (!response.ok) {
    throw new Error(`Menu request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as { menu?: unknown }).menu)
  ) {
    throw new Error('Menu response is malformed: expected a "menu" array.');
  }

  const menu = (data as { menu: unknown[] }).menu;
  return menu.map((item, index) => {
    if (!isValidApiItem(item)) {
      throw new Error(`Menu item at index ${index} is malformed.`);
    }
    return normalizeMenuItem(item);
  });
}
