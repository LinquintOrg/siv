import {
  ActivityIndicator,
  Dimensions, FlatList,
  StyleSheet,
  View
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {AVPlaybackStatusSuccess, Audio} from 'expo-av';
import {Icon} from 'react-native-elements';
import {Snackbar} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Text from '../Elements/text';
import {TextInput} from 'react-native-paper';
import { IMusicKit, IMusicKitPrice } from '../utils/types';
import MusicKit from '../Elements/MusicKit';

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

  const [ scale ] = useState(Dimensions.get('window').width / 423);
  const resize = (size: number) => {
    return Math.ceil(size * scale);
  };

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
        const {sound: playbackObject} = await Audio.Sound.createAsync(
          {uri: 'https://inventory.linquint.dev/api/Files/csgo/musickits/' + item.dir + '/roundmvpanthem_01.mp3'},
          {shouldPlay: false}
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

  return (
    (loading) ?
      <View style={[ styles.containerCol, {alignSelf: 'center'} ]}>
        <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large"
          color='#000'/>
        <Text style={{textAlign: 'center'}}>Downloading list of music kits...</Text>
      </View> :
      (loadingPrices) ?
        <View>
          <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large"
            color='#000'/>
          <Text style={{textAlign: 'center'}}>Downloading music kit prices...</Text>
        </View> :
        <View style={{height: '100%'}}>
          <View style={{marginVertical: resize(8)}}>
            <Text style={styles.title}>Tap to play <Text bold>MVP anthem</Text></Text>
          </View>

          <View style={styles.inputView}>
            <TextInput
              style={{marginHorizontal: resize(8), flex: 1, height: resize(40), fontSize: resize(16), padding: 0, marginBottom: resize(8)}}
              placeholder='Start typing artist or song name'
              mode={'outlined'}
              onChangeText={text => setSearch(text)}
              label={'Music kit search'}
              activeOutlineColor={'#1f4690'}
              left={
                <TextInput.Icon
                  icon={() => (<Icon name={'filter'} type={'feather'} color={'#1f4690'} />)}
                  size={resize(24)}
                  style={{margin: 0, paddingTop: resize(8)}}
                  forceTextInputFocus={false}
                />
              }
            />
          </View>

          <FlatList
            data={kits}
            renderItem={({item}) => <MusicKit item={item} play={playSound} search={search} prices={prices} />}
            keyExtractor={item => item.dir}
          />

          <Snackbar
            visible={snackbarVisible}
            style={{backgroundColor: '#193C6E'}}
            onDismiss={() => setSnackbarVisible(false)}
          >
            <View><Text style={styles.snackbarText}>{snackError}</Text></View>
          </Snackbar>

          <Snackbar
            visible={snackbarWhatsPlaying}
            style={{ backgroundColor: '#193C6E' }}
            onDismiss={() => setSnackbarWhatsPlaying(false)}
          >
            <Text style={{fontSize: resize(14)}}>
              Now playing <Text bold style={{color: '#6FC8F7'}}>{ playing.kit.song }</Text> by <Text style={{color: '#6FC8F7'}}>{ playing.kit.artist }</Text>
              {'\n'}
              Length: <Text bold style={{color: '#6FC8F7'}}>{Math.ceil(playing.length / 1000)}</Text> seconds
            </Text>
          </Snackbar>
        </View>
  );
}

// TODO: Move styles to global.ts file
const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 6,
    width: '95%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 8,
    alignSelf: 'center',
    padding: 8,
  },
  containerCol: {
    display: 'flex',
    flexDirection: 'column',
    width: '63%',
  },
  title: {
    textAlign: 'center',
    fontSize: resize(20),
  },
  subTitle: {
    textAlign: 'center',
    fontSize: resize(14),
  },
  inputView: {
    width: '90%',
    height: resize(44),
    borderRadius: 8,
    paddingHorizontal: resize(10),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  snackbarText: {
    fontSize: resize(13),
    color: '#fff'
  },
});
