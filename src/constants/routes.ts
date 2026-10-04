/**
 * Centralized route definitions for Expo Router.
 *
 * Import these instead of writing string literals like `router.push('/profile')`
 * throughout the app. As screens are added in later phases, register their paths
 * here so navigation targets stay consistent and refactor-safe.
 */
export const routes = {
  home: '/',
  signUp: '/signup',
  preferences: '/preferences',
  menu: '/menu',
  profile: '/profile',
  cart: '/cart',
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

/** Dynamic route for a single dish, e.g. `/menu-details/greek-salad`. */
export function menuDetailsRoute(dishId: string): `/menu-details/${string}` {
  return `/menu-details/${dishId}`;
}
