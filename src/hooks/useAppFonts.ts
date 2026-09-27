import {
  useFonts,
  MarkaziText_400Regular,
  MarkaziText_500Medium,
  MarkaziText_600SemiBold,
  MarkaziText_700Bold,
} from '@expo-google-fonts/markazi-text';
import {
  Karla_400Regular,
  Karla_500Medium,
  Karla_600SemiBold,
  Karla_700Bold,
  Karla_800ExtraBold,
} from '@expo-google-fonts/karla';

/**
 * Loads the Little Lemon brand fonts (Markazi Text + Karla).
 *
 * Returns `[loaded, error]` from Expo's `useFonts`. Callers should keep the
 * splash screen visible until `loaded` (or `error`) is truthy so text never
 * renders with a fallback system font.
 */
export function useAppFonts(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    MarkaziText_400Regular,
    MarkaziText_500Medium,
    MarkaziText_600SemiBold,
    MarkaziText_700Bold,
    Karla_400Regular,
    Karla_500Medium,
    Karla_600SemiBold,
    Karla_700Bold,
    Karla_800ExtraBold,
  });

  return [loaded, error];
}
