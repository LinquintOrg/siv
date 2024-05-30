import Text from '@/Text';
import { sql } from '@utils/sql';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { global } from 'styles/global';
import styles from 'styles/pages/settings';
import { IExchangeRate } from 'types';
import * as SQLite from 'expo-sqlite';

export default function SettingsPage() {
  const [ currentRate, setCurrentRate ] = useState<IExchangeRate>({ code: 'USD', rate: 1 });

  SQLite.addDatabaseChangeListener(async newSql => {
    if (newSql.tableName === 'Settings') {
      const newRate = await sql.getOneRate();
      setCurrentRate(newRate);
    }
  });

  return (
    <>
      <Text bold style={global.title}>Settings</Text>
      <Text bold style={styles.optionTitle}>Currency</Text>
      <Link asChild href='/settings/rates'>
        <Pressable style={styles.optionWrapper}>
          <Text bold style={styles.optionValue}>{ currentRate.code }</Text>
          <Text style={styles.optionValue}>Currency name</Text>
        </Pressable>
      </Link>
    </>
  );
}
