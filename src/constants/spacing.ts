/**
 * Spacing scale (in points) used for margins, padding and gaps.
 * Using a fixed scale keeps whitespace consistent across every screen.
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  mlg: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
