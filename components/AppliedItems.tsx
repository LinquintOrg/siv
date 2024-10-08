import { useMemo } from 'react';
import { Image, View } from 'react-native';
import { IItem } from 'types';
import useStore from 'store';
import Text from './Text';
import { colors, templates } from '@styles/global';
import { helpers } from '@utils/helpers';
import styles from '@styles/pages/item';

interface IAppliedItems {
  item: IItem;
}

export default function AppliedItems({ item }: IAppliedItems) {
  const $store = useStore();
  const stickersTotal = useMemo(() => {
    if (!item || !item.stickers?.length) {
      return null;
    }
    let total = 0;
    item.stickers.forEach(sticker => {
      total += +($store.stickerPrices[sticker.longName] * $store.currency.rate).toFixed(2);
    });
    return total;
  }, [ item, $store ]);

  const totalByType = useMemo<{ stickers: number; patches: number; charms: number }>(() => {
    if (!item || (!item.stickers?.length && !item.patches?.length && !item.charms?.length)) {
      return { stickers: 0, patches: 0, charms: 0 };
    }
    return {
      stickers: item.stickers?.reduce((val, { longName }) => val + $store.stickerPrices[longName], 0) || 0,
      patches: item.patches?.reduce((val, { longName }) => val + $store.stickerPrices[longName], 0) || 0,
      charms: item.charms?.reduce((val, { longName }) => val + $store.stickerPrices[longName], 0) || 0,
    };
  }, [ item, $store ]);

  return (
    <>
      {/* --- * STICKERS * --- */}
      {
        item.stickers?.length &&
          <>
            <View style={[ templates.row, { justifyContent: 'space-between', marginTop: helpers.resize(12) } ]}>
              <View style={[ templates.row, { gap: helpers.resize(4), alignItems: 'center' } ]}>
                <Text bold style={{ fontSize: helpers.resize(22) }}>Applied stickers</Text>
                <Text bold style={{ fontSize: helpers.resize(28), color: colors.primary }}>|</Text>
                <Text bold style={{ fontSize: helpers.resize(20) }}>{ item.stickers.length }</Text>
              </View>
              <Text bold style={{ fontSize: helpers.resize(24) }}>{ helpers.price({ code: $store.currency.code, rate: 1 }, totalByType.stickers) }</Text>
            </View>
            {
              item.stickers.map(sticker => (
                <View style={[ templates.row, { gap: helpers.resize(12), alignItems: 'center' } ]}>
                  <Image style={styles.stickerImage} source={{ uri: sticker.img }} />
                  <View>
                    <Text style={styles.stickerName}>{ sticker.name }</Text>
                    <Text bold style={styles.stickerPrice}>{ helpers.price($store.currency, $store.stickerPrices[sticker.longName]) }</Text>
                  </View>
                </View>
              ))
            }
          </>
      }

      {/* --- * PATCHES * --- */}
      {
        item.patches?.length &&
          <>
            <View style={[ templates.row, { justifyContent: 'space-between', marginTop: helpers.resize(12) } ]}>
              <View style={[ templates.row, { gap: helpers.resize(4), alignItems: 'center' } ]}>
                <Text bold style={{ fontSize: helpers.resize(22) }}>Applied patches</Text>
                <Text bold style={{ fontSize: helpers.resize(28), color: colors.primary }}>|</Text>
                <Text bold style={{ fontSize: helpers.resize(20) }}>{ item.patches.length }</Text>
              </View>
              <Text bold style={{ fontSize: helpers.resize(24) }}>{ helpers.price({ code: $store.currency.code, rate: 1 }, totalByType.patches) }</Text>
            </View>
            {
              item.patches.map(patch => (
                <View style={[ templates.row, { gap: helpers.resize(12), alignItems: 'center' } ]}>
                  <Image style={styles.stickerImage} source={{ uri: patch.img }} />
                  <View>
                    <Text style={styles.stickerName}>{ patch.name }</Text>
                    <Text bold style={styles.stickerPrice}>{ helpers.price($store.currency, $store.stickerPrices[patch.longName]) }</Text>
                  </View>
                </View>
              ))
            }
          </>
      }

      {/* --- * CHARMS * --- */}
      {
        item.charms?.length &&
          <>
            <View style={[ templates.row, { justifyContent: 'space-between', marginTop: helpers.resize(12) } ]}>
              <View style={[ templates.row, { gap: helpers.resize(4), alignItems: 'center' } ]}>
                <Text bold style={{ fontSize: helpers.resize(22) }}>Applied charms</Text>
                <Text bold style={{ fontSize: helpers.resize(28), color: colors.primary }}>|</Text>
                <Text bold style={{ fontSize: helpers.resize(20) }}>{ item.charms.length }</Text>
              </View>
              <Text bold style={{ fontSize: helpers.resize(24) }}>{ helpers.price({ code: $store.currency.code, rate: 1 }, totalByType.charms) }</Text>
            </View>
            {
              item.charms.map(patch => (
                <View style={[ templates.row, { gap: helpers.resize(12), alignItems: 'center' } ]}>
                  <Image style={styles.stickerImage} source={{ uri: patch.img }} />
                  <View>
                    <Text style={styles.stickerName}>{ patch.name }</Text>
                    <Text bold style={styles.stickerPrice}>{ helpers.price($store.currency, $store.stickerPrices[patch.longName]) }</Text>
                  </View>
                </View>
              ))
            }
          </>
      }
    </>
  );
}
