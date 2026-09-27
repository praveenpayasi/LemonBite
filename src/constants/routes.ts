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
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
