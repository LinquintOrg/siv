import * as React from 'react';
import { usePreloadedState, useProfilesState, useRatesState, useStore } from './utils/store.ts';
import { View, Dimensions } from 'react-native';
import { NavigationContainer, Theme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Inventory from './Pages/Inventory.tsx';
import MusicKits from './Pages/MusicKits.tsx';
import Settings from './components/Settings.tsx';
import SteamMarket from './Pages/SteamMarket.tsx';
import { CleanTabBar } from 'react-navigation-tabbar-collection';
import * as Sentry from 'sentry-expo';
import NetInfo from '@react-native-community/netinfo';
// import { useFonts } from 'expo-font';
import { enableScreens } from 'react-native-screens';
import { ICurrency, IPlayerSummariesResponse, ISteamProfile, TStackNavigationList } from './utils/types.ts';
import Profiles from './Pages/Profiles.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Store from './components/Store.tsx';
import ChooseGames from './Pages/ChooseGames.tsx';
import { helpers } from './utils/helpers.ts';
import { colors } from './styles/global.ts';
import { BottomTabDescriptorMap } from 'react-navigation-tabbar-collection/lib/typescript/types';
// import { STEAM_API } from '@env';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<TStackNavigationList>();

function App() {
  Sentry.init({
    dsn: 'https://755f445790cc440eb625404426d380d7@o1136798.ingest.sentry.io/6188926',
    enableInExpoDevelopment: true,
    // eslint-disable-next-line no-undef
    debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
    tracesSampleRate: 1.0,
  });

  useStore();
  const profiles = useProfilesState();
  const rates = useRatesState();
  const preload = usePreloadedState();

  // TODO: Load custom fonts, preferably Nunito

  // const [ fontsLoaded ] = useFonts({
  //   Nunito: require('./assets/fonts/Nunito-Regular.ttf'),
  //   NunitoBold: require('./assets/fonts/Nunito-Bold.ttf'),
  // });


  async function updateProfiles() {
    try {
      // const id = STEAM_API;
      const id = '7401764DA0F7B99794826E9E2512E311';
      const savedKeys = await AsyncStorage.getAllKeys();
      const savedKeysFiltered = savedKeys.filter(key => !key.includes('prevGames') && key !== 'currency');
      const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${id}&steamids=${savedKeysFiltered.join(',')}`);
      const players = await response.json() as IPlayerSummariesResponse;
      const updatedProfiles: ISteamProfile[] = [];
      void savedKeysFiltered.forEach(key => {
        const profile = players.response.players.find(p => p.steamid === key);
        if (profile) {
          const tmpProfile: ISteamProfile = {
            id: profile.steamid,
            name: profile.personaname,
            url: profile.avatarmedium,
            public: profile.communityvisibilitystate === 3,
            state: profile.personastate,
          };
          void AsyncStorage.mergeItem(key, JSON.stringify(tmpProfile));
          updatedProfiles.push(tmpProfile);
        } else {
          throw new Error('Something went wrong');
        }
      });
      profiles.set(updatedProfiles);
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  useEffect(() => {
    async function prepare() {
      try {
        const internetConnection = await NetInfo.fetch();
        if (internetConnection.isInternetReachable && internetConnection.isConnected) {
          // await helpers.waitUntil(() => fontsLoaded, 50);
          await updateProfiles();
          const ratesRes = await fetch('https://inventory.linquint.dev/rates_full.php');
          const ratesObj = await ratesRes.json() as { rates: ICurrency[] };
          rates.set(ratesObj.rates);
        }
      } catch (e) {
        Sentry.React.captureException(e);
      } finally {
        preload.set(true);
      }
    }

    void prepare();
  }, []);

  function TabProfile(/*{ navigation }*/) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Home' component={Profiles} />
        <Stack.Screen name='Games' component={ChooseGames} />
        <Stack.Screen name='Inventory' component={Inventory} />
      </Stack.Navigator>
    );
  }

  function TabSteamMarket() {
    return (
      <View style={{ height: '100%' }}>
        <SteamMarket />
      </View>
    );
  }

  function TabMusicKit() {
    return (
      <View style={{ height: '100%' }}>
        <MusicKits />
      </View>
    );
  }

  function TabSettings() {
    return (
      <View style={{ height: '100%' }}>
        <Settings />
      </View>
    );
  }

  enableScreens();

  const MyTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#f7f7f7',
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <Store />
      <Tab.Navigator tabBar={props =>
        <CleanTabBar
          descriptors={props.descriptors as unknown as BottomTabDescriptorMap}
          state={props.state}
          navigation={props.navigation}
          maxWidth={helpers.resize(420)}
          height={helpers.resize(64)}
          darkMode={true}
          colorPalette={{ light: colors.primary, dark: colors.white }}
        />
      }>
        <Tab.Screen name="Profiles" component={TabProfile}
          options={{
            tabBarLabelStyle: { color: '#2379D9', fontSize: resize(14) },
            tabBarActiveTintColor: '#2379D9',
            tabBarIcon: () => (
              <Icon name="users" type='feather' color={'#322A81'} size={resize(28)} />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen name="Steam Market" component={TabSteamMarket}
          options={{
            tabBarLabelStyle: { color: '#2379D9', fontSize: resize(14) },
            tabBarActiveTintColor: '#2379D9',
            tabBarIcon: () => (
              <Icon name="steam" type={'material-community'} color={'#322A81'} size={resize(28)} />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen name="Music Kits" component={TabMusicKit}
          options={{
            tabBarLabelStyle: { color: '#2379D9', fontSize: resize(14) },
            tabBarActiveTintColor: '#2379D9',
            tabBarIcon: () => (
              <Icon name="music" type='feather' color={'#322A81'} size={resize(28)} />
            ),
            headerShown: false,
          }}
        />
        <Tab.Screen name="Settings" component={TabSettings}
          options={{
            tabBarLabelStyle: { color: '#2379D9', fontSize: resize(14) },
            tabBarActiveTintColor: '#2379D9',
            tabBarIcon: () => (
              <Icon name="settings" type='feather' color={'#322A81'} size={resize(28)} />
            ),
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

export default Sentry.Native.wrap(App);
