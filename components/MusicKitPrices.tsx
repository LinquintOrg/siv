import { View } from 'react-native';
import React from 'react';
import Text from '../components/Text';
import { IMusicKitPricesProps } from '../utils/types';
import { useRateState, useRatesState } from '../utils/store';
import { styles } from '../styles/global';

export default function(props: IMusicKitPricesProps) {
  const { kit, prices } = props;
  const rates = useRatesState();
  const rate = useRateState();

  function price(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return `${r.abb} ${(Math.round(p * 100 * r.exc) * amount / 100).toFixed(2)}`;
  }

  const title = (kit.artist + ',' + kit.song).replaceAll(', ', ',').toLowerCase();
  const stTitle = `st ${title}`;

  const pNormal = prices.find(p => p.Hash === title);
  const pStat = prices.find(p => p.Hash === stTitle);

  return (
    <View>
      {
        (!pNormal && !pStat) && <Text style={styles.musicKits.price}>Cannot be sold</Text>
      }
      {
        pNormal && <Text style={styles.musicKits.price}>{ price(pNormal.Price) }</Text>
      }
      {
        pStat && <Text style={[ styles.musicKits.price, { color: '#CF6A32' } ]}>{ price(pStat.Price) }</Text>
      }
    </View>
  );
}
