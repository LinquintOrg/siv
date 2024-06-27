import InventoryLoading from '@/InventoryLoading';
import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { IExchangeRate, IInventories, IInventoryGame, IItem, ISteamProfile } from 'types';
import styles from '@styles/pages/inventory';
import { global, templates } from 'styles/global';
import * as SQLite from 'expo-sqlite';
import useStore from 'store';

export default function InventoryOverviewPage() {
  const store = useStore();
  const { id, games } = useGlobalSearchParams();
  const [ user, setUser ] = useState<ISteamProfile | string | null>(null);
  const [ pageInFocus, setPageInFocus ] = useState(false);
  const [ gamesList, setGamesList ] = useState<IInventoryGame[]>([]);
  const [ rate, setRate ] = useState<IExchangeRate>({ code: 'USD', rate: 1 });
  const [ loading, setLoading ] = useState(false);
  const [ inv, setInv ] = useState<IInventories>({});
  const [ filterOptions ] = useState({
    nonMarketable: false,
  });

  useFocusEffect(
    useCallback(() => {
      setPageInFocus(true);
      return () => {
        setPageInFocus(false);
      };
    }, []),
  );

  SQLite.addDatabaseChangeListener(async newSql => {
    if (newSql.tableName === 'Settings') {
      const newRate = await sql.getOneRate();
      setRate(newRate);
    }
  });

  useEffect(() => {
    async function prepare() {
      if (!id) {
        return;
      }

      try {
        const list = await sql.getInventoryGames();
        setGamesList(list);
        const userById = await sql.getOneProfile(id as string);
        if (userById) {
          setUser(userById);
        } else {
          setUser(id as string);
        }
        const r = await sql.getOneRate();
        if (r) {
          setRate(r);
        }
        setLoading(true);
      } catch (err) {
        console.error(err);
      }
    }
    if (pageInFocus && !user) {
      prepare();
    }
  }, [ pageInFocus, user, id ]);

  const selectedGames = useMemo(
    () => (games as string || '').split(',').map(app => gamesList.find(game => game.appid === +app)!),
    [ games, gamesList ],
  );

  const invMap = useMemo(
    () => Object.entries(inv).map(([ appid, inventory ]) => ({
      game: gamesList.find(g => g.appid === +appid),
      items: inventory.filter(i => filterOptions.nonMarketable || i.marketable),
    })),
    [ inv, gamesList, filterOptions ],
  );

  function setInventory(inventory: IInventories) {
    setInv(inventory);
    setLoading(false);
    store.setInventory(inventory);
  }

  function navigateToItem(item: IItem) {
    router.push(`/inventory/item/${item.classid}-${item.instanceid}`);
  }

  return (
    <>
      <View>
        { loading && user && typeof user !== 'string' && <InventoryLoading profile={user} games={selectedGames} setInventory={setInventory} /> }
        {
          !loading && !!Object.keys(inv).length &&
          <ScrollView>
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
                        <View style={[ templates.column, { width: helpers.resize(290), justifyContent: 'space-between', minHeight: helpers.resize(100) } ]}>
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
                              <Text bold style={styles.itemPrice}>{ helpers.price(rate, item.price.price || 0) }</Text>
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
                                <Text bold style={styles.itemPrice}>{ helpers.price(rate, item.price.price || 0, item.amount) }</Text>
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
