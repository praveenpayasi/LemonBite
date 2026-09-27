import type { TextStyle } from 'react-native';

/**
 * Typography tokens for the Little Lemon brand.
 *
 * The brand uses two typefaces (loaded via `@expo-google-fonts`):
 *  - "Markazi Text" — a serif used for display/hero headings.
 *  - "Karla" — a sans-serif used for body, labels and UI text.
 *
 * `fontFamilies` maps semantic names to the exact family strings registered by
 * the font loader. `textVariants` are ready-to-use style objects so components
 * never hardcode font sizes or families.
 */

export const fontFamilies = {
  displayRegular: 'MarkaziText_400Regular',
  displayMedium: 'MarkaziText_500Medium',
  displaySemiBold: 'MarkaziText_600SemiBold',
  displayBold: 'MarkaziText_700Bold',
  bodyRegular: 'Karla_400Regular',
  bodyMedium: 'Karla_500Medium',
  bodySemiBold: 'Karla_600SemiBold',
  bodyBold: 'Karla_700Bold',
  bodyExtraBold: 'Karla_800ExtraBold',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

/**
 * Semantic type ramp. Display/heading/subheading use the Markazi Text serif
 * (brand voice); everything else uses Karla for legible UI text.
 */
export const textVariants = {
  /** Hero wordmark / marketing headline. Figma "Display". */
  display: {
    fontFamily: fontFamilies.displayMedium,
    fontSize: fontSizes.display,
    lineHeight: 44,
  },
  /** Primary screen / section heading. */
  heading: {
    fontFamily: fontFamilies.displayMedium,
    fontSize: fontSizes.xxxl,
    lineHeight: 36,
  },
  /** Secondary heading beneath a `heading`. */
  subheading: {
    fontFamily: fontFamilies.displayRegular,
    fontSize: fontSizes.xxl,
    lineHeight: 30,
  },
  /** Restaurant location / smaller serif line. Figma "Subtitle". */
  subtitle: {
    fontFamily: fontFamilies.displayRegular,
    fontSize: fontSizes.xl,
    lineHeight: 26,
  },
  /** List / section heading. Figma "Section Title". */
  sectionTitle: {
    fontFamily: fontFamilies.bodyExtraBold,
    fontSize: fontSizes.xl,
    lineHeight: 24,
  },
  /** Emphasised intro / supporting text above body copy. Figma "Lead Text". */
  lead: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: 18,
  },
  /** Standard paragraph text. */
  body: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: fontSizes.md,
    lineHeight: 24,
  },
  /** Button / call-to-action label. Figma "Card Title". */
  button: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 15,
    lineHeight: 18,
  },
  /** Card / menu item title. Figma "Card Title". */
  cardTitle: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 15,
    lineHeight: 18,
  },
  /** Dense supporting copy, e.g. menu item descriptions. Figma "Compact Body". */
  compactBody: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  /** Selectable category / option label. Figma "Category". */
  category: {
    fontFamily: fontFamilies.bodyExtraBold,
    fontSize: fontSizes.sm,
    lineHeight: 17,
  },
  /** Navigation, tabs and menu labels. */
  navigation: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  /** Small helper / caption text. */
  caption: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
export type FontFamily = keyof typeof fontFamilies;
