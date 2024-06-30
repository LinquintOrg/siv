import Input from '@/Input';
import Text from '@/Text';
import { sql } from '@utils/sql';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { IExchangeRate } from 'types';
import styles from 'styles/pages/settings';
import useStore from 'store';

export default function SettingsRatesPage() {
  const $store = useStore();
  const [ rates, setRates ] = useState<IExchangeRate[]>([]);
  const [ loaded, setLoaded ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ search, setSearch ] = useState('');

  useEffect(() => {
    async function prepare() {
      try {
        setLoading(true);
        const r = await sql.getRates();
        setRates(r);
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    }
    if (!loaded && !loading) {
      prepare();
    }
  });

  const ratesToRender = useMemo(
    () => rates.filter(({ code }) => code.toLowerCase().includes(search.toLowerCase())),
    [ search, rates ],
  );

  async function selectRate(selected: IExchangeRate) {
    await sql.setSetting('currency', selected.code);
    $store.setCurrency(selected);
    setSearch('');
    router.push('/settings');
  }

  const RenderableItem = (item: IExchangeRate) => (
    <Pressable style={styles.optionWrapper} onPress={() => selectRate(item)}>
      <Text bold style={styles.optionValue}>{ item.code }</Text>
      <Text style={styles.optionValue}>Currency name</Text>
    </Pressable>
  );

  return (
    <>
      <Input
        label='Find currency'
        icon={{ name: 'search', type: 'material-community' }}
        value={search}
        onChange={setSearch}
      />
      <FlatList
        data={ratesToRender}
        renderItem={({ item }) => <RenderableItem code={item.code} rate={item.rate} />}
        keyExtractor={item => item.code}
      />
    </>
  );
}
