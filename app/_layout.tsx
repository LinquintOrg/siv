import { sql } from '@utils/sql';
import { useProfilesState } from '@utils/store';
import Nav from 'components/Nav';
import { Slot, SplashScreen, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, variables } from 'styles/global';
import { helpers } from 'utils/helpers';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { bottom } = useSafeAreaInsets();
  const height = Dimensions.get('window').height;
  const [ isLoading, setIsLoading ] = useState(true);
  const profilesState = useProfilesState();

  const viewHeight = useMemo(
    () => Math.floor(height - bottom - helpers.resize(variables.iconSize + 16 * 2 + 8 * 2)),
    [ height, bottom ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        const extraMigrationsNeeded = await sql.migrateDbIfNeeded();
        if (extraMigrationsNeeded) {
          const profilesToImport = profilesState.getAll();
          for (const profile of profilesToImport) {
            await sql.upsertProfile(profile);
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
      <StatusBar style='auto' />
      <View style={{ maxHeight: viewHeight, minHeight: viewHeight, paddingHorizontal: helpers.resize(8) }}>
        <Tabs
          screenOptions={() => ({
            headerShown: false,
            tabBarStyle: {
              display: 'none',
            },
          })}
        />
      </View>
      <Nav />
    </SafeAreaView>
  );
}
