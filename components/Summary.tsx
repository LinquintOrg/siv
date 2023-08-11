import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { View, Image } from 'react-native';
import { Divider } from 'react-native-elements';
import Text from './Text.tsx';
import { useProfilesState, useRateState, useRatesState } from '../utils/store';
import { helpers } from '../utils/helpers';
import { colors, global, styles } from '../styles/global';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { IInventoryStats } from '../utils/types.ts';

const Summary = React.forwardRef<BottomSheetMethods, { stats: IInventoryStats }>((props, ref) => {
  const rate = useRateState();
  const rates = useRatesState();
  const profiles = useProfilesState();
  const { stats } = props;

  function price(p: number) {
    const r = rates.getOne(rate.get());
    return `${r.abb} ${p.toFixed(2)}`;
  }

  const priceChange = (oldPrice: number, currentPrice: number) => {
    if (oldPrice > 0 && currentPrice > 0) {
      if (oldPrice > currentPrice) {
        return (
          <Text style={[ styles.inventory.pill, global.pcDecrease ]}>
            { (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(1) }%
          </Text>
        );
      }
      if (oldPrice < currentPrice) {
        return (
          <Text style={[ styles.inventory.pill, global.pcIncrease ]}>
						+{ (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(1) }%
          </Text>
        );
      }
    }
    return <Text style={[ styles.inventory.pill, global.pcUnchanged ]}>0%</Text>;
  };

  const priceDiff = (oldPrice: number, currentPrice: number) => {
    const bg = { backgroundColor: '#00000000' };
    const diff = currentPrice - oldPrice;
    return (
      <Text bold style={[ styles.inventory.pill, (diff > 0 ? global.pcIncrease : diff < 0 ? global.pcDecrease : global.pcUnchanged), bg ]}>
        { diff > 0 ? '+' : '' } { diff.toFixed(2) }
      </Text>
    );
  };

  return (
    <BottomSheet
      ref={ref}
      snapPoints={[ helpers.resize(64), '50%', '90%' ]}
      handleStyle={{ borderRadius: helpers.resize(32) }}
      handleIndicatorStyle={{ height: helpers.resize(8), width: helpers.resize(48), backgroundColor: colors.primary }}
      backgroundStyle={{ borderTopLeftRadius: helpers.resize(32), borderTopRightRadius: helpers.resize(32) }}
    >
      <BottomSheetScrollView contentContainerStyle={[ global.column, { paddingHorizontal: helpers.resize(12) } ]}>
        <Text bold style={global.title}>Inventory summary</Text>

        {
          profiles.getByID(stats.steamID) &&
          <View style={ global.rowContainer }>
            <Image style={ global.rowImage } source={{ uri: profiles.getByID(stats.steamID)!.url || '' }} />
            <View style={ global.column }>
              <Text style={ global.subtitle }>{ profiles.getByID(stats.steamID)!.name }</Text>
              <Text bold>{ stats.steamID }</Text>
            </View>
          </View>
        }

        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Total value</Text>
          <Text bold style={global.statsValue}>{ price(stats.price) }</Text>
        </View>

        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Items owned</Text>
          <Text bold style={global.statsValue}>{ stats.owned }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Of which marketable</Text>
          <Text bold style={global.statsValue}>{ stats.ownedTradeable }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Avg. item price (marketable)</Text>
          <Text bold style={global.statsValue}>{ price(stats.price / stats.ownedTradeable) } / item</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Missing prices</Text>
          <Text bold style={global.statsValue}>{ stats.missingPrices }</Text>
        </View>

        <Divider width={helpers.resize(4)} color={ colors.primary } style={global.divider} />

        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Total 24 hours ago</Text>
          <Text bold style={global.statsValue}>{ stats.p24ago }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Price change</Text>
          <View style={global.row}>{ priceDiff(stats.p24ago, stats.price) }{ priceChange(stats.p24ago, stats.price) }</View>
        </View>

        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Total 30 days ago</Text>
          <Text bold style={global.statsValue}>{ price(stats.p30ago) }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Price change</Text>
          <View style={global.row}>{ priceDiff(stats.p30ago, stats.price) }{ priceChange(stats.p30ago, stats.price) }</View>
        </View>

        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Total 90 days ago</Text>
          <Text bold style={global.statsValue}>{ price(stats.p90ago) }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>Price change</Text>
          <View style={global.row}>{ priceDiff(stats.p90ago, stats.price) }{ priceChange(stats.p90ago, stats.price) }</View>
        </View>

        <Divider width={helpers.resize(4)} color={ colors.primary } style={global.divider} />

        <View style={global.dataRow}>
          <Text style={global.statsTitle}>24 hour average value</Text>
          <Text bold style={global.statsValue}>{ price(stats.avg24) }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>7 day average value</Text>
          <Text bold style={global.statsValue}>{ price(stats.avg7) }</Text>
        </View>
        <View style={global.dataRow}>
          <Text style={global.statsTitle}>30 day average value</Text>
          <Text bold style={global.statsValue}>{ price(stats.avg30) }</Text>
        </View>

        <Divider width={helpers.resize(4)} color={ colors.primary } style={global.divider} />

        <View style={global.column}>
          <Text style={global.statsTitle}>Most expensive item</Text>
          <Text style={[ global.statsValue, { width: '100%' } ]}>{stats.expensive.name}</Text>
          <Text bold style={[ global.statsValue, { width: '100%' } ]}>{ price(stats.expensive.price) }</Text>
        </View>

        <View style={global.column}>
          <Text style={global.statsTitle}>Cheapest item</Text>
          <Text style={[ global.statsValue, { width: '100%' } ]}>{stats.cheapest.name}</Text>
          <Text bold style={[ global.statsValue, { width: '100%' } ]}>{ price(stats.cheapest.price) }</Text>
        </View>

        <Text bold style={global.title}>Individual game stats</Text>

        {
          stats.games.map((data, index) => (
            <View key={`summary-game-${index}`}>
              <Text bold style={global.subtitle}>{ data.game.name }</Text>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Value</Text>
                <Text bold style={global.statsValue}>{ price(data.price) }</Text>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Items owned</Text>
                <Text bold style={global.statsValue}>{data.owned}</Text>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Of which marketable</Text>
                <Text bold style={global.statsValue}>{data.ownedTradeable}</Text>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Total 24 hours ago</Text>
                <Text bold style={global.statsValue}>{ data.p24ago }</Text>
              </View>
              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Price change</Text>
                <View style={global.row}>{ priceDiff(data.p24ago, data.price) }{ priceChange(data.p24ago, data.price) }</View>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Total 30 days ago</Text>
                <Text bold style={global.statsValue}>{ price(data.p30ago) }</Text>
              </View>
              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Price change</Text>
                <View style={global.row}>{ priceDiff(data.p30ago, data.price) }{ priceChange(data.p30ago, data.price) }</View>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Total 90 days ago</Text>
                <Text bold style={global.statsValue}>{ price(data.p90ago) }</Text>
              </View>
              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Price change</Text>
                <View style={global.row}>{ priceDiff(data.p90ago, data.price) }{ priceChange(data.p90ago, data.price) }</View>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Average 24 hour</Text>
                <Text bold style={global.statsValue}>{ price(data.avg24) }</Text>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Average 7 day</Text>
                <Text bold style={global.statsValue}>{ price(data.avg7) }</Text>
              </View>

              <View style={global.dataRow}>
                <Text style={global.statsTitle}>Average 30 day</Text>
                <Text bold style={global.statsValue}>{ price(data.avg30) }</Text>
              </View>

              {
                (data.game.appid === 730) &&
                <View>
                  <View style={global.dataRow}>
                    <Text style={global.statsTitle}>Applied stickers value</Text>
                    <Text bold style={global.statsValue}>{ price(data.stickersVal!) }</Text>
                  </View>

                  <View style={global.dataRow}>
                    <Text style={global.statsTitle}>Applied patches value</Text>
                    <Text bold style={global.statsValue}>{ price(data.patchesVal!) }</Text>
                  </View>
                </View>
              }

              <Divider width={helpers.resize(4)} color={ colors.primary } style={global.divider} />

              {
                (stats.games.length - 1 === index) &&
                <Text bold style={[ styles.inventory.dismissHint ]}>The end of summary</Text>
              }
            </View>
          ))
        }
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default Summary;
