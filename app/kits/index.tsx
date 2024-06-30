import Input from '@/Input';
import Loader from '@/Loader';
import MusicKit from '@/MusicKit';
import Text from '@/Text';
import api from '@utils/api';
import { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { global } from 'styles/global';
import { IMusicKit } from 'types';
import useStore from 'store';

export default function KitsPage() {
  const $api = new api();
  const $store = useStore();
  const [ isLoading, setIsLoading ] = useState(false);
  const [ musicKits, setMusicKits ] = useState<IMusicKit[]>([]);
  const [ input, setInput ] = useState('');

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
                artist={item.artist}
                title={item.title}
                image={item.image}
                price={(item.price || 0)}
                statPrice={(item.statPrice || 0)}
                rate={$store.currency}
              />}
            keyExtractor={({ artist, title }) => `${artist}-${title}`.replaceAll(' ', '_')}
          />
      }
    </>
  );
}
