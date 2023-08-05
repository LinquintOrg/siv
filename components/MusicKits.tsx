import {
  ActivityIndicator,
  Dimensions, FlatList,
  View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { AVPlaybackStatusSuccess, Audio } from 'expo-av';
import { Icon } from 'react-native-elements';
import { Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Text from '../Elements/text';
import { TextInput } from 'react-native-paper';
import { IMusicKit, IMusicKitPrice } from '../utils/types';
import MusicKit from '../Elements/MusicKit';
import * as Sentry from 'sentry-expo';
import { global, variables } from '../styles/global';
import { helpers } from '../utils/helpers';

export default function MusicKits() {
  const [ loading, setLoading ] = useState(true);
  const [ loadingPrices, setLoadingPrices ] = useState(false);
  const [ kits, setKits ] = useState<IMusicKit[]>([]);
  const [ prices, setPrices ] = useState<IMusicKitPrice[]>([]);
  const [ playbackTimeout, setPlaybackTimeout ] = useState(false);
  const [ search, setSearch ] = useState<string>('');
  const [ snackbarVisible, setSnackbarVisible ] = useState(false);
  const [ snackbarWhatsPlaying, setSnackbarWhatsPlaying ] = useState(false);
  const [ snackError, setSnackError ] = useState('');
  const [ playing, setPlaying ] = useState<{ kit: IMusicKit, length: number }>({ kit: { artist: '', song: '', dir: '' }, length: 0 });

  const getMusicKits = useCallback(async () => {
    const internetConnection = await NetInfo.fetch();
    if (internetConnection.isInternetReachable && internetConnection.isConnected) {
      try {
        const musicKitsRes = await fetch('https://inventory.linquint.dev/api/Steam/rq/music_kits.json');
        const musicKits = await musicKitsRes.json() as { musickit: IMusicKit[] };
        setKits(musicKits.musickit);
        setLoading(false);
        setLoadingPrices(true);
      } catch(err) {
        setSnackbarVisible(true);
        setSnackError((err as Error).message);
        Sentry.React.captureException(err);
      }
    }
  }, []);

  const getMusicKitPrices = useCallback(async () => {
    const pricesRes = await fetch('https://inventory.linquint.dev/api/Steam/v3/music_kit_prices.php');
    const pricesObj = await pricesRes.json() as IMusicKitPrice[];
    setPrices(pricesObj);
    setLoadingPrices(false);
  }, []);

  try {
    Promise.all<void>([
      getMusicKits(),
      getMusicKitPrices(),
    ]).catch((reason: Error) => {
      setSnackError(reason.message || 'Failed to load music kit data.');
      setSnackbarVisible(true);
    });
  } catch (err) {
    setSnackError((err as Error).message || 'Failed to load music kit data.');
    setSnackbarVisible(true);
  }

  const whatIsPlaying = async (item: IMusicKit, length: number) => {
    setSnackbarWhatsPlaying(true);
    setPlaying({ kit: item, length });
    await sleep(5000);
    setSnackbarVisible(false);
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

        await whatIsPlaying(item, soundLen);
        await playbackObject.playAsync();
        await sleep(soundLen + 2000);
      } catch (err) {
        setSnackError('Oh oh! An error has occurred.');
        setSnackbarVisible(true);
      } finally {
        setPlaybackTimeout(false);
      }
    }
  }

  function sleep(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  // TODO: Replace ActivityIndicator elements with Loader components

  // TODO: Fix music kit page rerendering every second for some reason
  return (
    (loading) ?
      <View style={[ global.column, { alignSelf: 'center', width: helpers.resize(300) } ]}>
        <ActivityIndicator style={{ marginTop: Dimensions.get('window').height / 2 - 36 }} size="large"
          color='#000'/>
        <Text style={{ textAlign: 'center' }}>Downloading list of music kits...</Text>
      </View> :
      (loadingPrices) ?
        <View>
          <ActivityIndicator style={{ marginTop: Dimensions.get('window').height / 2 - 36 }} size="large"
            color='#000'/>
          <Text style={{ textAlign: 'center' }}>Downloading music kit prices...</Text>
        </View> :
        <View style={{ height: '100%' }}>
          <View style={{ marginVertical: helpers.resize(8) }}>
            <Text style={global.title}>Tap to play <Text bold>MVP anthem</Text></Text>
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

          <Snackbar
            visible={snackbarVisible}
            style={{ backgroundColor: '#193C6E' }}
            onDismiss={() => setSnackbarVisible(false)}
          >
            <View><Text style={ global.snackbarText }>{ snackError }</Text></View>
          </Snackbar>

          <Snackbar
            visible={snackbarWhatsPlaying}
            style={{ backgroundColor: '#193C6E' }}
            onDismiss={() => setSnackbarWhatsPlaying(false)}
          >
            <Text style={{ fontSize: helpers.resize(14) }}>
              Now playing <Text bold style={{ color: '#6FC8F7' }}>
                { playing.kit.song }
              </Text> by <Text style={{ color: '#6FC8F7' }}>{ playing.kit.artist }</Text>
              {'\n'}
              Length: <Text bold style={{ color: '#6FC8F7' }}>{Math.ceil(playing.length / 1000)}</Text> seconds
            </Text>
          </Snackbar>
        </View>
  );
}
