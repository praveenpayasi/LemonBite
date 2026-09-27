/**
 * Little Lemon brand color palette and semantic color tokens.
 *
 * `palette` holds the raw brand values (the single source of truth).
 * `colors` exposes semantic, intent-based tokens that components should use
 * (e.g. `colors.primary`) so the raw hex values are never scattered across the UI.
 */

const palette = {
  green: '#495E57',
  yellow: '#F4CE14',
  salmon: '#EE9972',
  peach: '#FBDABB',
  cloud: '#EDEFEE',
  charcoal: '#333333',
  white: '#FFFFFF',
  black: '#000000',
  grey: '#666666',
  lightGrey: '#CCCCCC',
  slate: '#9CA3AF',
} as const;

export const colors = {
  // Brand
  primary: palette.green,
  secondary: palette.yellow,
  accent: palette.salmon,
  accentSoft: palette.peach,

  // Surfaces
  background: palette.white,
  surface: palette.cloud,

  // Text
  textPrimary: palette.charcoal,
  textSecondary: palette.grey,
  textPlaceholder: palette.slate,
  textOnPrimary: palette.white,
  textOnSecondary: palette.charcoal,

  // States / borders
  border: palette.lightGrey,
  disabled: palette.lightGrey,

  // Static
  white: palette.white,
  black: palette.black,
} as const;

export type ColorToken = keyof typeof colors;
export { palette };
