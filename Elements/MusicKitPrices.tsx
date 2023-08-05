import { View, StyleSheet } from 'react-native';
import React from 'react';
import Text from './text';
import { IMusicKitPricesProps } from '../utils/types';
import { useRateState, useRatesState } from '../utils/store';

export default function(props: IMusicKitPricesProps) {
  const { kit, prices } = props;
  const rates = useRatesState();
  const rateId = useRateState();
  const rate = rates.getOne(rateId.get());

  const transformHash = (str: string) => {
    do {
      str = str.replace(', ', ',');
    } while (str.includes(', '));
    return str;
  };

  const title = transformHash((kit.artist + ',' + kit.song).toLowerCase());
  const stTitle = 'st ' + title;

  let pNormal = undefined;
  let pStat = undefined;

  for (let i = 0; i < prices.length; i++) {
    if (title === prices[i].Hash) {
      pNormal = Math.round(rate.exc * prices[i].Price * 100) / 100;
    }
    if (stTitle === prices[i].Hash) {
      pStat = Math.round(rate.exc * prices[i].Price * 100) / 100;
    }
    if (pNormal !== undefined && pStat !== undefined) break;
  }

  // TODO: Move styles to global.ts

  const styles = StyleSheet.create({
    price: {
      fontSize: 14,
      color: '#333',
      textAlignVertical: 'center',
      width: '30%',
      textAlign: 'right',
      alignContent: 'space-between',
    },
    containerCol: {
      display: 'flex',
      flexDirection: 'column',
      width: '63%',
    },
  });

  if (!pNormal && !pStat) {
    return (
      <View style={[ styles.containerCol ]}>
        <Text style={styles.price}>Cannot be sold</Text>
      </View>
    );
  }
  if (pStat) {
    return (
      <View style={styles.containerCol}>
        <Text style={styles.price}>NaN</Text>
        <Text style={[ styles.price, { color: '#CF6A32' } ]}>{rate.abb} {pStat.toFixed(2)}</Text>
      </View>
    );
  }
  if (pNormal) {
    return (
      <View style={styles.containerCol}>
        <Text style={styles.price}>{rate.abb} {pNormal.toFixed(2)}</Text>
        <Text style={[ styles.price, { color: '#CF6A32' } ]}>NaN</Text>
      </View>
    );
  }
  if (pStat && pNormal) {
    return (
      <View style={styles.containerCol}>
        <Text style={styles.price}>{rate.abb} {pNormal.toFixed(2)}</Text>
        <Text style={[ styles.price, { color: '#CF6A32' } ]}>{rate.abb} {pStat.toFixed(2)}</Text>
      </View>
    );
  }
}
