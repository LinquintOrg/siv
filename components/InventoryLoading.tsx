import { View } from 'react-native';
import { templates } from 'styles/global';
import { IInventories, IInventoryGame, ISteamInventoryRes, ISteamProfile } from 'types';
import Profile from './Profile';
import Loader from './Loader';
import { useEffect, useState } from 'react';
import api from '@utils/api';
import { helpers } from '@utils/helpers';

interface IInventoryLoadingProps {
  profile: ISteamProfile;
  games: IInventoryGame[];
  setInventory: (inventory: IInventories) => void;
}

export default function InventoryLoading(props: IInventoryLoadingProps) {
  const $api = new api();
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
      const pricesRes = await $api.getPrices({ data });
      const finalItems: IInventories = {};
      for (const [ appid, inv ] of Object.entries(inventoryRes)) {
        const prices = pricesRes[appid];
        finalItems[appid] = [];
        for (const item of inv.descriptions) {
          const price = prices[item.market_hash_name];
          finalItems[appid].push({
            ...item,
            amount: helpers.inv.itemCount(inv.assets, item.classid, item.instanceid),
            price: {
              ...(price || { found: false }),
              difference: price ? helpers.inv.priceDiff(price) : 0,
            },
          });
        }
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
