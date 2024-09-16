import Input from '@/Input';
import Loader from '@/Loader';
import MusicKit from '@/MusicKit';
import Text from '@/Text';
import api from '@utils/api';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { global } from 'styles/global';
import { IMusicKit } from 'types';
import useStore from 'store';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { useSnackbar } from 'hooks/useSnackbar';
import { helpers } from '@utils/helpers';

export default function KitsPage() {
  const $api = new api();
  const $store = useStore();
  const $snackbar = useSnackbar();
  const [ isLoading, setIsLoading ] = useState(false);
  const [ musicKits, setMusicKits ] = useState<IMusicKit[]>([]);
  const [ input, setInput ] = useState('');
  const [ mvpSound, setMvpSound ] = useState<Audio.Sound | null>(null);
  const [ playbackStatus, setPlaybackStatus ] = useState<AVPlaybackStatus | null>(null);

  const renderedKits = useMemo(
    () => musicKits.filter(mk => mk.artist.toLowerCase().includes(input.toLowerCase()) || mk.title.toLowerCase().includes(input.toLowerCase())),
    [ musicKits, input ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        setIsLoading(true);
        const kitsRes = await $api.getMusicKits();
        setMusicKits(kitsRes.kits);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (!musicKits.length && !isLoading) {
      prepare();
    }
  });

  async function playMVP(kit: IMusicKit) {
    if (mvpSound) {
      mvpSound.unloadAsync();
      setMvpSound(null);
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: `https://linquint.dev/music/${kit.folder}/roundmvpanthem_01.mp3` },
      { shouldPlay: false },
      undefined,
      true,
    );
    const status = await sound.playAsync();
    setMvpSound(sound);
    if (status.isLoaded) {
      $snackbar.playbackSnackBar(kit, (status as AVPlaybackStatusSuccess).durationMillis);
    }
  }

  return (
    <>
      <Text style={global.title}>Music Kits</Text>
      <Input
        label='Search'
        onChange={setInput}
        icon={{ name: 'music-circle-outline', type: 'material-community' }}
        value={input}
      />
      {
        isLoading ? <Loader />
          : <FlatList
            data={renderedKits}
            renderItem={({ item }) =>
              <MusicKit
                kit={item}
                rate={$store.currency}
                onClick={playMVP}
              />}
            keyExtractor={({ artist, title }) => `${artist}-${title}`.replaceAll(' ', '_')}
          />
      }
    </>
  );
}
