import { Image, Pressable, View } from 'react-native';
import styles from '@styles/pages/inventory';
import { global, templates } from '@styles/global';
import { helpers } from '@utils/helpers';
import Text from './Text';
import useStore from 'store';
import { IItem, ISortOptions } from 'types';
import { useMemo } from 'react';

interface IInventoryItemProps {
  item: IItem;
  idx: number;
  sort: ISortOptions;
  navigateToItem: (arg0: IItem) => void;
}

export default function InventoryItem(props: IInventoryItemProps) {
  const $store = useStore();
  const { item, idx, navigateToItem } = props;

  const priceDiff = useMemo(() => {
    if (!item.price.difference[props.sort.period]) {
      return { percent: 0, amount: 0 };
    }
    return {
      percent: item.price.difference[props.sort.period].percent,
      amount: item.price.difference[props.sort.period].amount * item.amount,
    };
  }, [ item.price.difference, props.sort.period, item.amount ]);

  return (
    <Pressable style={[ styles.item, idx % 2 === 0 ? styles.itemEven : null ]} onPress={() => navigateToItem(item)}>
      <Image source={{ uri: `https://community.akamai.steamstatic.com/economy/image/${item.icon_url}` }} style={styles.itemImage} />
      <View style={[ templates.column, { width: helpers.resize(280), justifyContent: 'space-between', minHeight: helpers.resize(100) } ]}>
        <View style={[ templates.column ]}>
          <View style={global.wrapRow}>
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
          </View>
          <Text bold style={styles.itemTitle}>{ item.market_hash_name }</Text>
        </View>
        <View style={templates.row}>
          <View style={[
            item.amount > 1 ? templates.column : templates.row, {
              width: item.amount > 1 ? '38%' : '98%',
              justifyContent: item.amount > 1 ? 'center' : 'flex-end',
              gap: item.amount > 1 ? 1 : helpers.resize(8),
              alignItems: 'center',
            },
          ]}>
            {
              item.amount > 1
                ? <Text style={styles.itemPriceInfo}>{ item.amount } owned</Text>
                : <Text bold style={[
                  styles.itemPriceInfo,
                  priceDiff.amount < 0 ? styles.loss : priceDiff.amount > 0 ? styles.profit : styles.samePrice,
                ]}>
                  { helpers.price($store.currency, priceDiff.amount) } ({priceDiff.amount > 0 ? '+' : ''}{ priceDiff.percent.toFixed(1) }%)
                </Text>
            }
            <Text bold style={styles.itemPrice}>{ helpers.price($store.currency, item.price.price || 0) }</Text>
          </View>
          {
            item.amount > 1 &&
              <View style={[
                templates.row, {
                  width: '60%',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  gap: helpers.resize(8),
                },
              ]}>
                <Text bold style={[
                  styles.itemPriceInfo,
                  priceDiff.amount < 0 ? styles.loss : priceDiff.amount > 0 ? styles.profit : styles.samePrice,
                ]}>
                  { helpers.price($store.currency, priceDiff.amount) } ({priceDiff.amount > 0 ? '+' : ''}{ priceDiff.percent.toFixed(1) }%)
                </Text>
                <Text bold style={styles.itemPrice}>{ helpers.price($store.currency, item.price.price || 0, item.amount) }</Text>
              </View>
          }
        </View>
      </View>
    </Pressable>
  );
}
