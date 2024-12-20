import api from '@utils/api';
import { sql } from '@utils/sql';
import Nav from 'components/Nav';
import { SplashScreen, Tabs, useNavigationContainerRef } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, variables } from 'styles/global';
import { helpers } from '@utils/helpers';
import * as Sentry from '@sentry/react-native';
import { SnackbarProvider } from 'hooks/useSnackbar';
import GlobalErrorHandler from '@/GlobalErrorHandler';
import useStore from 'store';
import { useBackButtonHandler } from 'hooks/useBackButtonHandler';
import { isRunningInExpoGo } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import currencyNames from '@utils/currency';

SplashScreen.preventAutoHideAsync();

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

Sentry.init({
  dsn: 'https://755f445790cc440eb625404426d380d7@o1136798.ingest.sentry.io/6188926',
  debug: true,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.ReactNativeTracing({
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
    }),
  ],
});

function RootLayout() {

  const $api = new api();
  const store = useStore();
  const height = useSafeAreaFrame().height;
  const { top } = useSafeAreaInsets();

  const [ loaded, setLoaded ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);

  const viewHeight = useMemo(
    () => Math.floor(height - top - helpers.resize(variables.iconSize + 16 * 2 + 8 * 2)),
    [ height, top ],
  );

  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ ref ]);

  useEffect(() => {
    async function prepare() {
      try {
        setIsLoading(true);
        const extraMigrationsNeeded = await sql.migrateDbIfNeeded();
        const [ rates, inventoryGames ] = await Promise.all([
          $api.getRates(),
          $api.getInventoryGames(),
        ]);

        await sql.updateRates(rates);
        await sql.updateInventoryGames(inventoryGames);
        store.setGames(inventoryGames);
        store.setCurrencyNames(currencyNames);

        if (extraMigrationsNeeded) {
          const dataToMigrate = await helpers.loadDataForMigration();
          for (const profile of dataToMigrate.profiles) {
            await sql.upsertProfile(profile);
          }
          if (dataToMigrate.currency) {
            await sql.setSetting('currency', rates[dataToMigrate.currency].code);
          } else {
            await sql.setSetting('currency', 'EUR');
          }
        }

        const savedProfiles = await sql.getAllProfiles();
        if (savedProfiles.length) {
          const profiles = await $api.batchSteamProfiles(savedProfiles.map(p => p.id));
          for (const profile of profiles) {
            await sql.upsertProfile({
              id: profile.steamid,
              name: profile.personaname,
              url: profile.avatarmedium,
              public: profile.communityvisibilitystate === 3,
              state: profile.personastate,
            });
          }
        }

        const currentCurrency = await sql.getOneRate();
        store.setCurrency(currentCurrency);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        setLoaded(true);
        setIsLoading(false);
      }
    }

    if (!loaded && !isLoading) {
      prepare();
    }
  });

  const onLayoutRootView = useCallback(async () => {
    if (loaded && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [ isLoading, loaded ]);

  useBackButtonHandler();

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ height: '100%', backgroundColor: colors.background }} onLayout={onLayoutRootView}>
      <PaperProvider
        theme={{
          dark: false,
          version: 3,
          animation: { defaultAnimationDuration: 300 },
          isV3: true,
          colors: {
            ...DefaultTheme.colors,
            primary: colors.primary,
            onPrimary: colors.white,
            secondary: colors.accent,
            onSecondary: colors.text,
            tertiary: colors.accent,
            onTertiary: colors.text,
            primaryContainer: colors.primary,
            onPrimaryContainer: colors.white,
            secondaryContainer: colors.accent,
            onSecondaryContainer: colors.white,
            tertiaryContainer: colors.accent,
            onTertiaryContainer: colors.white,

            // Snackbar
            background: colors.background,
            onBackground: colors.text,

            backdrop: `${colors.primary}55`,
            surface: colors.primary,
            onSurface: colors.primary,
            surfaceVariant: `${colors.primary}33`,
            onSurfaceVariant: colors.text,
            inverseSurface: colors.background,
            inverseOnSurface: colors.primary,
            outline: colors.primary,
            error: colors.error,
            onError: colors.white,
            errorContainer: colors.error,
            onErrorContainer: colors.white,
            inversePrimary: colors.accent,
            scrim: colors.primary,
          },
        }}
      >
        <SnackbarProvider>
          <GlobalErrorHandler />
          <View style={{ maxHeight: viewHeight, minHeight: viewHeight, paddingHorizontal: helpers.resize(8) }}>
            <Tabs
              screenOptions={() => ({
                headerShown: false,
                tabBarStyle: {
                  display: 'none',
                },
              })}
              sceneContainerStyle={{ backgroundColor: colors.background }}
              backBehavior='history'
            />
          </View>
          <Nav />
        </SnackbarProvider>
      </PaperProvider>
      <StatusBar style='dark' />
    </SafeAreaView>
  );
}

export default Sentry.wrap(RootLayout);
