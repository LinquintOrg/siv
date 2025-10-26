import { Image, Pressable, StyleSheet, View } from 'react-native';
import { BorderRadius, colors, FontSizes, Shadows, Spacing } from '@styles/global';
import Text from './Text';
import { IItemPrice, IParsedItem, ISortOptions } from 'types';
import React, { useMemo } from 'react';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import useStore from 'store';
import { helpers } from '@utils/helpers';
import { PriceTrend } from '@/badges/PriceTrend';

interface IInventoryItemProps {
  item: IParsedItem;
  idx: number;
  sort: ISortOptions;
  navigateToItem: (arg0: IParsedItem) => void;
}

export const InventoryItem: React.FC<IInventoryItemProps> = ({ item, sort, navigateToItem }) => {
  const $store = useStore();

  const itemTags = useMemo(() => {
    const tags: { title: string; style?: { backgroundColor: string; color: string } }[] = [];
    if (item.rarity) {
      tags.push({
        title: item.rarity.name.replace(' Grade', ''),
        style: {
          backgroundColor: helpers.pastelify(item.rarity.color, 150),
          color: helpers.pastelify(item.rarity.color, 0),
        },
      });
    }
    if (item.itemType) {
      tags.push({ title: item.itemType });
    }
    return tags;
  }, [ item ]);

  const priceField = useMemo<keyof IItemPrice>(() => {
    switch (sort.period) {
    case 'day': return 'p24ago';
    case 'month': return 'p30ago';
    case 'threeMonths': return 'p90ago';
    case 'year': return 'yearAgo';
    }
  }, [ sort.period ]);

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigateToItem(item)}
      android_ripple={{ color: Colors.gray100 }}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: `https://community.akamai.steamstatic.com/economy/image/${item.iconUrl}` }} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.tagContainer}>
          {itemTags.map((tag, index) => (
            <View
              key={index}
              style={[ styles.tag, tag.style ? tag.style : null ]}
            >
              <Text style={styles.tagText}>{tag.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.itemName} /*numberOfLines={2}*/>
          {item.name}
        </Text>

        { item.condition && <Text style={styles.condition}>{ item.condition }</Text> }

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{ helpers.price($store.currency, item.price.found ? item.price.price : 0) }</Text>
          <PriceTrend price={item.price as IItemPrice} field={priceField} fontSize={12} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.sm,
    alignItems: 'center',
    ...Shadows.small,
  },
  imageContainer: {
    width: helpers.resize(96),
    height: helpers.resize(96),
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  image: {
    width: '95%',
    height: '95%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  itemName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: helpers.resize(2),
    lineHeight: helpers.resize(20),
  },
  condition: {
    fontSize: FontSizes.xs,
    color: colors.textAccent,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  priceChangePositive: {
    backgroundColor: colors.success,
  },
  priceChangeNegative: {
    backgroundColor: helpers.pastelify(colors.error, 100),
  },
  priceChangeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  priceChangeTextPositive: {
    color: colors.text,
  },
  priceChangeTextNegative: {
    color: colors.white,
  },
});
