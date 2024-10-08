import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { useGlobalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, View } from 'react-native';
import useStore from 'store';
import styles from '@styles/pages/item';
import { colors, global, templates } from '@styles/global';
import { IItemPrice } from 'types';
import AppliedItems from '@/AppliedItems';

export default function InventoryItemPage() {
  const $store = useStore();
  const { item: itemId } = useGlobalSearchParams();
  const priceRows: { title: string; key: keyof IItemPrice }[] = [
    { title: '24-hours ago', key: 'p24ago' },
    { title: '30 days ago', key: 'p30ago' },
    { title: '90 days ago', key: 'p90ago' },
    { title: 'Year ago', key: 'yearAgo' },
    { title: 'Lowest price', key: 'min' },
    { title: 'Highest price', key: 'max' },
    { title: '24-hour average', key: 'avg24' },
    { title: '7-day average', key: 'avg7' },
    { title: '30-day average', key: 'avg30' },
  ];

  const item = useMemo(
    () => {
      const flatItems = Object.values(helpers.clone($store.inventory)).flatMap(itms => itms);
      return flatItems.find(i => `${i.classid}-${i.instanceid}` === itemId);
    },
    [ $store, itemId ],
  );

  const game = useMemo(
    () => {
      if (!item) {
        return undefined;
      }
      return $store.games.find(g => +g.appid === item.appid);
    },
    [ $store, item ],
  );

  const collection = useMemo(() => {
    if (item) {
      return helpers.inv.collection(item);
    }
    return null;
  }, [ item ]);

  const itemImage = useMemo(() => {
    if (!item) {
      return undefined;
    }
    if (item.icon_url_large) {
      return `https://community.akamai.steamstatic.com/economy/image/${item.icon_url_large}`;
    }
    return `https://community.akamai.steamstatic.com/economy/image/${item.icon_url}`;
  }, [ item ]);

  function priceDiff(prc: IItemPrice, key: keyof IItemPrice) {
    const currentPrice = prc.price;
    const comparedPrice = prc[key] as number;
    const percent = (currentPrice - comparedPrice) / comparedPrice * 100;
    return {
      difference: currentPrice - comparedPrice,
      percent: (percent > 0 ? '+' : '') + percent.toFixed(1) + '%',
      theme: percent < 0 ? styles.loss : percent > 0 ? styles.profit : styles.samePrice,
    };
  }

  return (
    <>
      <ScrollView>
        {
          item && game && <View style={[ templates.column, { gap: helpers.resize(8) } ]}>
            <View style={styles.game}>
              <Image source={{ uri: game?.img }} style={styles.gameIcon} />
              <Text bold style={styles.gameTitle}>{ game?.name }</Text>
            </View>
            <View style={[ templates.row, { justifyContent: 'center' } ]}>
              <Image source={{ uri: itemImage }} style={styles.itemImage} />
            </View>
            <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center' } ]}>
              {
                !!helpers.inventory.getRarity(item.tags) &&
                <Text bold style={[
                  styles.itemPill, {
                    backgroundColor: helpers.pastelify(helpers.inventory.getRarityColor(item.tags)),
                    color: helpers.pastelify(helpers.inventory.getRarityColor(item.tags), 0),
                  },
                ]}
                >
                  { helpers.inventory.getRarity(item.tags)!.replace(' Grade', '') }
                </Text>
              }
              <Text bold style={[ styles.itemPill ]}>{ helpers.inv.itemType(item) }</Text>
              <Text bold style={{ fontSize: helpers.resize(16) }}>{ helpers.inv.nametag(item) }</Text>
            </View>
            <Text bold style={styles.itemName}>{ item.market_name }</Text>
            {
              collection && <View style={[ templates.row, { gap: helpers.resize(4), alignItems: 'center' } ]}>
                <Text bold style={{ fontSize: helpers.resize(16) }}>Collection:</Text>
                <Text style={{ fontSize: helpers.resize(16), color: colors.primary }}>{ collection }</Text>
              </View>
            }

            <AppliedItems item={item} />

            <View style={[ templates.row, { alignItems: 'center', justifyContent: 'space-between' } ]}>
              <Text bold style={[ global.title, { marginVertical: helpers.resize(0) } ]}>Price</Text>
              {
                item.price.found &&
                  <View style={[ templates.column, { alignItems: 'center' } ]}>
                    <Text bold style={{ fontSize: helpers.resize(24) }}>{ helpers.price($store.currency, item.price.price) }</Text>
                    <Text style={{ fontSize: helpers.resize(16) }}>{ item.price.listed } listed</Text>
                  </View>
              }
            </View>
            { !item.price.found && <Text bold>Not found.</Text> }
            {
              item.price.found && priceRows.filter(({ key }) => item.price[key] !== null).map(priceInfo => (
                <View style={[ templates.column, { marginLeft: helpers.resize(8), gap: helpers.resize(2) } ]} key={priceInfo.key}>
                  <Text style={{ fontSize: helpers.resize(18) }}>{ priceInfo.title }</Text>
                  <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center' } ]}>
                    <Text bold style={{ fontSize: helpers.resize(18) }}>{ helpers.price($store.currency, item.price[priceInfo.key] as number) }</Text>
                    <Text bold style={[ styles.itemPriceInfo, priceDiff(item.price, priceInfo.key).theme ]}>
                      { helpers.price($store.currency, priceDiff(item.price, priceInfo.key).difference) } / { priceDiff(item.price, priceInfo.key).percent }
                    </Text>
                  </View>
                </View>
              ))
            }
          </View>
        }
      </ScrollView>
    </>
  );
}
