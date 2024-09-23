import { View } from 'react-native';
import { templates } from 'styles/global';
import { IInventories, IInventoryGame, IItemStickers, ISteamInventoryRes, ISteamProfile } from 'types';
import Profile from './Profile';
import Loader from './Loader';
import { useEffect, useState } from 'react';
import api from '@utils/api';
import { helpers } from '@utils/helpers';
import useStore from 'store';
import Text from './Text';
import Button from './Button';

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
  const [ errored, setErrored ] = useState(false);

  const getTimeoutLength = () => {
    if (games.length < 3) {
      return 1500;
    }
    if (games.length < 4) {
      return 7500;
    }
    if (games.length < 5) {
      return 12500;
    }
    return 16000;
  };

  function setInvLoading(isLoading: boolean) {
    setLoading(isLoading);
    $store.setIsInventoryLoading(isLoading);
  }

  async function prepare() {
    try {
      $store.setCurrentProfile(profile);
      setInvLoading(true);
      if (__DEV__) {
        setLoadingMsg('Loading Counter Strike 2 inventory');
        const invRes = await $api.devInventory();
        inventoryRes[730] = invRes;
      } else {
        for (const game of games) {
          setLoadingMsg(`Loading ${game.name} inventory`);
          const invRes = await $api.getInventory(profile.id, game.appid);
          inventoryRes[+(game.appid)] = invRes;
          const timeoutLen = getTimeoutLength();
          await helpers.sleep(timeoutLen);
        }
      }

      setLoadingMsg('Loading prices');
      const data = Object.entries(inventoryRes).map<{ appid: number; items: string[] }>(([ appid, inv ]) => ({
        appid: +appid,
        items: (inv.descriptions || []).filter(desc => desc.marketable).map(desc => desc.market_hash_name),
      }));
      const stickersToLoad: string[] = [];
      const pricesRes = await $api.getPrices({ data });
      const finalItems: IInventories = {};
      for (const [ appid, inv ] of Object.entries(inventoryRes)) {
        const prices = pricesRes[appid];
        finalItems[appid] = [];
        for (const item of (inv.descriptions || [])) {
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
              difference: price ? helpers.inv.priceDiff(price) : {
                day: { percent: 0, amount: 0 },
                month: { percent: 0, amount: 0 },
                threeMonths: { percent: 0, amount: 0 },
                year: { percent: 0, amount: 0 },
              },
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
      const summary = helpers.inv.generateSummary(profile, finalItems, games, $store.currency, $store.stickerPrices);
      $store.setSummary(summary);
      setInvLoading(false);
    } catch (err: any) {
      setErrored(true);
      throw new Error(err.message);
    }
  }

  useEffect(() => {
    if (!loading && profile && games.length && !errored) {
      prepare();
    }
  });

  function retryLoading() {
    setErrored(false);
    prepare();
  }

  return (
    <View style={[ templates.column, templates.fullHeight, templates.justifyCenter ]}>
      <Profile profile={profile} nonClickable />
      { !errored && <Loader text={loadingMsg} size={'large'} /> }
      {
        errored &&
          <View style={[ templates.column ]}>
            <Text bold>Error occurred!</Text>
            <Button onPress={retryLoading} text='Retry' />
          </View>
      }
    </View>
  );
}
