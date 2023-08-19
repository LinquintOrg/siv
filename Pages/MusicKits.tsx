import { Dimensions, FlatList, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AVPlaybackStatusSuccess, Audio } from 'expo-av';
import { Icon } from 'react-native-elements';
import { Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Text from '../components/Text';
import { TextInput } from 'react-native-paper';
import { IMusicKit, IMusicKitPrice } from '../utils/types';
import MusicKit from '../components/MusicKit';
import * as Sentry from 'sentry-expo';
import { global, variables, colors } from '../styles/global';
import { helpers } from '../utils/helpers';
import Loader from '../components/Loader';

export default function MusicKits() {
  const [ loading, setLoading ] = useState(true);
  const [ kits, setKits ] = useState<IMusicKit[]>([]);
  const [ prices, setPrices ] = useState<IMusicKitPrice[]>([]);
  const [ playbackTimeout, setPlaybackTimeout ] = useState(false);
  const [ search, setSearch ] = useState<string>('');

  const [ playing, setPlaying ] = useState<{ kit: IMusicKit, length: number }>({ kit: { artist: '', song: '', dir: '' }, length: 0 });
  const [ snackbarWhatsPlaying, setSnackbarWhatsPlaying ] = useState(false);
  const [ errorText, setErrorText ] = useState('');
  const [ successText, setSuccessText ] = useState('');
  const [ errorSnack, setErrorSnack ] = useState(false);
  const [ successSnack, setSuccessSnack ] = useState(false);
  const [ internet, setInternet ] = useState(true);

  // TODO: [Pages/MusicKits.tsx]: Align prices, non-stattrack music kit prices are 'NaN' (probably undefined). Snackbar text is difficult to read.

  useEffect(() => {
    async function prepare() {
      try {
        const internetConnection = await NetInfo.fetch();
        if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
          setErrorText('No internet connection');
          setErrorSnack(true);
          setInternet(false);
          await helpers.waitUntil(() => !!internetConnection.isInternetReachable && internetConnection.isConnected, 40);
          setErrorSnack(false);
          setSuccessSnack(true);
          setSuccessText('Connected to the internet');
        }

        setInternet(true);
        const [ musicKitsRes, pricesRes ] = await Promise.all([
          fetch('https://inventory.linquint.dev/api/Steam/rq/music_kits.json'),
          fetch('https://inventory.linquint.dev/api/Steam/v3/music_kit_prices.php'),
        ]);
        const musicKits = await musicKitsRes.json() as { musickit: IMusicKit[] };
        const pricesObj = await pricesRes.json() as IMusicKitPrice[];
        setKits(musicKits.musickit);
        setPrices(pricesObj);
        setLoading(false);
      } catch (err) {
        setErrorText((err as Error).message);
        setErrorSnack(true);
        Sentry.React.captureException(err);
      } finally {
        setLoading(false);
      }
    }

    void prepare();
  }, []);

  const whatIsPlaying = (item: IMusicKit, length: number) => {
    setSnackbarWhatsPlaying(true);
    setPlaying({ kit: item, length });
  };

  async function playSound(item: IMusicKit) {
    if (!playbackTimeout) {
      setPlaybackTimeout(true);

      try {
        const { sound: playbackObject } = await Audio.Sound.createAsync(
          { uri: 'https://inventory.linquint.dev/api/Files/csgo/musickits/' + item.dir + '/roundmvpanthem_01.mp3' },
          { shouldPlay: false },
        );

        let soundLen = 15000;
        const playbackStatus = await playbackObject.getStatusAsync() as AVPlaybackStatusSuccess;
        if (playbackStatus.durationMillis) {
          soundLen = playbackStatus.durationMillis;
        }

        whatIsPlaying(item, soundLen);
        await playbackObject.playAsync();
        await sleep(soundLen + 2000);
      } catch (err) {
        setErrorText((err as Error).message);
        setErrorSnack(true);
        Sentry.React.captureException(err);
      } finally {
        setPlaybackTimeout(false);
      }
    }
  }

  function sleep(milliseconds: number) {
    return new Promise((resolve: (value?: unknown) => void) => {
      setTimeout(resolve, milliseconds);
    });
  }

  return (<>
    {
      !internet &&
      <View style={[ global.column, { alignItems: 'center', justifyContent: 'center' } ]}>
        <Icon name='wifi-off' type='feather' color={colors.primary} size={variables.iconLarge} />
        <Text style={global.subtitle}>No internet connection. Waiting...</Text>
      </View>
    }
    {
      (internet && loading) &&
      <View style={{ marginTop: Dimensions.get('window').height / 2 - 36 }}>
        <Loader text='Loading music kits...' />
      </View>
    }
    {
      (internet && !loading) &&
      <View style={{ height: '100%' }}>
        <View style={{ marginVertical: helpers.resize(8) }}>
          <Text bold style={global.title}>Music Kits</Text>
          <Text style={global.subtitle}>Tap to play the <Text bold>MVP anthem</Text></Text>
        </View>

        <View style={ global.inputView }>
          <TextInput
            style={ global.input }
            placeholder='Start typing artist or song name'
            mode={'outlined'}
            onChangeText={text => setSearch(text)}
            label={'Music kit search'}
            activeOutlineColor={'#1f4690'}
            left={
              <TextInput.Icon
                icon={() => (<Icon name={'filter'} type={'feather'} color={'#1f4690'} />)}
                size={variables.iconSize}
                style={{ margin: 0, paddingTop: helpers.resize(8) }}
                forceTextInputFocus={false}
              />
            }
          />
        </View>

        <FlatList
          data={kits}
          renderItem={({ item }) => <MusicKit item={item} play={playSound} search={search} prices={prices} />}
          keyExtractor={item => item.dir}
        />
      </View>
    }

    <Snackbar
      visible={errorSnack}
      onDismiss={() => setErrorSnack(false)}
      style={{ backgroundColor: colors.error }}
      duration={3000}
      action={{
        label: 'Okay',
        textColor: colors.text,
        buttonColor: colors.white,
        onPress: () => {
          setErrorSnack(false);
        },
      }}
    >
      <View>
        <Text style={global.snackbarText}>{ errorText }</Text>
      </View>
    </Snackbar>

    <Snackbar
      visible={successSnack}
      onDismiss={() => setSuccessSnack(false)}
      style={{ backgroundColor: colors.success }}
      duration={3000}
      action={{
        label: 'Okay',
        textColor: colors.text,
        buttonColor: colors.white,
        onPress: () => {
          setSuccessSnack(false);
        },
      }}
    >
      <View>
        <Text style={global.snackbarText}>{ successText }</Text>
      </View>
    </Snackbar>

    <Snackbar
      visible={snackbarWhatsPlaying}
      style={{ backgroundColor: colors.primary }}
      onDismiss={() => setSnackbarWhatsPlaying(false)}
      duration={5000}
    >
      <Text style={{ fontSize: helpers.resize(14), color: colors.white }}>
        Now playing <Text bold style={{ color: colors.secondary }}>
          { playing.kit.song }
        </Text> by <Text style={{ color: colors.secondary }}>{ playing.kit.artist }</Text>
        {'\n'}
        Length: <Text bold style={{ color: colors.secondary }}>{Math.ceil(playing.length / 1000)}</Text> seconds
      </Text>
    </Snackbar>
  </>);
}
