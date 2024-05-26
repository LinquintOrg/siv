import Loader from '@/Loader';
import MusicKit from '@/MusicKit';
import Text from '@/Text';
import api from '@utils/api';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, View } from 'react-native';
import { global } from 'styles/global';
import { IMusicKit } from 'types';

export default function KitsPage() {
  const $api = new api();

  const [ isLoading, setIsLoading ] = useState(true);
  const [ musicKits, setMusicKits ] = useState<IMusicKit[]>([]);
  const [ input, setInput ] = useState('');

  const renderedKits = useMemo(
    () => musicKits.filter(mk => mk.artist.toLowerCase().includes(input.toLowerCase()) || mk.title.toLowerCase().includes(input.toLowerCase())),
    [ musicKits, input ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        if (!musicKits.length) {
          const kitsRes = await $api.getMusicKits();
          setMusicKits(kitsRes.kits);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    prepare();
  });

  return (
    <>
      <Text style={global.title}>Music Kits</Text>
      {
        isLoading ? <Loader />
          : <FlatList
            data={renderedKits}
            renderItem={({ item }) => <MusicKit artist={item.artist} title={item.title} image={item.image} price={item.price} statPrice={item.statPrice} />}
            keyExtractor={({ artist, title }) => `${artist}-${title}`.replaceAll(' ', '_')}
          />
      }
    </>
  );
}
