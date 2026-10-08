import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { AppState, Platform, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { StackHeader } from '@/components/StackHeader';
import { useSettings } from '@/stores/settings';
import { darkTheme, lightTheme, navigationTheme } from '@/theme';

// Refetch stale queries when the app returns to the foreground
AppState.addEventListener('change', status => {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
});

export default function RootLayout() {
  const [ queryClient ] = useState(() => new QueryClient());
  const systemScheme = useColorScheme();
  const themeMode = useSettings(state => state.themeMode);
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [ theme ]);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <ThemeProvider value={navigationTheme(theme, isDark)}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenOptions={{ header: props => <StackHeader {...props} /> }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile/[steamid]/index" options={{ title: 'Profile' }} />
            <Stack.Screen name="profile/[steamid]/[appid]/index" options={{ title: 'Inventory' }} />
            <Stack.Screen name="profile/[steamid]/[appid]/item" options={{ title: 'Item' }} />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
