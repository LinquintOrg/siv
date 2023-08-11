import * as React from 'react';
import { Image, SafeAreaView, View } from 'react-native';
import { colors, global, styles, variables } from '../styles/global';
import { IDisplayItemProps } from '../utils/types';
import Text from './Text';
import { helpers } from '../utils/helpers';
import { Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { useRateState, useRatesState } from '../utils/store';

export default function Item(props: IDisplayItemProps) {
  const { item, stickerPrices } = props;

  const rate = useRateState();
  const rates = useRatesState();

  function price(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return `${r.abb} ${(Math.round(p * 100 * r.exc) * amount / 100).toFixed(2)}`;
  }

  // TODO: fix sticker price calculation. Convert first, then add.
  function stickersValue() {
    let sum = 0;
    if (item!.stickers) {
      item!.stickers.stickers.forEach(sticker => {
        sum += stickerPrices[sticker.long_name].Price || 0;
      });
    }
    return sum;
  }

  function stickersTitle() {
    let str = '';
    if (item && item.stickers) {
      switch (item.stickers.sticker_count) {
      case 1: str = str.concat('One '); break;
      case 2: str = str.concat('Two '); break;
      case 3: str = str.concat('Three '); break;
      case 4: str = str.concat('Four '); break;
      case 5: str = str.concat('Five '); break;
      }
      str = str.concat(item.stickers.type === 'sticker' ? item.stickers.sticker_count > 1 ? 'stickers' : 'sticker' :
        item.stickers.sticker_count > 1 ? 'patches' : 'patch');
      str = str.concat(` worth ${price(stickersValue())}`);
    }
    return str;
  }

  function priceChange(oldPrice: number, currentPrice: number, removeBg = false) {
    if (oldPrice > 0 && currentPrice > 0) {
      if (oldPrice > currentPrice) {
        return (
          <Text bold style={[ styles.inventory.pill, global.pcDecrease, (removeBg ? { backgroundColor: '#ffffff00', width: '33.3%' } : {}) ]}>
            <Text>{ (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(1) }%</Text>
          </Text>
        );
      }
      if (oldPrice < currentPrice) {
        return (
          <Text bold style={[ styles.inventory.pill, global.pcIncrease, (removeBg ? { backgroundColor: '#ffffff00', width: '33.3%' } : {}) ]}>
            <Text>+{ (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(1) }%</Text>
          </Text>
        );
      }
    }
    return (
      <Text bold style={[ styles.inventory.pill, global.pcUnchanged, (removeBg ? { backgroundColor: '#ffffff00', width: '33.3%' } : {}) ]}>
        <Text>0%</Text>
      </Text>
    );
  }

  // TODO: there may be occassions, when stickers may have the same index. Use different indexing.
  if (item) {
    return (
      <SafeAreaView style={[ global.modal, { gap: helpers.resize(8) } ]}>
        <Text bold style={ styles.inventory.itemModalTitle }>{ item.market_name }</Text>
        <View style={[ global.wrapRow, { justifyContent: 'center', alignContent: 'center' } ]}>
          <Text bold style={[ global.subtitle, { alignSelf: 'center' } ]}>{ helpers.inventory.itemType(item) }</Text>
          {
            !!helpers.inventory.getRarity(item.tags) &&
              <Text bold style={[
                styles.inventory.pill, {
                  backgroundColor: helpers.pastelify(helpers.inventory.getRarityColor(item.tags)),
                  color: helpers.pastelify(helpers.inventory.getRarityColor(item.tags), 0),
                },
              ]}
              >
                { helpers.inventory.getRarity(item.tags)?.replace(' Grade', '') }
              </Text>
          }
        </View>

        {
          !(item.marketable || item.tradable) &&
            <View style={[ global.wrapRow, { alignSelf: 'center' } ]}>
              <Icon name={'alert-circle'} type={'feather'} size={variables.iconSize} color={colors.error} />
              <Text style={[ global.subtitle, { color: colors.error } ]}>
                {
                  !item.marketable && !item.tradable ?
                    'Item cannot be sold or traded' : !item.marketable ? 'Item cannot be sold' : 'Item cannot be traded'
                }
              </Text>
            </View>
        }
        { !!item.fraudwarnings && <Text bold>&apos;{ item.fraudwarnings[0].replaceAll('\'', '').replace('Name Tag: ', '') }&apos;</Text> }

        <ScrollView style={[ global.column, { gap: helpers.resize(8) } ]}>
          <Image
            source={{ uri: `https://community.akamai.steamstatic.com/economy/image/${item.icon_url_large || item.icon_url}` }}
            resizeMode={'contain'}
            style={[ styles.inventory.itemImage, { borderColor: `#${helpers.inventory.getRarityColor(item.tags)}` } ]}
          />

          {
            item.stickers &&
              <View
                style={[
                  styles.inventory.stickersSection,
                  { backgroundColor: helpers.transparentize(helpers.inventory.getRarityColor(item.tags), 0.36) },
                ]}
              >
                <Text bold style={[ styles.inventory.itemModalTitle ]}>{ stickersTitle() }</Text>
                {
                  item.stickers.stickers.map(sticker => (
                    <View key={`sticker-${sticker.name}`} style={ global.row }>
                      <Image style={ styles.inventory.stickerImage } source={{ uri: sticker.img }} />
                      <View style={[ global.column, { justifyContent: 'center' } ]}>
                        <Text style={[ global.subtitle, { textAlign: 'left' } ]}>{ sticker.name }</Text>
                        <Text bold style={[ global.subtitle, { textAlign: 'left' } ]}>{ price(stickerPrices[sticker.long_name].Price) }</Text>
                      </View>
                    </View>
                  ))
                }
              </View>
          }

          <Text bold style={ styles.inventory.itemModalTitle }>Price</Text>
          {
            !item.price.found &&
              <View style={[ global.wrapRow, { alignSelf: 'center' } ]}>
                <Icon name={'alert-circle'} type={'feather'} size={variables.iconSize} color={colors.error} />
                <Text style={[ global.subtitle, { color: colors.error } ]}>Price data is missing or item is not marketable</Text>
              </View>
          }
          {
            item.price.found &&
              <View style={[ global.column, { gap: helpers.resize(8) } ]}>
                <Text style={{ textAlign: 'center' }}>Last updated { helpers.timeAgo(item.price.ago) }</Text>

                <View style={[ global.row, { alignSelf: 'center' } ]}>
                  <Text bold style={ global.subtitle }>{ item.price.listed } </Text>
                  <Text style={ global.subtitle }>listings on Steam Market</Text>
                </View>

                <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                  <Text style={[ global.subtitle, { alignSelf: 'center' } ]}><Text bold>{ price(item.price.price) }</Text> x { item.amount }</Text>
                  <Text bold style={[ styles.inventory.itemModalTitle, { marginVertical: 0 } ]}>{ price(item.price.price, item.amount) }</Text>
                </View>

                <Text bold style={ styles.inventory.itemModalTitle }>Price details</Text>

                <View style={ global.column }>
                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    <Text style={[ global.width50, global.subtitle ]}>Min price</Text>
                    <Text style={[ global.width50, global.subtitle ]}>Max price</Text>
                  </View>

                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    <Text bold style={[ global.width50, global.subtitle ]}>{ price(item.price.min) }</Text>
                    <Text bold style={[ global.width50, global.subtitle ]}>{ price(item.price.max) }</Text>
                  </View>
                </View>

                <View style={ global.column }>
                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    <Text style={[ global.width33, global.subtitle ]}>24 hours ago</Text>
                    <Text style={[ global.width33, global.subtitle ]}>30 days ago</Text>
                    <Text style={[ global.width33, global.subtitle ]}>90 days ago</Text>
                  </View>

                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    <Text bold style={[ global.width33, global.subtitle ]}>{ price(item.price.p24ago) }</Text>
                    <Text bold style={[ global.width33, global.subtitle ]}>{ price(item.price.p30ago) }</Text>
                    <Text bold style={[ global.width33, global.subtitle ]}>{ price(item.price.p90ago) }</Text>
                  </View>

                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    { priceChange(item.price.p24ago, item.price.price, true) }
                    { priceChange(item.price.p30ago, item.price.price, true) }
                    { priceChange(item.price.p90ago, item.price.price, true) }
                  </View>
                </View>

                <View style={ global.column }>
                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    <Text style={[ global.width33, global.subtitle ]}>24h average</Text>
                    <Text style={[ global.width33, global.subtitle ]}>7d average</Text>
                    <Text style={[ global.width33, global.subtitle ]}>30d average</Text>
                  </View>

                  <View style={[ global.row, { justifyContent: 'space-evenly' } ]}>
                    <Text bold style={[ global.width33, global.subtitle ]}>{ price(item.price.avg24) }</Text>
                    <Text bold style={[ global.width33, global.subtitle ]}>{ price(item.price.avg7) }</Text>
                    <Text bold style={[ global.width33, global.subtitle ]}>{ price(item.price.avg30) }</Text>
                  </View>
                </View>
              </View>
          }

          <Text style={ styles.inventory.dismissHint }>
            Click outside the modal to dismiss it
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={[ global.modal, { gap: helpers.resize(8) } ]}>
        <Text bold style={ global.subtitle }>No item selected</Text>
        <Text style={ global.subtitle }>Select an item from the list</Text>
      </SafeAreaView>
    );
  }
}
