import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { useGlobalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Image, ScrollView, View } from 'react-native';
import useStore from 'store';
import styles from '@styles/pages/item';
import { global, templates } from '@styles/global';

export default function InventoryItemPage() {
  const store = useStore();
  const { item: itemId } = useGlobalSearchParams();

  const item = useMemo(
    () => {
      const flatItems = Object.values(helpers.clone(store.inventory)).flatMap(itms => itms);
      return flatItems.find(i => `${i.classid}-${i.instanceid}` === itemId);
    },
    [ store, itemId ],
  );

  const game = useMemo(
    () => {
      if (!item) {
        return undefined;
      }
      return store.games.find(g => +g.appid === item.appid);
    },
    [ store, item ],
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
            { collection && <Text bold>{ collection }</Text> }
            <View style={templates.row}>
              <Text bold style={global.title}>Price</Text>
              { item.price.found && <Text bold>{ helpers.price({ code: 'EUR', rate: 0.94 }, item.price.price) }</Text>}
            </View>
            { !item.price.found && <Text bold>Not found.</Text> }
            {
              item.price.found &&
              <View>

              </View>
            }
          </View>
        }
        <Text bold>GAME</Text>
        <Text>{ JSON.stringify(game || 'none', null, 2) }</Text>
        <Text bold>ITEM</Text>
        <Text>{ JSON.stringify(item, null, 2) }</Text>
        <Text bold>STICKER PRICES</Text>
        <Text>{ JSON.stringify(store.stickerPrices, null, 2) }</Text>
      </ScrollView>
    </>
  );
}
