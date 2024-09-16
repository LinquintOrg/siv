import InventoryLoading from '@/InventoryLoading';
import Text from '@/Text';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { IFilterOptions, IInventories, IInventoryGame, IItem, ISteamProfile } from 'types';
import styles from '@styles/pages/inventory';
import useStore from 'store';
import InventoryFabGroup from '@/InventoryFabGroup';
import Input from '@/Input';
import InventoryItem from '@/InventoryItem';
import { FlashList } from '@shopify/flash-list';

export default function InventoryOverviewPage() {
  const $store = useStore();
  const { id, games } = useGlobalSearchParams();
  const [ user, setUser ] = useState<ISteamProfile | string | null>(null);
  const [ pageInFocus, setPageInFocus ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ inv, setInv ] = useState<IInventories>({});
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ filterOptions ] = useState<IFilterOptions>({
    nonMarketable: false,
  });
  const flashList = useRef<FlashList<IInvMap> | null>(null);

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

  type IInvMap = (({ element: 'header' } & IInventoryGame) | ({ element: 'item' } & IItem));

  const invMap = useMemo<IInvMap[]>(() => {
    const mappedData: IInvMap[] = [];
    Object.entries(inv).forEach(([ appid, inventory ]) => {
      const game = $store.games.find(g => g.appid === appid)!;
      mappedData.push({ element: 'header', ...game });
      for (const item of inventory) {
        if (helpers.inv.isVisible(item, searchQuery, filterOptions)) {
          mappedData.push({ element: 'item', ...item });
        }
      }
    });
    return mappedData;
  }, [ $store.games, filterOptions, inv, searchQuery ]);

  const stickyHeaderIndices = useMemo(
    () => invMap.map(({ element }, id) => element === 'header' ? id : null).filter(id => id !== null),
    [ invMap ],
  );

  function setInventory(inventory: IInventories) {
    setInv(inventory);
    setLoading(false);
    $store.setInventory(inventory);
  }

  function navigateToItem(item: IItem) {
    router.push(`/inventory/item/${item.classid}-${item.instanceid}`);
  }

  function scrollToIndex(index: number) {
    if (flashList?.current) {
      flashList.current.scrollToIndex({ index, animated: true });
    }
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
          && <InventoryLoading profile={user} games={selectedGames} setInventory={setInventory} />
      }
      {
        !loading && !!Object.keys(inv).length &&
          <>
            {
              pageInFocus && <InventoryFabGroup />
            }
            {
              pageInFocus && <Input label='Search' onChange={setSearchQuery} value={searchQuery} icon={{ name: 'search', type: 'feather' }} />
            }
            <FlashList
              ref={flashList}
              data={invMap}
              renderItem={({ item, index }) => {
                if (item.element === 'header') {
                  return (
                    <Pressable style={styles.game} onPress={() => scrollToIndex(index)}>
                      <Image source={{ uri: item!.img }} style={styles.gameIcon} />
                      <Text bold style={styles.gameTitle}>{ item?.name || 'Game Title' }</Text>
                    </Pressable>
                  );
                }
                const { element, ...restData } = item;
                return <InventoryItem item={restData} idx={index} navigateToItem={navigateToItem} />;
              }}
              stickyHeaderIndices={stickyHeaderIndices}
              estimatedItemSize={helpers.resize(120)}
            />
          </>
      }
    </>
  );
}
