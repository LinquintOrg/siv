import { View } from 'react-native';
import { templates } from 'styles/global';
import { IInventories, IInventoryGame, IItemStickers, ISteamInventoryRes, ISteamProfile } from 'types';
import Profile from './Profile';
import Loader from './Loader';
import { useEffect, useState } from 'react';
import api from '@utils/api';
import { helpers } from '@utils/helpers';
import useStore from 'store';

interface IInventoryLoadingProps {
  profile: ISteamProfile;
  games: IInventoryGame[];
  setInventory: (inventory: IInventories) => void;
}

export default function InventoryLoading(props: IInventoryLoadingProps) {
  const $api = new api();
  const $store = useStore();
  const { profile, games, setInventory } = props;
  const [ loadingMsg, setLoadingMsg ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ inventoryRes ] = useState<{ [appid: number]: ISteamInventoryRes }>({});

  useEffect(() => {
    async function prepare() {
      setLoading(true);
      if (__DEV__) {
        setLoadingMsg('Loading Counter Strike 2 inventory');
        const invRes = await $api.devInventory();
        inventoryRes[730] = invRes;
      } else {
        for (const game of games) {
          setLoadingMsg(`Loading ${game.name} inventory`);
          // TODO: call api
          await helpers.sleep(1000);
        }
      }

      setLoadingMsg('Loading prices');
      const data = Object.entries(inventoryRes).map<{ appid: number; items: string[] }>(([ appid, inv ]) => ({
        appid: +appid,
        items: inv.descriptions.filter(desc => desc.marketable).map(desc => desc.market_hash_name),
      }));
      const stickersToLoad: string[] = [];
      const pricesRes = await $api.getPrices({ data });
      const finalItems: IInventories = {};
      for (const [ appid, inv ] of Object.entries(inventoryRes)) {
        const prices = pricesRes[appid];
        finalItems[appid] = [];
        for (const item of inv.descriptions) {
          const price = prices[item.market_hash_name];
          const stickers: IItemStickers | undefined = appid !== '730' ? undefined : helpers.inv.findStickers(item.descriptions);
          stickers?.items.forEach(sticker => {
            if (!stickersToLoad.includes(sticker.longName) && !(sticker.longName in $store.stickerPrices)) {
              stickersToLoad.push(sticker.longName);
            }
          });
          finalItems[appid].push({
            ...item,
            amount: helpers.inv.itemCount(inv.assets, item.classid, item.instanceid),
            price: {
              ...(price || { found: false }),
              difference: price ? helpers.inv.priceDiff(price) : 0,
            },
            stickers,
          });
        }
      }

      if (stickersToLoad.length > 0) {
        setLoadingMsg('Loading stickers and patches');
        const stickerPricesRes = await $api.getStickerPrices(stickersToLoad);
        Object.entries(stickerPricesRes).map(([ name, { price } ]) => $store.stickerPrices[name] = price);
      }
      setInventory(finalItems);
    }

    if (!loading) {
      prepare();
    }
  });

  return (
    <View style={[ templates.column, templates.fullHeight, templates.justifyCenter ]}>
      <Profile profile={profile} nonClickable />
      <Loader text={loadingMsg} size={'large'} />
    </View>
  );
}
