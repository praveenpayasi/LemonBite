import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAppFonts } from '@/hooks';
import { CartProvider } from '@/context/CartContext';
import { isOnboardingComplete } from '@/services/storage/onboardingStorage';
import { prepareMenuForHome } from '@/repositories/menuRepository';
import { routes } from '@/constants/routes';
import { colors } from '@/theme';

// Keep the splash screen visible until the brand fonts have loaded.
SplashScreen.preventAutoHideAsync();

/**
 * Root layout for the whole app.
 *
 * Responsibilities are intentionally narrow:
 *  - provide safe-area context to every screen,
 *  - load brand fonts and gate rendering on them,
 *  - route returning (onboarded) users straight to the Menu,
 *  - declare the root navigator (a Stack) that future route groups plug into.
 *
 * Individual screens/routes are defined as sibling files under `src/app`.
 */
export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useAppFonts();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [startAtMenu, setStartAtMenu] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const complete = await isOnboardingComplete();
        setStartAtMenu(complete);
        if (complete) {
          // Hydrate the menu cache + warm images while the splash is still up.
          await prepareMenuForHome();
        }
      } catch {
        // Fall through to the normal (async) menu load on Home.
      } finally {
        setOnboardingChecked(true);
      }
    })();
  }, []);

  const ready = (fontsLoaded || fontError) && onboardingChecked;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (ready && startAtMenu) {
      router.replace(routes.menu);
    }
  }, [ready, startAtMenu, router]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </CartProvider>
    </SafeAreaProvider>
  );
}
