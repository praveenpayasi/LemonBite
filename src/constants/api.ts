/**
 * Remote API endpoints. Centralized so URLs are never hardcoded in screens.
 */

/** Little Lemon menu data (course capstone dataset). */
export const MENU_API_URL =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json';

/** Direct raw location for menu item images (no GitHub page redirect). */
export const MENU_IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/images';

/**
 * Resolves a menu image filename to a full remote URL. Idempotent: an input
 * that is already an absolute URL is returned unchanged (no double-prefixing).
 */
export function getMenuImageUrl(imageFileName: string): string {
  if (/^https?:\/\//i.test(imageFileName)) {
    return imageFileName;
  }
  return `${MENU_IMAGE_BASE_URL}/${imageFileName}`;
}
