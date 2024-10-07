import Text from '@/Text';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { colors, global } from 'styles/global';
import styles from 'styles/pages/settings';
import useStore from 'store';
import { useMemo } from 'react';

export default function SettingsPage() {
  const $store = useStore();

  const currency = useMemo(() => {
    return {
      code: $store.currency.code,
      name: $store.currencyNames[$store.currency.code].name,
    };
  }, [ $store.currency, $store.currencyNames ]);

  return (
    <>
      <Text bold style={global.title}>Settings</Text>
      <Text bold style={styles.optionTitle}>Currency</Text>
      <Link asChild href='/settings/rates'>
        <Pressable style={styles.activeSelection}>
          <Text bold style={[ styles.optionValue, { color: colors.white } ]}>{ currency.code }</Text>
          <Text style={[ styles.optionValueSub, { color: colors.white } ]}>{ currency.name }</Text>
        </Pressable>
      </Link>
    </>
  );
}
