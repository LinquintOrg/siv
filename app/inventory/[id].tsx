import InventoryLoading from '@/InventoryLoading';
import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { IInventories, IItem, ISteamProfile } from 'types';
import styles from '@styles/pages/inventory';
import useStore from 'store';
import InventoryFabGroup from '@/InventoryFabGroup';
import Input from '@/Input';
import InventoryItem from '@/InventoryItem';

export default function InventoryOverviewPage() {
  const $store = useStore();
  const { id, games } = useGlobalSearchParams();
  const [ user, setUser ] = useState<ISteamProfile | string | null>(null);
  const [ pageInFocus, setPageInFocus ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ inv, setInv ] = useState<IInventories>({});
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ filterOptions ] = useState({
    search: '',
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
      if (!user || (!loading && (invGames.length !== selectedGames.length || haveGamesChanged))) {
        prepare();
      }
    }
  }, [ pageInFocus, user, id, selectedGames, inv, loading ]);

  const invMap = useMemo(
    () => Object.entries(inv).map(([ appid, inventory ]) => ({
      game: $store.games.find(g => g.appid === appid),
      items: (inventory || []).filter(i => (filterOptions.nonMarketable || i.marketable) && helpers.search(i.market_hash_name, searchQuery)),
    })),
    [ inv, $store, filterOptions, searchQuery ],
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
      if ($store.currency.code !== $store.summary?.currency.code || (user && typeof user !== 'string' && user?.id !== $store.summary.profile?.id)) {
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
      {
        loading && user && typeof user !== 'string' && selectedGames?.length
            && <InventoryLoading profile={user} games={selectedGames} setInventory={setInventory}/>
      }
      {
        !loading && !!Object.keys(inv).length &&
          <>
            {
              pageInFocus && <InventoryFabGroup />
                && <Input label='Search' onChange={setSearchQuery} value={searchQuery} icon={{ name: 'search', type: 'feather' }} />
            }
            <ScrollView>
              {
                invMap.map(({ game, items }) => (
                  <>
                    <View style={styles.game}>
                      <Image source={{ uri: game!.img }} style={styles.gameIcon} />
                      <Text bold style={styles.gameTitle}>{ game?.name || 'Game Title' }</Text>
                    </View>
                    {
                      items.map((item, idx) => (
                        <InventoryItem item={item} idx={idx} navigateToItem={navigateToItem} key={`item-${idx}`} />
                      ))
                    }
                  </>
                ))
              }
            </ScrollView>
          </>
      }
    </>
  );
}
