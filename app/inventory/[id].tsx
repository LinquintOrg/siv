import InventoryLoading from '@/InventoryLoading';
import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { IInventories, IItem, ISteamProfile } from 'types';
import styles from '@styles/pages/inventory';
import { global, templates } from 'styles/global';
import useStore from 'store';

export default function InventoryOverviewPage() {
  const $store = useStore();
  const { id, games } = useGlobalSearchParams();
  const [ user, setUser ] = useState<ISteamProfile | string | null>(null);
  const [ pageInFocus, setPageInFocus ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ inv, setInv ] = useState<IInventories>({});
  const [ filterOptions ] = useState({
    nonMarketable: false,
  });

  const selectedGames = useMemo(
    () => (games as string || '').split(',').map(app => $store.games.find(game => game.appid === app)!),
    [ games, $store ],
  );

  useEffect(() => {
    async function prepare() {
      if (!id) {
        return;
      }

      const userById = await sql.getOneProfile(id as string);
      if (userById) {
        setUser(userById);
      } else {
        setUser(id as string);
      }
      setLoading(true);
    }

    if (pageInFocus) {
      const invGames = Object.keys(inv);
      const haveGamesChanged = invGames.some(id => selectedGames.findIndex(sg => sg.appid === id) === -1);

      console.log('invGames', invGames.length, JSON.stringify(invGames));
      console.log('selectedGames', selectedGames.length, JSON.stringify(selectedGames));
      console.log(invGames.some(id => selectedGames.findIndex(sg => sg.appid === id) === -1));

      if (!user || (!loading && (invGames.length !== selectedGames.length || haveGamesChanged))) {

        console.warn('PREPARE CALLED');

        prepare();
      }
    }
  }, [ pageInFocus, user, id, selectedGames, inv, loading ]);

  const invMap = useMemo(
    () => Object.entries(inv).map(([ appid, inventory ]) => ({
      game: $store.games.find(g => g.appid === appid),
      items: inventory.filter(i => filterOptions.nonMarketable || i.marketable),
    })),
    [ inv, $store, filterOptions ],
  );

  function setInventory(inventory: IInventories) {
    setInv(inventory);
    setLoading(false);
    $store.setInventory(inventory);
  }

  function navigateToItem(item: IItem) {
    router.push(`/inventory/item/${item.classid}-${item.instanceid}`);
  }

  useFocusEffect(
    useCallback(() => {
      setPageInFocus(true);
      if ($store.currency.code !== $store.summary?.currency.code) {
        const summary = helpers.inv.generateSummary(user as ISteamProfile, inv, selectedGames, $store.currency, $store.stickerPrices);
        $store.setSummary(summary);
      }
      return () => {
        setPageInFocus(false);
      };
    }, [ $store, inv, user, selectedGames ]),
  );

  return (
    <>
      <View>
        {
          loading && user && typeof user !== 'string' && selectedGames?.length
            && <InventoryLoading profile={user} games={selectedGames} setInventory={setInventory}/>
        }
        {
          !loading && !!Object.keys(inv).length &&
          <ScrollView>
            <Text style={{ fontSize: helpers.resize(10), color: '#fff' }}>{ JSON.stringify($store.summary, null, 2) }</Text>
            {
              invMap.map(({ game, items }) => (
                <>
                  <View style={styles.game}>
                    <Image source={{ uri: game!.img }} style={styles.gameIcon} />
                    <Text bold style={styles.gameTitle}>{ game?.name || 'Zaidimas' }</Text>
                  </View>
                  {
                    items.map(item => (
                      <Pressable style={styles.item} onPress={() => navigateToItem(item)}>
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
                                    styles.itemPriceInfo, item.price.difference < 0 ? styles.loss : item.price.difference > 0 ? styles.profit:styles.samePrice,
                                  ]}>
                                    {item.price.difference > 0 ? '+' : ''}{ item.price.difference.toFixed(1) }%
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
                                  styles.itemPriceInfo, item.price.difference < 0 ? styles.loss : item.price.difference > 0 ? styles.profit : styles.samePrice,
                                ]}>
                                  {item.price.difference > 0 ? '+' : ''}{ item.price.difference.toFixed(1) }%
                                </Text>
                                <Text bold style={styles.itemPrice}>{ helpers.price($store.currency, item.price.price || 0, item.amount) }</Text>
                              </View>
                            }
                          </View>
                        </View>
                      </Pressable>
                    ))
                  }
                </>
              ))
            }
          </ScrollView>
        }
      </View>
    </>
  );
}
