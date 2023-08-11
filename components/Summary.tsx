import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
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

  function convertPrice(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return (Math.round(p * 100 * r.exc) * amount / 100).toFixed(2);
  }

  function price(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return `${r.abb} ${convertPrice(p, amount)}`;
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
        { diff > 0 ? '+' : '' } { convertPrice(diff) }
      </Text>
    );
  };

  return (
    <BottomSheet
      ref={ref}
      snapPoints={[ resize(64), '50%', '90%' ]}
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

        <Divider width={helpers.resize(4)} color={ colors.primary } style={styles.divider} />

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

        <Divider width={helpers.resize(4)} color={ colors.primary } style={styles.divider} />

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

        <Divider width={helpers.resize(4)} color={ colors.primary } style={styles.divider} />

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

              <Divider width={helpers.resize(4)} color={ colors.primary } style={styles.divider} />

              {
                (stats.games.length - 1 === index) ?
                  <Text bold style={{ textAlign: 'center', color: '#0A5270', fontSize: resize(16), paddingBottom: resize(96) }}>The end of summary</Text> : null
              }
            </View>
          ))
        }
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

const resize = (size) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const stylesLoc = StyleSheet.create({
  title: {
    fontSize: resize(24),
    textAlign: 'center',
    marginBottom: resize(12),
    color: '#12428D',
  },
  scrollStyle: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: resize(16),
  },
  dataRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsTitle: {
    fontSize: resize(15),
    textAlignVertical: 'center',
  },
  statsValue: {
    fontSize: resize(16),
    color: '#333',
    textAlign: 'right',
  },
  statsValueSmall: {
    fontSize: resize(13),
    textAlign: 'right',
  },
  divider: {
    width: resize(64),
    alignSelf: 'center',
    borderRadius: 8,
    marginVertical: resize(12),
  },
  game: {
    fontSize: resize(20),
    color: '#12428D',
  },
  itemPriceChange: {
    fontSize: resize(13),
    color: '#fff',
    paddingHorizontal: resize(8),
    paddingVertical: resize(4),
    borderRadius: 30,
    textAlign: 'center',
  },
  pcIncrease: {
    backgroundColor: '#7fff7f',
    color: '#336433',
  },
  pcDecrease: {
    backgroundColor: '#ff7f7f',
    color: '#663333',
  },
  pcUnchanged: {
    backgroundColor: '#ff9f7f',
    color: '#664033',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
});

export default Summary;

// function Summary(props) {
//     const [scale] = useState(Dimensions.get('window').width / 423);
//     const resize = (size) => {
//         return Math.ceil(size * scale)
//     }

//     const stats = props.stats
//     const curr = props.curr
//     const rate = props.rate

//     return (
//         <Sheet
//             show={props.showSheet}
//             onClose={() => props.setShowSheet(false)}
//             contentContainerStyle={{height: resize(540)}}
//         >
//             <View style={{flex: 1, alignItems: 'center', backgroundColor: '#fff', height: '100%'}}>
//                 <View style={{marginBottom: resize(8), alignItems: 'center', width: '100%',}}>
//                     <Text bold style={[styles.gameTitle, {fontSize: resize(24), color: '#555'}]}>Inventory Details</Text>
//                     <Text style={{color: '#777'}}>SteamID: <Text bold style={{ color: '#444'}}>{props.steam}</Text></Text>
//                     <Text style={{color: '#777'}}>Games loaded (appid): <Text bold style={{ color: '#444'}}>{JSON.stringify(props.games)}</Text></Text>
//                 </View>

//                 <ScrollView>
//                     <View style={{alignItems: 'center'}}>
//                         <View style={[global.column, {width: '95%'}]}>

//                             <View style={[styles.summarySection]}>
//                                 <View style={global.dataRow}>
//                                     <Text style={global.statsTitle}>Total value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['price'] * rate * 100) / 100).toFixed(2)}</Text>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>Items owned</Text>
//                                     <Text bold style={styles.statsDetails}>{ stats['owned'] }</Text>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>Of which marketable</Text>
//                                     <Text bold style={styles.statsDetails}>{ stats['ownedTradeable'] }</Text>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>Average item price</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['price'] / stats['ownedTradeable'] * rate * 100) / 100).toFixed(2)} / item</Text>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>Missing prices</Text>
//                                     <Text bold style={styles.statsDetails}>{ stats.missingPrices }</Text>
//                                 </View>
//                             </View>

//                             <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8,}} />

//                             <View style={styles.summarySection}>
//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>24 hour average value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['avg24'] * rate * 1000) / 1000).toFixed(2)}</Text>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>7 day average value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['avg7'] * rate * 1000) / 1000).toFixed(2)}</Text>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>30 day average value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['avg30'] * rate * 1000) / 1000).toFixed(2)}</Text>
//                                 </View>
//                             </View>

//                             <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8,}} />

//                             <View style={styles.summarySection}>
//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>Most expensive item</Text>
//                                     <View style={[global.column, {width: '55%'}]}>
//                                         <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['expensive'].name}</Text>
//                                         <Text bold style={[styles.statsDetails, {width: '100%'}]}>{curr} {(Math.round(stats['expensive'].price * rate * 100) / 100).toFixed(2)}</Text>
//                                     </View>
//                                 </View>

//                                 <View style={global.row}>
//                                     <Text style={global.statsTitle}>Cheapest item</Text>
//                                     <View style={[global.column, {width: '55%'}]}>
//                                         <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['cheapest'].name}</Text>
//                                         <Text bold style={[styles.statsDetails, {width: '100%'}]}>{curr} {(Math.round(stats['cheapest'].price * rate * 100) / 100).toFixed(2)}</Text>
//                                     </View>
//                                 </View>
//                             </View>

//                             <Text bold style={[styles.gameName]}>Game stats</Text>

//                             {
//                                 stats.games.map((data, index) => (
//                                     <View style={[styles.summarySection, {paddingVertical: 0}]}>
//                                         <Text bold style={styles.sumGame}>{ data.game }</Text>

//                                         <View style={global.row}>
//                                             <Text style={global.statsTitle}>Value</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.price * rate * 100) / 100).toFixed(2)}</Text>
//                                         </View>

//                                         <View style={global.row}>
//                                             <Text style={global.statsTitle}>Items owned</Text>
//                                             <Text bold style={styles.statsDetails}>{data.owned}</Text>
//                                         </View>

//                                         <View style={global.row}>
//                                             <Text style={global.statsTitle}>Of which marketable</Text>
//                                             <Text bold style={styles.statsDetails}>{data.ownedTradeable}</Text>
//                                         </View>

//                                         <View style={global.row}>
//                                             <Text style={global.statsTitle}>Average 24 hour</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.avg24 * rate * 1000) / 1000).toFixed(2)}</Text>
//                                         </View>

//                                         <View style={global.row}>
//                                             <Text style={global.statsTitle}>Average 7 day</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.avg7 * rate * 1000) / 1000).toFixed(2)}</Text>
//                                         </View>

//                                         <View style={global.row}>
//                                             <Text style={global.statsTitle}>Average 30 day</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.avg30 * rate * 1000) / 1000).toFixed(2)}</Text>
//                                         </View>

//                                         {
//                                             (data.appid === 730) ?
//                                                 <View>
//                                                     <View style={global.row}>
//                                                         <Text style={global.statsTitle}>Applied stickers value</Text>
//                                                         <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.stickerVal * rate * 100) / 100).toFixed(2)}</Text>
//                                                     </View>

//                                                     <View style={global.row}>
//                                                         <Text style={global.statsTitle}>Applied patches value</Text>
//                                                         <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.patchVal * rate * 100) / 100).toFixed(2)}</Text>
//                                                     </View>
//                                                 </View> : null
//                                         }

//                                         <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8, marginVertical: resize(16),}} />

//                                         {
//                                             (stats.games.length - 1 === index) ?
//                                                 <Text bold style={{textAlign: 'center', color: '#0A5270', fontSize: resize(16), paddingBottom: resize(96),}}>The end of summary</Text> : null
//                                         }
//                                     </View>
//                                 ))
//                             }

//                         </View>
//                     </View>
//                 </ScrollView>
//             </View>

//         </Sheet>
//     )
// }
