/**
 * Non-color layout primitives: border radii, border widths and common
 * component sizing. Keeps rounded corners and control heights consistent.
 */
export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const borderWidth = {
  none: 0,
  hairline: 1,
  thick: 2,
} as const;

export const sizing = {
  buttonHeight: 56,
  inputHeight: 52,
  categoryButtonHeight: 64,
  rowHeight: 44,
  /** Minimum accessible tap area (iOS HIG / Material). */
  touchTarget: 44,
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  logoMark: 40,
  checkbox: 22,
  badge: 20,
  avatarSm: 48,
  avatarLg: 64,
  avatarActionWidth: 96,
  heroImageHeight: 330,
  heroThumbnail: 140,
  detailHeroHeight: 240,
  menuItemImage: 86,
  cartThumbnail: 60,
  recommendedCardWidth: 168,
  recommendedImageHeight: 96,
  successIcon: 72,
} as const;

/** Shadow radius / Android elevation pairs for raised surfaces. */
export const elevation = {
  none: 0,
  card: 8,
} as const;

/**
 * Screen-level layout constants shared by every route wrapper.
 * Values mirror the Figma "Welcome" content wrapper (24 side / 24 top / 44
 * bottom). `maxContentWidth` keeps content readable on tablets/large web
 * viewports. Points scale with device density, so these stay consistent on
 * every iOS/Android screen size.
 */
export const layout = {
  contentPaddingHorizontal: 24,
  contentPaddingTop: 24,
  contentPaddingBottom: 44,
  maxContentWidth: 480,
} as const;

export type RadiusToken = keyof typeof radii;
export type SizingToken = keyof typeof sizing;
export type LayoutToken = keyof typeof layout;
export type ElevationToken = keyof typeof elevation;
