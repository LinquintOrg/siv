import Input from '@/Input';
import Loader from '@/Loader';
import MusicKit from '@/MusicKit';
import Text from '@/Text';
import api from '@utils/api';
import { sql } from '@utils/sql';
import { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { global } from 'styles/global';
import { IExchangeRate, IMusicKit } from 'types';
import * as SQLite from 'expo-sqlite';

export default function KitsPage() {
  const $api = new api();

  const [ isLoading, setIsLoading ] = useState(false);
  const [ musicKits, setMusicKits ] = useState<IMusicKit[]>([]);
  const [ input, setInput ] = useState('');
  const [ rate, setRate ] = useState<IExchangeRate>({ code: 'USD', rate: 1 });

  SQLite.addDatabaseChangeListener(async newSql => {
    if (newSql.tableName === 'Settings') {
      const newRate = await sql.getOneRate();
      setRate(newRate);
    }
  });

  const renderedKits = useMemo(
    () => musicKits.filter(mk => mk.artist.toLowerCase().includes(input.toLowerCase()) || mk.title.toLowerCase().includes(input.toLowerCase())),
    [ musicKits, input ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        setIsLoading(true);
        const r = await sql.getOneRate();
        if (r) {
          setRate(r);
        }
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
                rate={rate}
              />}
            keyExtractor={({ artist, title }) => `${artist}-${title}`.replaceAll(' ', '_')}
          />
      }
    </>
  );
}
