import api from '@utils/api';
import { sql } from '@utils/sql';
import Nav from 'components/Nav';
import { SplashScreen, Tabs } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, variables } from 'styles/global';
import { helpers } from 'utils/helpers';
import * as Sentry from 'sentry-expo';
import { SnackbarProvider } from 'hooks/useSnackbar';
import GlobalErrorHandler from '@/GlobalErrorHandler';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  Sentry.init({
    dsn: 'https://755f445790cc440eb625404426d380d7@o1136798.ingest.sentry.io/6188926',
    enableInExpoDevelopment: true,
    // eslint-disable-next-line no-undef
    debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
    tracesSampleRate: 1.0,
  });

  const $api = new api();
  const height = useSafeAreaFrame().height;
  const { top } = useSafeAreaInsets();

  const [ loaded, setLoaded ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);

  const viewHeight = useMemo(
    () => Math.floor(height - top - helpers.resize(variables.iconSize + 16 * 2 + 8 * 2)),
    [ height, top ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        setIsLoading(true);
        const extraMigrationsNeeded = await sql.migrateDbIfNeeded();
        const rates = await $api.getRates();
        const inventoryGames = await $api.getInventoryGames();

        await sql.updateRates(rates);
        await sql.updateInventoryGames(inventoryGames);

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

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ height: '100%' }} onLayout={onLayoutRootView}>
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
          />
        </View>
        <Nav />
      </SnackbarProvider>
    </SafeAreaView>
  );
}
