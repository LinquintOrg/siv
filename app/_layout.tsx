import api from '@utils/api';
import { sql } from '@utils/sql';
import Nav from 'components/Nav';
import { SplashScreen, Tabs } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, variables } from 'styles/global';
import { helpers } from 'utils/helpers';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const $api = new api();
  const height = useSafeAreaFrame().height;
  const { top } = useSafeAreaInsets();

  const [ isLoading, setIsLoading ] = useState(true);

  const viewHeight = useMemo(
    () => Math.floor(height - top - helpers.resize(variables.iconSize + 16 * 2 + 8 * 2)),
    [ height, top ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        const extraMigrationsNeeded = await sql.migrateDbIfNeeded();
        const rates = await sql.getRates();
        const inventoryGames = await sql.getInventoryGames();

        await sql.updateRates(rates, extraMigrationsNeeded);
        await sql.updateInventoryGames(inventoryGames);

        if (extraMigrationsNeeded) {
          const dataToMigrate = await helpers.loadDataForMigration();
          for (const profile of dataToMigrate.profiles) {
            await sql.upsertProfile(profile);
          }
          if (dataToMigrate.currency) {
            await sql.setSetting('currency', rates[dataToMigrate.currency].code);
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  });

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [ isLoading ]);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ height: '100%' }} onLayout={onLayoutRootView}>
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
    </SafeAreaView>
  );
}
