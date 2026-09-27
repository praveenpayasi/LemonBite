/**
 * Menu domain types.
 *
 * The remote API shape (`MenuApiItem`) differs from the shape the app stores and
 * renders (`MenuItem`), so the two are mapped explicitly in the API layer rather
 * than shared loosely.
 */

/** Raw menu item as returned by the Little Lemon menu API. */
export interface MenuApiItem {
  name: string;
  price: number;
  description: string;
  image: string;
  /** The API may send the category as a plain string or a nested object. */
  category: string | { title: string };
}

/** Raw API response envelope. */
export interface MenuApiResponse {
  menu: MenuApiItem[];
}

/** Normalized menu item used by the database and UI. */
export interface MenuItem {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

/** A group of menu items for a SectionList, keyed by category. */
export interface MenuSection {
  title: string;
  data: MenuItem[];
}
