import { Geist_200ExtraLight } from '@expo-google-fonts/geist/200ExtraLight';
import { Geist_300Light } from '@expo-google-fonts/geist/300Light';
import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Appearance, AppState, Platform, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { MusicPlayerProvider } from '@/components/MusicPlayer';
import { Toaster } from '@/components/quiet/Toaster';
import { useSettings } from '@/stores/settings';
import { navigationThemes, PaletteContext, palettes, paperThemes, type ColorScheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Refetch stale queries when the app returns to the foreground
AppState.addEventListener('change', status => {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
});

const subscribeHydration = (onChange: () => void) => useSettings.persist.onFinishHydration(onChange);
const isHydrated = () => useSettings.persist.hasHydrated();

/** The theme to show: the setting, or the phone's own when it's set to follow the system. */
function useScheme(): ColorScheme {
  const preference = useSettings(state => state.theme);
  const system = useColorScheme();
  if (preference === 'system') {
    return system === 'light' ? 'light' : 'dark';
  }
  return preference;
}

export default function RootLayout() {
  const [ queryClient ] = useState(() => new QueryClient());
  const [ fontsLoaded, fontError ] = useFonts({
    Geist_200ExtraLight,
    Geist_300Light,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    GeistMono_400Regular,
  });
  // Wait for the saved settings too, so the app doesn't open in the wrong theme
  const hydrated = useSyncExternalStore(subscribeHydration, isHydrated);
  const ready = (fontsLoaded || !!fontError) && hydrated;
  const preference = useSettings(state => state.theme);
  const scheme = useScheme();
  const q = palettes[scheme];

  // Native parts (dialogs, the keyboard) follow the chosen theme too
  useEffect(() => {
    if (Platform.OS !== 'web' && hydrated) {
      Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
    }
  }, [ preference, hydrated ]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(q.bg);
  }, [ q.bg ]);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ ready ]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <PaletteContext value={q}>
          <PaperProvider theme={paperThemes[scheme]}>
            <ThemeProvider value={navigationThemes[scheme]}>
              <MusicPlayerProvider>
                <View style={{ flex: 1, backgroundColor: q.bg }}>
                  <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
                  <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: q.bg } }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="profile/[steamid]/index" />
                    <Stack.Screen name="profile/[steamid]/[appid]/index" />
                    <Stack.Screen name="profile/[steamid]/[appid]/item" />
                  </Stack>
                  <Toaster />
                </View>
              </MusicPlayerProvider>
            </ThemeProvider>
          </PaperProvider>
        </PaletteContext>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
