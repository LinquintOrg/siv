import Input from '@/Input';
import Text from '@/Text';
import { sql } from '@utils/sql';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { IExchangeRate } from 'types';
import styles from 'styles/pages/settings';
import useStore from 'store';
import { FlashList } from '@shopify/flash-list';
import { helpers } from '@utils/helpers';
import { colors } from '@styles/global';

export default function SettingsRatesPage() {
  const $store = useStore();
  const [ rates, setRates ] = useState<IExchangeRate[]>([]);
  const [ loaded, setLoaded ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ search, setSearch ] = useState('');

  useEffect(() => {
    async function prepare() {
      setLoading(true);
      const r = await sql.getRates();
      setRates(r);
      setLoaded(true);
    }
    if (!loaded && !loading) {
      prepare();
    }
  });

  const ratesToRender = useMemo(() => {
    const filteredAndSorted = rates.filter(({ code }) => {
      return $store.currency.code !== code && (helpers.search(code, search) || helpers.search($store.currencyNames[code]?.name || '', search));
    }).sort((a, b) => a.code < b.code ? -1 : 1);
    return [ $store.currency ].concat(filteredAndSorted);
  },
  [ search, rates, $store.currencyNames, $store.currency ]);

  async function selectRate(selected: IExchangeRate) {
    await sql.setSetting('currency', selected.code);
    $store.setCurrency(selected);
    setSearch('');
    router.push('/settings');
  }

  const RenderableItem = (item: IExchangeRate & { idx: number }) => (
    <Pressable style={[ item.idx === 0 ? styles.activeSelection : styles.optionWrapper ]} onPress={() => selectRate(item)}>
      <Text bold style={[ styles.optionValue, item.idx === 0 ? { color: colors.white } : {} ]}>{ item.code }</Text>
      <Text style={[ styles.optionValueSub, item.idx === 0 ? { color: colors.white } : {} ]}>{ $store.currencyNames[item.code]?.name || 'Currency name' }</Text>
    </Pressable>
  );

  return (
    <>
      <Input
        label='Find currency'
        icon={{ name: 'search', type: 'feather' }}
        value={search}
        onChange={setSearch}
      />
      <FlashList
        data={ratesToRender}
        renderItem={({ item, index }) => <RenderableItem code={item.code} rate={item.rate} idx={index} />}
        estimatedItemSize={helpers.resize(70)}
        stickyHeaderIndices={[ 0 ]}
      />
    </>
  );
}
