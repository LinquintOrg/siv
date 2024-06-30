import Text from '@/Text';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { global } from 'styles/global';
import styles from 'styles/pages/settings';
import useStore from 'store';

export default function SettingsPage() {
  const $store = useStore();

  return (
    <>
      <Text bold style={global.title}>Settings</Text>
      <Text bold style={styles.optionTitle}>Currency</Text>
      <Link asChild href='/settings/rates'>
        <Pressable style={styles.optionWrapper}>
          <Text bold style={styles.optionValue}>{ $store.currency.code }</Text>
          <Text style={styles.optionValue}>Currency name</Text>
        </Pressable>
      </Link>
    </>
  );
}
