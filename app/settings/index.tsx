import Text from '@/Text';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { global } from 'styles/global';
import styles from 'styles/pages/settings';

export default function SettingsPage() {

  // TODO: rates with rate listener on SQL

  return (
    <>
      <Text bold style={global.title}>Settings</Text>
      <Text bold style={styles.optionTitle}>Currency</Text>
      <Link asChild href='/settings/rates'>
        <Pressable style={[ styles.optionWrapper, global.row ]}>
          <Text bold style={styles.optionValue}>EUR</Text>
          <Text style={styles.optionValue}> - Euro</Text>
        </Pressable>
      </Link>
    </>
  );
}
