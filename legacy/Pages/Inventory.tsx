import { Dimensions, Image, Platform, Pressable, SafeAreaView, TouchableOpacity, UIManager, View, SectionList,
  NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import gamesJson from '../assets/inv-games.json';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { Snackbar, AnimatedFAB } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Text from '../components/Text';
import Modal from 'react-native-modal';
import cloneDeep from 'lodash';
import { TextInput } from 'react-native-paper';
// import ActionList from '../Elements/actionList';
import Summary from '../components/Summary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { IGameExtended, IGameStatistic, IInventory, IInventoryBase, IInventoryGame, IInventoryItem, IInventoryOmittedItem, IInventoryOmittedItemAmount,
  IInventoryPageProps, IInventoryResponse, IInventoryStats, IPrice, IPricesResponse } from '../utils/types';
import { useProfilesState, useRateState, useRatesState } from '../utils/store';
import { helpers } from '@utils/helpers';
import Loader from '../components/Loader';
import { colors, global, styles, variables } from '../styles/global';
import Item from '../components/Item';
import { Icon } from 'react-native-elements';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/*
 *  Props:
 *      steam - SteamID64 of the selected user
 *      rate - exchange rate ID
 *      rates - exchange rates array
 *      games - array of selected games
 */

export default function Inventory(props: IInventoryPageProps) {
  const { route } = props;
  const rate = useRateState();
  const rates = useRatesState();
  const profiles = useProfilesState();
  const gamesList = (gamesJson as { games: IInventoryGame[] }).games;
  const DEV_INV = 'https://inventory.linquint.dev/api/Steam/dev/inv730.php';
  const steamID = route.params.steamId;
  const games = route.params.games;

  const [ errorText, setErrorText ] = useState('');
  const [ successText, setSuccessText ] = useState('');
  const [ errorSnack, setErrorSnack ] = useState(false);
  const [ successSnack, setSuccessSnack ] = useState(false);

  const [ loaded, setLoaded ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ search, setSearch ] = useState('');
  const [ baseInventory ] = useState<IInventoryBase>({});
  const [ stickerPrices, setStickerPrices ] = useState<{ [hash: string]: { Price: number } }>({});
  const [ inventory, setInventory ] = useState<IInventory>({});
  const [ renderableInventory, setRenderableInventory ] = useState<{ game: IGameExtended, data: IInventoryItem[] }[]>([]);
  const [ stats ] = useState<IInventoryStats>({
    steamID,
    price: 0,
    owned: 0,
    ownedTradeable: 0,
    avg24: 0,
    avg7: 0,
    avg30: 0,
    p24ago: 0,
    p30ago: 0,
    p90ago: 0,
    missingPrices: 0,
    cheapest: {
      name: '',
      price: 99999,
    },
    expensive: {
      name: '',
      price: 0,
    },
    games: [],
  });

  function convertPrice(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return (Math.round(p * 100 * r.exc) * amount / 100);
  }

  function price(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return `${r.abb} ${convertPrice(p, amount).toFixed(2)}`;
  }

  useEffect(() => {
    async function loadInventory() {
      const internetConnection = await NetInfo.fetch();
      if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
        setErrorText('No internet connection');
        setErrorSnack(true);
        await helpers.waitUntil(() => !!internetConnection.isInternetReachable && internetConnection.isConnected, 40);
        setErrorSnack(false);
        setSuccessSnack(true);
        setSuccessText('Connected to the internet');
        setTimeout(() => {
          setSuccessSnack(false);
        }, 3000);
      }

      try {
        setLoading(true);
        setLoaded(false);
        games.every(async (game, index) => {
          const url = __DEV__ ? DEV_INV :
            `https://steamcommunity.com/inventory/${steamID}/${game.appid}/${(game.appid === 238960)?steamID:(game.appid===264710)?1847277:2}/?count=1000`;
          const gameInventoryRes = await fetch(url);
          const gameInventoryFull = await gameInventoryRes.json() as IInventoryResponse;
          if (gameInventoryFull.success && gameInventoryFull.total_inventory_count > 0) {
            const gameInventory: IInventoryOmittedItemAmount[] = gameInventoryFull.descriptions.map(item => {
              return {
                ...item as unknown as IInventoryOmittedItem,
                amount: helpers.countItems(item.classid, item.instanceid, gameInventoryFull.assets),
              };
            });
            baseInventory[game.appid] = { count: gameInventory.length, items: gameInventory };
          }
          if (index < games.length - 1) {
            await helpers.sleep(3000);
          }
        });

        await helpers.sleep(1000);
        const invObj = await getInventoryPrices();
        generateStatistics(invObj);
        createRenderable(invObj);
      } catch (err) {
        setErrorText((err as Error).message);
        setErrorSnack(true);
      } finally {
        setLoading(false);
      }
    }

    void loadInventory();
  }, []);

  async function getInventoryPrices() {
    const itemsToLoad: { appid: number; items: string[] }[] = [];
    const stickersToLoad: string[] = [];

    // Map games and items that will be loaded, if CSGO, map stickers aswell
    games.forEach(game => {
      if (baseInventory[game.appid].count > 0) {
        const gameToLoad: { appid: number; items: string[] } = { appid: game.appid, items: [] };
        baseInventory[game.appid].items.forEach(item => {
          if (item.marketable) {
            gameToLoad.items.push(item.market_name);
          }
          if (game.appid === 730) {
            const stickers = helpers.findStickers(item.descriptions);
            if (stickers) {
              stickers.stickers.filter(s => !stickersToLoad.includes(s.long_name)).forEach(s => {
                if (!stickersToLoad.includes(s.long_name)) {
                  stickersToLoad.push(s.long_name);
                }
              });
            }
          }
        });
        itemsToLoad.push(gameToLoad);
      }
    });

    // Get prices for all items and stickers if CSGO is selected
    const data = itemsToLoad.map(i => ({ appid: String(i.appid), items: i.items.join('/') }));
    const reqOptions = {
      method: 'POST',
      body: JSON.stringify({ data }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    };

    // TODO: Create a proper back-end POST method endpoint to load sticker / patch prices
    const promises: Promise<Response>[] = [ fetch('https://inventory.linquint.dev/api/Steam/v3/all_prices.php', reqOptions) ];
    if (stickersToLoad.length > 0) {
      promises.push(fetch(`https://inventory.linquint.dev/api/Steam/v3/stickers.php?hashes=${stickersToLoad.join(',')}`));
    }

    const [ pricesRes, stickersRes ] = await Promise.all(promises);
    const pricesObj = await pricesRes.json() as IPricesResponse;
    if (stickersRes) {
      setStickerPrices(await stickersRes.json() as { [hash: string]: { Price: number } });
    }

    // Map prices and stickers (if applicable) to inventory
    const inv: IInventory = {};
    Object.keys(baseInventory).forEach(appidAsStr => {
      const appid = parseInt(appidAsStr);
      inv[appid] = { count: baseInventory[appid].count, items: [] as IInventoryItem[] };
      baseInventory[appid].items.forEach(baseItem => {

        const priceObj = pricesObj[appidAsStr][baseItem.market_name];
        const price: IPrice = baseItem.marketable && priceObj && priceObj.found !== undefined && priceObj.found ? priceObj as IPrice : {
          ago: 0, avg24: 0, avg7: 0, avg30: 0, found: false, price: 0, listed: 0, max: 0, min: 0, p24ago: 0, p30ago: 0, p90ago: 0,
        };
        const item: IInventoryItem = {
          ...baseItem,
          price,
        };
        if (appid === 730) {
          const stickers = helpers.findStickers(baseItem.descriptions);
          if (stickers) {
            item.stickers = stickers;
          }
        }
        inv[appid].items.push(item);
      });
    });
    setInventory(inv);
    return inv;
  }

  function generateStatistics(inv: IInventory) {
    stats.cheapest = { name: '', price: 99999 };
    stats.expensive = { name: '', price: -1 };
    stats.games.length = 0;
    Object.keys(stats).forEach(key => {
      if (typeof stats[key as keyof IInventoryStats] === 'number') {
        (stats as unknown as { [key: string]: unknown })[key] = 0;
      }
    });

    Object.keys(inv).forEach(appid => {
      const game = gamesList.find(g => String(g.appid) === appid);
      if (!game) {
        throw new Error(`Could not find game with appid ${appid}`);
      }

      const data = inv[parseInt(appid, 10)].items;
      if (!data) {
        throw new Error(`Could not find items for game with appid ${appid}`);
      }

      const gameStats: IGameStatistic = {
        game,
        price: 0,
        owned: 0,
        ownedTradeable: 0,
        avg24: 0,
        avg7: 0,
        avg30: 0,
        p24ago: 0,
        p30ago: 0,
        p90ago: 0,
        missingPrices: 0,
        cheapest: {
          name: '',
          price: 99999,
        },
        expensive: {
          name: '',
          price: -1,
        },
        stickersVal: 0,
        patchesVal: 0,
      };
      data.forEach(item => {
        if (item.price.found) {
          stats.price += convertPrice(item.price.price, item.amount);
          gameStats.price += convertPrice(item.price.price, item.amount);
          if (item.marketable > 0) {
            stats.ownedTradeable += item.amount;
            gameStats.ownedTradeable += item.amount;
          }
          stats.avg24 += convertPrice(item.price.avg24, item.amount);
          gameStats.avg24 += convertPrice(item.price.avg24, item.amount);
          stats.avg7 += convertPrice(item.price.avg7, item.amount);
          gameStats.avg7 += convertPrice(item.price.avg7, item.amount);
          stats.avg30 += convertPrice(item.price.avg30, item.amount);
          gameStats.avg30 += convertPrice(item.price.avg30, item.amount);
          stats.p24ago += convertPrice(item.price.p24ago, item.amount);
          gameStats.p24ago += convertPrice(item.price.p24ago, item.amount);
          stats.p30ago += convertPrice(item.price.p30ago, item.amount);
          gameStats.p30ago += convertPrice(item.price.p30ago, item.amount);
          stats.p90ago += convertPrice(item.price.p90ago, item.amount);
          gameStats.p90ago += convertPrice(item.price.p90ago, item.amount);
          if (item.price.price < gameStats.cheapest.price) {
            stats.cheapest = { price: convertPrice(item.price.price), name: item.market_name };
            gameStats.cheapest = { price: convertPrice(item.price.price), name: item.market_name };
          }
          if (item.price.price > gameStats.expensive.price) {
            stats.expensive = { price: convertPrice(item.price.price), name: item.market_name };
            gameStats.expensive = { price: convertPrice(item.price.price), name: item.market_name };
          }
        } else if (item.marketable) {
          stats.missingPrices += item.amount;
          gameStats.missingPrices += item.amount;
        }

        if (item.stickers) {
          if (item.stickers.type === 'sticker') {
            gameStats.stickersVal! += helpers.inventory.appliedValue(rates.getOne(rate.get()).exc, item.stickers, stickerPrices);
          }
          if (item.stickers.type === 'patch') {
            gameStats.patchesVal! += helpers.inventory.appliedValue(rates.getOne(rate.get()).exc, item.stickers, stickerPrices);
          }
        }

        stats.owned += item.amount;
        gameStats.owned += item.amount;
      });
      stats.games.push(gameStats);
    });
  }

  function createRenderable(inv: IInventory) {
    Object.keys(inv).forEach(appid => {
      const gameData = gamesList.find(g => String(g.appid) === appid);
      if (!gameData) {
        throw new Error(`Could not find game with appid ${appid}`);
      }

      const data = inv[parseInt(appid, 10)].items;
      if (!data) {
        throw new Error(`Could not find items for game with appid ${appid}`);
      }
      const game: IGameExtended = { ...gameData, items: data.length, price: helpers.inventory.gameItemsPrice(data) };
      setRenderableInventory([ ...renderableInventory, { game, data } ]);
      setLoaded(true);
    });
  }

  function recreateRenderable(inv: IInventory) {
    const newRenderable: { game: IGameExtended; data: IInventoryItem[] }[] = [];
    Object.keys(inv).forEach(appid => {
      const gameData = gamesList.find(g => String(g.appid) === appid);
      if (!gameData) {
        setErrorText(`Could not find game with appid ${appid}`);
        setErrorSnack(true);
        return;
      }

      const data = inv[parseInt(appid, 10)].items;
      if (!data) {
        setErrorText(`Could not find items for game with appid ${appid}`);
        setErrorSnack(true);
        return;
      }
      const game: IGameExtended = { ...gameData, items: data.length, price: helpers.inventory.gameItemsPrice(data) };
      newRenderable.push({ game, data });
    });
    setRenderableInventory(newRenderable);
  }

  const scrollRef = useRef<SectionList>(null);
  const sheetRef = React.createRef<BottomSheetMethods>();
  const [ isExpanded, setIsExpanded ] = useState(true);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollPosition = Math.floor(e.nativeEvent.contentOffset.y) ?? 0;
    setIsExpanded(currentScrollPosition <= 0);
  };

  const [ filterVisible, setFilterVisible ] = useState(false);
  const [ orderVisible, setOrderVisible ] = useState(false);
  const [ itemVisible, setItemVisible ] = useState(false);
  const [ modalItem, setModalItem ] = useState<IInventoryItem>();

  const [ sortBy, setSortBy ] = useState(0);
  const [ sortOrder, setSortOrder ] = useState(0);
  const [ sortUsePercent, setSortUsePercent ] = useState(false);

  const [ renderUnsellable, setRenderUnsellable ] = useState(false);
  const [ renderNameTag, setRenderNameTag ] = useState(false);
  const [ renderAppliedSticker, setRenderAppliedSticker ] = useState(false);

  const changeSortUsePercentage = (perc: boolean) => {
    setSortUsePercent(perc);
    changeSortBy(sortBy, true, perc);
  };

  const changeSortBy = (sort: number, force = false, percentages?: boolean) => {
    if (force || sort !== sortBy) {
      const usePercent = typeof percentages === 'undefined' ? sortUsePercent : percentages;
      setSortBy(sort);
      const tmpInventory = cloneDeep(inventory).value();

      Object.values(tmpInventory).forEach((game: { count: number; items: IInventoryItem[] }) => {
        if (sort === 1) {
          game.items.sort((a, b) => {
            return (b.name < a.name) ? 1 : -1;
          });
        }

        if (sort === 2) {
          game.items.sort((a, b) => {
            if (a.price.found && b.price.found) return b.price.price - a.price.price;
            if (!a.price.found && !b.price.found) return 0;
            if (!a.price.found) return 1;
            else return -1;
          });
        }

        if (sort === 3) {
          game.items.sort((a, b) => {
            if (a.price.found && b.price.found) return b.price.price * b.amount - a.price.price * a.amount;
            if (!a.price.found && !b.price.found) return 0;
            if (!a.price.found) return 1;
            else return -1;
          });
        }

        if (sort === 4) {
          game.items.sort((a, b) => {
            if (a.price.found && b.price.found) {
              if (usePercent) return (b.price.price / b.price.p24ago - a.price.price / a.price.p24ago);
              return (b.price.price - b.price.p24ago) - (a.price.price - a.price.p24ago);
            }
            if (!a.price.found && !b.price.found) return 0;
            if (!a.price.found) return 1;
            else return -1;
          });
        }

        if (sort === 5) {
          game.items.sort((a, b) => {
            if (a.price.found && b.price.found) {
              if (!a.price.p30ago || !b.price.p30ago) {
                return 0;
              }
              if (usePercent) return (b.price.price / b.price.p30ago - a.price.price / a.price.p30ago);
              return (b.price.price - b.price.p30ago) - (a.price.price - a.price.p30ago);
            }
            if (!a.price.found && !b.price.found) return 0;
            if (!a.price.found) return 1;
            else return -1;
          });
        }

        if (sortOrder === 1){
          game.items.reverse();
        }
      });

      recreateRenderable(tmpInventory);
    }
  };

  const changeSortOrder = (order: number) => {
    if (order !== sortOrder) {
      setSortOrder(order);
      const tmpInventory = cloneDeep(inventory).value();
      Object.values(tmpInventory).forEach((game: { count: number; items: IInventoryItem[] }) => {
        game.items.reverse();
      });
      recreateRenderable(tmpInventory);
    }
  };

  function displayItem(item: IInventoryItem) {
    let render = item.tradable === 1 || item.marketable === 1;
    let renderSearch = true;

    if (search !== '') {
      const searchTerm = search.toLowerCase();
      renderSearch = item.name.toLowerCase().includes(searchTerm) || item.type.toLowerCase().includes(searchTerm) ||
        (item.fraudwarnings && item.fraudwarnings[0].toLowerCase().includes(searchTerm)) ||
        (!!item.stickers && item.stickers.stickers.some(sticker => sticker.long_name.toLowerCase().includes(searchTerm)));
    }

    if (renderUnsellable) {
      render = true;
    }

    if (item.appid === 730) {
      if (renderNameTag) {
        render = !!item.fraudwarnings && render;
      }

      if (renderAppliedSticker) {
        render = !!item.stickers && item.stickers.sticker_count > 0 && render;
      }
    }
    return (render && renderSearch);
  }

  const _renderInventoryItem = ({ item, index }) => {
    const invItem = item as unknown as IInventoryItem;
    return (
      displayItem(invItem) ?
        <View>
          <Pressable style={ styles.inventory.itemContainer } onPress={() => {
            setModalItem(invItem);
            setItemVisible(true);
          }}>
            <View style={[ global.column, { width: helpers.resize(264), alignContent: 'space-between', height: '100%' } ]}>
              <Text bold style={ styles.inventory.itemName }>{ invItem.market_name }</Text>
              <View style={[ global.wrapRow ]}>
                {
                  !!helpers.inventory.getRarity(invItem.tags) &&
                  <Text style={[
                    styles.inventory.pill, {
                      backgroundColor: helpers.pastelify(helpers.inventory.getRarityColor(invItem.tags)),
                      color: helpers.pastelify(helpers.inventory.getRarityColor(invItem.tags), 0),
                    },
                  ]}
                  >
                    { helpers.inventory.getRarity(invItem.tags)?.replace(' Grade', '') }
                  </Text>
                }
                <Text style={[ styles.inventory.pill ]}>{ helpers.inventory.itemType(invItem) }</Text>
              </View>
            </View>

            <View style={[ global.column, { justifyContent: 'space-between', width: helpers.resize(120), alignContent: 'center' } ]}>
              <Text style={ styles.inventory.priceSingle }><Text bold>{ price(invItem.price.price) }</Text> x { invItem.amount }</Text>
              <Text bold style={ styles.inventory.priceTotal }>{ price(invItem.price.price, invItem.amount) }</Text>
              { priceChange(sortBy === 5 ? invItem.price.p30ago : invItem.price.p24ago, invItem.price.price) }
            </View>
          </Pressable>
        </View> : null
    );
  };

  // TODO: On section header click, scroll to the start of the section
  const _renderSectionHeader = ({ section: { game } }) => {
    const gameData = game as unknown as IGameExtended;
    return (
      <View style={ global.header }>
        <Image source={{ uri: gameData.url }} style={ global.headerImage } />
        <View style={[ global.column, { alignSelf: 'center' } ]}>
          <Text bold style={ global.headerTitle }>{ gameData.name }</Text>
          <View style={ global.wrapRow }>
            <Text style={[ global.subtitle, { color: colors.white } ]}>{ gameData.appid }</Text>
            <Text bold style={[ global.subtitle, { color: colors.white } ]}>·</Text>
            <Text style={[ global.subtitle, { color: colors.white } ]}>{ gameData.items } items</Text>
            <Text bold style={[ global.subtitle, { color: colors.white } ]}>·</Text>
            <Text style={[ global.subtitle, { color: colors.white } ]}>{ price(gameData.price) }</Text>
          </View>
        </View>
      </View>
    );
  };

  const priceChange = (oldPrice: number, currentPrice: number, removeBg = false) => {
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
  };

  // TODO: loading screen should be improved. Maybe use Action list component.
  return (
    <GestureHandlerRootView>
      <View>
        <View style={{ height: '100%' }}>
          {
            !loaded && loading &&
            <View style={{ marginTop: Dimensions.get('window').height / 2 - 36 }}>
              <View style={ global.column }>
                <View style={[ global.rowContainer, global.column, { alignItems: 'center' } ]}>
                  <Text>{ profiles.getByID(steamID)?.name }</Text>
                  <Text>{ steamID }</Text>
                </View>
              </View>
              <Loader text='Loading inventory' />
            </View>
          }
          {
            !loading && errorText.length > 0 &&
            <Text style={{ textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 36 }}>
              An error has occurred.{'\n'}{ errorText }
            </Text>
          }
          {
            loaded && helpers.inventory.isEmpty(inventory) &&
            <Text style={{ textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 36 }}>
              No items found.{'\n'}Choose different games and try again
            </Text>
          }
          {
            !loading && loaded && !helpers.inventory.isEmpty(inventory) &&
            <>
              <View style={global.inputView}>
                <TextInput
                  style={ global.input }
                  placeholder='Start typing item name'
                  mode={'outlined'}
                  onChangeText={text => setSearch(text)}
                  label={'Item search'}
                  activeOutlineColor={ colors.primary }
                  left={
                    <TextInput.Icon
                      icon={() => (<Icon name={'filter'} type={'feather'} color={ colors.primary } />)}
                      size={ variables.iconSize }
                      style={{ margin: 0, paddingTop: helpers.resize(8) }}
                      forceTextInputFocus={false}
                    />
                  }
                />
              </View>

              <SectionList
                ref={scrollRef}
                sections={renderableInventory}
                renderItem={_renderInventoryItem}
                renderSectionHeader={_renderSectionHeader}
                stickySectionHeadersEnabled={true}
                onScroll={onScroll}
                nestedScrollEnabled={true}
                ListEmptyComponent={() => (
                  <Text>Inventory is empty</Text>
                )}
                ListFooterComponent={() => (
                  <TouchableOpacity style={global.scrollEnd} onPress={() => {
                    scrollRef.current?.scrollToLocation({ itemIndex: 0, sectionIndex: 0, animated: true });
                  }}>
                    <Icon name={'angle-double-up'} type={'font-awesome'} size={variables.iconXLarge} color={colors.textAccent} />
                    <Text style={{ fontSize: helpers.resize(14) }}>This is the end of the inventory</Text>
                    <Text style={{ fontSize: helpers.resize(14) }}>Tap to scroll back to top</Text>
                  </TouchableOpacity>
                )}
              />

              <AnimatedFAB
                icon={() => (<Icon name={'filter'} type={'feather'} size={ variables.iconSize } color={ colors.primary } />)}
                label={'Filter'}
                extended={isExpanded}
                onPress={() => {
                  setFilterVisible(true);
                }}
                uppercase={false}
                animateFrom={'left'}
                iconMode={'dynamic'}
                style={ global.actionButtonLeft }
                color={ colors.primary }
              />

              <AnimatedFAB
                icon={() => (<Icon name={'bar-chart'} type={'feather'} size={ variables.iconSize } color={ colors.primary } />)}
                label={'Sort order'}
                extended={isExpanded}
                onPress={() => {
                  setOrderVisible(true);
                }}
                uppercase={false}
                animateFrom={'right'}
                iconMode={'dynamic'}
                style={ global.actionButtonRight }
                color={ colors.primary }
              />

              <Modal
                isVisible={filterVisible}
                onBackdropPress={() => setFilterVisible(false)}
                animationIn={'rubberBand'}
                animationOut={'fadeOutDown'}
                animationInTiming={200}
              >
                <SafeAreaView style={ global.modal }>
                  <Text bold style={ global.title }>Filter</Text>

                  <Text bold style={[ global.headerTitle, { color: colors.textAccent } ]}>All Games</Text>
                  <BouncyCheckbox
                    isChecked={renderUnsellable}
                    onPress={(isChecked) => setRenderUnsellable(isChecked)}
                    text='Display non-tradable items'
                    textStyle={[ global.subtitle, { textDecorationLine: 'none' } ]}
                    fillColor={ colors.accent }
                    iconStyle={{ borderWidth: helpers.resize(2) }}
                    style={{ marginLeft: helpers.resize(16) }}
                    size={variables.iconSize}
                  />

                  { Object.keys(inventory).includes('730') &&
                    <>
                      <Text bold style={[ global.headerTitle, { color: colors.textAccent } ]}>Counter-Strike: Global Offensive</Text>
                      <BouncyCheckbox
                        isChecked={renderNameTag}
                        onPress={(isChecked) => setRenderNameTag(isChecked)}
                        text='Display items with Name Tags only'
                        textStyle={[ global.subtitle, { textDecorationLine: 'none' } ]}
                        fillColor={ colors.accent }
                        iconStyle={{ borderWidth: helpers.resize(2) }}
                        style={{ marginLeft: helpers.resize(16), marginVertical: helpers.resize(8) }}
                        size={variables.iconSize}
                      />

                      <BouncyCheckbox
                        isChecked={renderAppliedSticker}
                        onPress={(isChecked) => setRenderAppliedSticker(isChecked)}
                        text='Display items with Stickers only'
                        textStyle={[ global.subtitle, { textDecorationLine: 'none' } ]}
                        fillColor={ colors.accent }
                        iconStyle={{ borderWidth: helpers.resize(2) }}
                        style={{ marginLeft: helpers.resize(16), marginVertical: helpers.resize(8) }}
                        size={variables.iconSize}
                      />
                    </>
                  }
                </SafeAreaView>
              </Modal>

              <Modal
                isVisible={orderVisible}
                onBackdropPress={() => setOrderVisible(false)}
                animationIn={'rubberBand'}
                animationOut={'fadeOutDown'}
                animationInTiming={200}
              >
                <SafeAreaView style={ global.modal }>
                  <Text bold style={ global.title }>Sort inventory</Text>

                  <View style={ global.row }>
                    <View style={[ global.column, { width: '50%' } ]}>
                      <Text bold style={ global.subtitle }>Sort by</Text>

                      <TouchableOpacity style={[ global.modalButton, sortBy === 0 ? global.modalButtonActive : {} ]} onPress={() => changeSortBy(0)}>
                        <Text bold style={[ global.modalButtonText, sortBy === 0 ? global.modalButtonTextActive : {} ]}>Date</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[ global.modalButton, sortBy === 1 ? global.modalButtonActive : {} ]} onPress={() => changeSortBy(1)}>
                        <Text bold style={[ global.modalButtonText, sortBy === 1 ? global.modalButtonTextActive : {} ]}>Name</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[ global.modalButton, sortBy === 2 ? global.modalButtonActive : {} ]} onPress={() => changeSortBy(2)}>
                        <Text bold style={[ global.modalButtonText, sortBy === 2 ? global.modalButtonTextActive : {} ]}>Price</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[ global.modalButton, sortBy === 3 ? global.modalButtonActive : {} ]} onPress={() => changeSortBy(3)}>
                        <Text bold style={[ global.modalButtonText, sortBy === 3 ? global.modalButtonTextActive : {} ]}>Total price</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[ global.modalButton, sortBy === 4 ? global.modalButtonActive : {} ]} onPress={() => changeSortBy(4)}>
                        <Text bold style={[ global.modalButtonText, sortBy === 4 ? global.modalButtonTextActive : {} ]}>24 hour price change</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[ global.modalButton, sortBy === 5 ? global.modalButtonActive : {} ]} onPress={() => changeSortBy(5)}>
                        <Text bold style={[ global.modalButtonText, sortBy === 5 ? global.modalButtonTextActive : {} ]}>30 day price change</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[ global.column, { width: '50%' } ]}>
                      <Text bold style={ global.subtitle }>Sort order</Text>

                      <TouchableOpacity style={[ global.modalButton, sortOrder === 0 ? global.modalButtonActive : {} ]} onPress={() => changeSortOrder(0)}>
                        <Text bold style={[ global.modalButtonText, sortOrder === 0 ? global.modalButtonTextActive : {} ]}>{
                          sortBy === 0 ? 'Newest first' : sortBy === 1 ? 'A to Z' : sortBy === 2 || sortBy === 3 ? 'Expensive first' : 'Profit first'
                        }</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={[ global.modalButton, sortOrder === 1 ? global.modalButtonActive : {} ]} onPress={() => changeSortOrder(1)}>
                        <Text bold style={[ global.modalButtonText, sortOrder === 1 ? global.modalButtonTextActive : {} ]}>{
                          sortBy === 0 ? 'Oldest first' : sortBy === 1 ? 'Z to A' : sortBy === 2 || sortBy === 3 ? 'Cheapest first' : 'Loss first'
                        }</Text>
                      </TouchableOpacity>

                      {
                        (sortBy === 4 || sortBy === 5) &&
                        <TouchableOpacity
                          style={[ global.modalButton, sortUsePercent ? global.modalButtonActive : {} ]}
                          onPress={() => changeSortUsePercentage(!sortUsePercent)}
                        >
                          <Text bold style={[ global.modalButtonText, sortUsePercent ? global.modalButtonTextActive : {} ]}>Change in %</Text>
                        </TouchableOpacity>
                      }
                    </View>
                  </View>
                </SafeAreaView>
              </Modal>

              <Modal
                isVisible={itemVisible}
                onBackdropPress={() => setItemVisible(false)}
                animationIn={'rubberBand'}
                animationOut={'fadeOutDown'}
                animationInTiming={200}
              >
                <Item item={modalItem} stickerPrices={stickerPrices} />
              </Modal>

              <Summary ref={sheetRef} stats={stats} />
            </>
          }
        </View>

        <Snackbar
          visible={errorSnack}
          onDismiss={() => setErrorSnack(false)}
          style={{ backgroundColor: colors.error }}
          duration={3000}
          action={{
            label: 'Okay',
            textColor: colors.text,
            buttonColor: colors.white,
            onPress: () => {
              setErrorSnack(false);
            },
          }}
        >
          <View>
            <Text style={global.snackbarText}>{ errorText }</Text>
          </View>
        </Snackbar>

        <Snackbar
          visible={successSnack}
          onDismiss={() => setSuccessSnack(false)}
          style={{ backgroundColor: colors.success }}
          duration={3000}
          action={{
            label: 'Okay',
            textColor: colors.text,
            buttonColor: colors.white,
            onPress: () => {
              setSuccessSnack(false);
            },
          }}
        >
          <View>
            <Text style={global.snackbarText}>{ successText }</Text>
          </View>
        </Snackbar>
      </View>
    </GestureHandlerRootView>
  );
}
