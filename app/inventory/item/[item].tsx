import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { useGlobalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, ScrollView, View } from 'react-native';
import useStore from 'store';
import styles from '@styles/pages/item';
import { colors, global, templates } from '@styles/global';
import { IItemPrice } from 'types';
import AppliedItems from '@/AppliedItems';
import { PriceTrend } from '@/badges/PriceTrend';

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
      const flatItems = Object.values(helpers.clone($store.inventory)).flatMap(items => items);
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

  const itemImage = useMemo(() => {
    if (!item) {
      return undefined;
    }
    // TODO: test if I need large icon
    // if (item.icon_url_large) {
    //   return `https://community.akamai.steamstatic.com/economy/image/${item.icon_url_large}`;
    // }
    return `https://community.akamai.steamstatic.com/economy/image/${item.iconUrl}`;
  }, [ item ]);

  const ItemDetail: React.FC<{ title: string; value: string }> = ({ title, value }) => {
    return (
      <View style={[ templates.row, { gap: helpers.resize(4) } ]}>
        <Text style={{ fontSize: helpers.resize(14) }}>{title}:</Text>
        <Text bold style={{ fontSize: helpers.resize(14), color: colors.primary }}>{value}</Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView>
        {
          item && game && <View style={[ templates.column, { gap: helpers.resize(8) } ]}>
            <View style={styles.game}>
              <Image source={{ uri: game?.icon }} style={styles.gameIcon} />
              <Text bold style={styles.gameTitle}>{ game?.name }</Text>
            </View>
            <View style={[ templates.row, { justifyContent: 'center' } ]}>
              <Image source={{ uri: itemImage }} style={styles.itemImage} />
            </View>
            <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center' } ]}>
              {
                !!item.rarity &&
                <Text bold style={[
                  styles.itemPill, {
                    backgroundColor: helpers.pastelify(item.rarity.color),
                    color: helpers.pastelify(item.rarity.color, 0),
                  },
                ]}
                >
                  { item.rarity.name }
                </Text>
              }
              <Text bold style={[ styles.itemPill ]}>{ item.itemType }</Text>
            </View>
            <Text bold style={styles.itemName}>{ item.name }</Text>
            { item.condition && <ItemDetail title={'Condition'} value={item.condition} /> }
            {
              item.skinProps && <>
                <ItemDetail title={'Float'} value={item.skinProps.float} />
                <ItemDetail title={'Pattern index'} value={item.skinProps.pattern.toString()} />
              </>
            }
            { item.nameTag && <ItemDetail title={'Name Tag'} value={item.nameTag} /> }
            { item.collection && <ItemDetail title={'Collection'} value={item.collection} /> }

            <AppliedItems item={item} />

            <View style={[ templates.row, { alignItems: 'center', justifyContent: 'space-between', marginTop: helpers.resize(12) } ]}>
              <Text bold style={[ global.title, { marginVertical: helpers.resize(0), fontSize: helpers.resize(24) } ]}>Price</Text>
              {
                item.price.found &&
                  <View style={[ templates.column, { alignItems: 'center' } ]}>
                    <Text bold style={{ fontSize: helpers.resize(24) }}>{ helpers.price($store.currency, item.price.price) }</Text>
                    <Text style={{ fontSize: helpers.resize(16) }}>{ item.price.listed } listed</Text>
                  </View>
              }
            </View>
            { !item.price.found && <Text bold style={{ textAlign: 'center', fontSize: helpers.resize(18) }}>Not found.</Text> }
            {
              item.price.found && priceRows.map(priceInfo => (
                <View style={[ templates.column, { marginLeft: helpers.resize(8), gap: helpers.resize(2) } ]} key={priceInfo.key}>
                  <Text style={{ fontSize: helpers.resize(18) }}>{ priceInfo.title }</Text>
                  <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center' } ]}>
                    <Text bold style={{ fontSize: helpers.resize(18) }}>
                      { helpers.price($store.currency, (item.price as IItemPrice)[priceInfo.key] as number) }
                    </Text>
                    <PriceTrend price={item.price as IItemPrice} field={priceInfo.key} fontSize={14} />
                    {/*<Text bold style={[ styles.itemPriceInfo, priceDiff((item.price as IItemPrice), priceInfo.key).theme ]}>*/}
                    {/*  { helpers.price($store.currency, priceDiff(item.price as IItemPrice, priceInfo.key).difference) }*/}
                    {/*  &nbsp;/&nbsp;*/}
                    {/*  { priceDiff(item.price as IItemPrice, priceInfo.key).percent }*/}
                    {/*</Text>*/}
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
