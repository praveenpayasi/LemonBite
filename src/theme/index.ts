import { colors, palette } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { radii, borderWidth, sizing, layout, elevation } from '@/constants/dimensions';
import { textVariants, fontFamilies, fontSizes } from '@/constants/typography';

/**
 * Central theme object. This is the single entry point components should import
 * design tokens from, e.g. `theme.colors.primary`, `theme.spacing.md`.
 *
 * Grouping the tokens here (rather than importing each constant file directly)
 * makes it trivial to reshape or re-theme the app later from one place.
 */
export const theme = {
  colors,
  palette,
  spacing,
  radii,
  borderWidth,
  sizing,
  layout,
  elevation,
  typography: {
    families: fontFamilies,
    sizes: fontSizes,
    variants: textVariants,
  },
} as const;

export type Theme = typeof theme;

export {
  colors,
  palette,
  spacing,
  radii,
  borderWidth,
  sizing,
  layout,
  elevation,
  textVariants,
  fontFamilies,
  fontSizes,
};
