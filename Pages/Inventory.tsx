import {
  ActivityIndicator,
  Dimensions, FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Pressable, SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
  SectionList,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gamesJson from '../assets/inv-games.json';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { Divider, Icon } from 'react-native-elements';
import { Dropdown } from 'react-native-element-dropdown';
import { Portal, Provider, Snackbar, FAB, AnimatedFAB } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import Text from '../Elements/text';
import Modal from 'react-native-modal';
import * as Clipboard from 'expo-clipboard';
import cloneDeep from 'lodash.clonedeep';
import { TextInput } from 'react-native-paper';
import ActionList from '../Elements/actionList';
import Summary from '../Elements/Inventory/Summary';
import { GestureHandlerRootView, NativeViewGestureHandler } from 'react-native-gesture-handler';
import { IInventoryBase, IInventoryGame, IInventoryOmittedItem, IInventoryOmittedItemAmount, IInventoryPageProps, IInventoryResponse } from '../utils/types';
import { useRateState, useRatesState } from '../utils/store';
import * as Sentry from 'sentry-expo';
import { helpers } from '../utils/helpers';

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
  const gamesList = (gamesJson as { games: IInventoryGame[] }).games;
  const DEV_INV = 'https://inventory.linquint.dev/api/Steam/dev/inv730.php';
  const steamID = route.params.steamId;
  const games = route.params.games;

  const [ snackbarVisible, setSnackbarVisible ] = useState(false);
  const [ snackError, setSnackError ] = useState('');

  const [ loaded, setLoaded ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ search, setSearch ] = useState('');
  const [ baseInventory ] = useState<IInventoryBase>({});
  const [ stats ] = useState({
    'price': 0,
    'owned': 0,
    'ownedTradeable': 0,
    'avg24': 0,
    'avg7': 0,
    'avg30': 0,
    'p24ago': 0,
    'p30ago': 0,
    'p90ago': 0,
    missingPrices: 0,
    'cheapest': {
      'name': '',
      'price': 0,
    },
    'expensive': {
      'name': '',
      'price': 0,
    },
    'games': [],
  });

  useEffect(() => {
    async function loadInventory() {
      const internetConnection = await NetInfo.fetch();
      if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
        setSnackError('No internet connection');
        setSnackbarVisible(true);
        await helpers.waitUntil(() => !!internetConnection.isInternetReachable && internetConnection.isConnected, 40);
        // TODO: Hide error snackbar and display success snackbar with message 'Connected to the internet' or something similar
        setSnackbarVisible(false);
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
            await sleep(3000);
          }
        });

        await sleep(1000);
        await getInventoryPrices();
      } catch (err) {
        setSnackError((err as Error).message);
        setSnackbarVisible(true);
        Sentry.React.captureException(err);
      }
    }

    void loadInventory();
  });

  async function getInventoryPrices() {
    const itemsToLoad: { appid: number; items: string[] }[] = [];
    const stickersToLoad: string[] = [];

    // Map games and items that will be loaded, if CSGO, map stickers aswell
    games.forEach(game => {
      if (baseInventory[game.appid].count > 0) {
        const gameToLoad: { appid: number; items: string[] } = { appid: game.appid, items: [] };
        baseInventory[game.appid].items.forEach(item => {
          gameToLoad.items.push(item.market_name);
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

    // TODO: Create back-end endpoint that will accept all the games and items at once
    // TODO: Create a proper back-end POST method endpoint to load sticker / patch prices
    // TODO: Remove sleep when back-end endpoints will be available
    await sleep(1000);
  }







  const [ inventory, setInventory ] = useState([]);
  const [ fetching, setFetching ] = useState(false);
  const [ isEmpty, setIsEmpty ] = useState(false);
  const [ curr, setCurr ] = useState(rates[props.rate].abb);
  const tempArray = [];
  const [ stickerPrices, setStickerPrices ] = useState({});
  // const [invSize, setInvSize] = useState(0)
  const [ filterVisible, setFilterVisible ] = useState(false);
  const [ containsCSGO, setContainsCSGO ] = useState(false);
  const [ inventoryData, setInventoryData ] = useState([]);
  const [ loadStatus, setLoadStatus ] = useState(null);

  const [ actionList ] = useState([]);
  const [ actionID, setActionID ] = useState(-1);

  const loadInventory = () => {
    const user = useMemo(() => props.steam, [ props.steam ]);
    const games = useMemo(() => props.games, [ props.games ]);
    const isLoaded = useMemo(() => loaded, []);
    let tmpAct = 0;

    useLayoutEffect(() => {
      async function loadInventoryOnEffect() {
        setLoaded(false);
        setLoading(true);
        const itemArray = [];

        for (let i = 0; i < games.length; i++) {
          // Action: 0 - game inventory, 1 - pause, 2 - price
          actionList.push({ action: 0, extra: gameName(games[i]) });
          actionList.push({ action: 1, extra: (games.length > 4) ? 12 : (games.length === 1) ? 2 : 6 });
        }
        actionList.push({ action: 2, extra: games.length });

        for (let i = 0; i < games.length; i++) {
          const gameID = games[i];
          setActionID(tmpAct++);

          const url = (__DEV__) ? 'https://inventory.linquint.dev/api/Steam/dev/inv730.php' : 'https://steamcommunity.com/inventory/' + user + '/' + gameID + '/' + ((gameID === 238960) ? user : (gameID === 264710) ? 1847277 : 2) + '/?count=1000';
          await fetch(url)
            .then(response => {
              if (response.ok) {
                setLoadStatus(response.status);
                return response.json();
              } else {
                setLoadStatus(response.status);
                return { ok: false, status: response.status };
              }
            })
            .then(async json => {
              if ((!json.ok && JSON.stringify(json).length < 30) || json == null) {
                setSnackbarVisible(true);
                if (json.status == 429) setSnackError('Too many requests');
                else setSnackError('Couldn\'t load inventory');
                setLoading(false);
                return false;
              } else {
                json['appid'] = gameID;
                json['game'] = gameName(gameID);
                itemArray.push(json);
              }

              setActionID(tmpAct++);
              await sleep((games.length > 4) ? 12000 : (games.length === 1) ? 2000 : 6000);
            });
        }
        setActionID(tmpAct++);
        return itemArray;
      }

      if (!isLoaded) {
        loadInventoryOnEffect().then(async (items) => {
          setLoading(false);
          if (!items) return;
          setFetching(true);
          await fetchInventory(items).then(async (fetchedItems) => {
            if (fetchedItems == null) {
              setIsEmpty(true);
            } else {
              await getPrices(fetchedItems).then((prices) => {
                finalizeInventory(fetchedItems, prices);
                setFetching(false);
                setLoaded(true);
              });
            }
          });
        });
      }
    }, [ user ]);
  };

  const fetchInventory = async (gameItems) => {
    const tempItems = [];
    let itemsAmount = 0;

    for (let i = 0; i < gameItems.length; i++) {
      const items = gameItems[i];
      itemsAmount += items.total_inventory_count;
      const tempGameData = {
        is_empty: items.total_inventory_count === 0,
        appid: items.appid,
        game: items.game,
        data: [],
      };
      const assets = items.assets;

      if (!tempGameData.is_empty) {
        for (let j = 0; j < items.descriptions.length; j++) {
          const item = items.descriptions[j];
          const itemID = item.classid + '-' + item.instanceid;
          const tempItem = {
            amount: getItemCount(itemID, assets),
            marketable: item.marketable,
            tradable: item.tradable,
            name: item.market_name,
            hash_name: item.market_hash_name,
            type: (item.hasOwnProperty('tags')) ? item.tags[0].localized_tag_name : (items.appid === 232090) ? 'None' : (item.hasOwnProperty('type')) ? item.type : 'None',
            id: itemID,
            image: item.icon_url,
            rarity: (items.appid === 232090) ? item.type : (item.hasOwnProperty('tags')) ? getItemRarity(item.tags) : null,
            rarity_color: '#' + ((items.appid === 730) ? getRarityColor(item.tags) : (item.name_color != null) ? item.name_color : '229'),
            appid: items.appid,
          };

          if (items.appid === 730) {
            tempItem['stickers'] = findStickers(item.descriptions);
            if (item.fraudwarnings != null) tempItem['nametag'] = item.fraudwarnings[0].replace('Name Tag: ', '');
          }
          tempGameData.data.push(tempItem);
        }
      }
      tempItems.push(tempGameData);
    }
    if (itemsAmount === 0) return null;
    return tempItems;
  };

  const getPrices = async (items) => {
    const queries = [];
    const stickerQuery = [];
    items.forEach((game) => {
      if (!game.is_empty) {
        const query = {
          appid: game.appid,
          hashes: '',
        };
        game.data.forEach((item) => {
          const name = item.hash_name.replace(',', ';');
          query.hashes += name + ',';

          if (game.appid === 730) {
            if (item.stickers != null) {
              item.stickers.stickers.forEach((sticker) => {
                if (!stickerQuery.includes(sticker.long_name)) {
                  stickerQuery.push(sticker.long_name);
                }
              });
            }
          }
        });
        queries.push(query);
      }
    });

    const tmpPrices = {};
    for (const query of queries) {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const options = {
        method: 'POST',
        body: JSON.stringify(query),
        headers: myHeaders,
      };

      await fetch('https://inventory.linquint.dev/api/Steam/v3/prices.php', options).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          setFetching(false);
          setLoadStatus(1);
          setSnackError('Error occured while getting prices');
          setSnackbarVisible(true);
          return null;
        }
      }).then(async json => {
        if (json != null) {
          tmpPrices[query.appid] = json;
        }
        await sleep(500);
      });
    }

    if (stickerQuery.length > 0) {
      await fetch('https://inventory.linquint.dev/api/Steam/v3/stickers.php?hashes=' + stickerQuery.toString()).then(response => {
        if (response.ok) {
          return response.json();
        } else {
          setFetching(false);
          setLoadStatus(1);
          setSnackError('Error occured while getting prices');
          setSnackbarVisible(true);
          return null;
        }
      }).then(json => {
        Object.keys(json).forEach((key) => {
          stickerPrices[key] = json[key];
        });
      });
    }
    return tmpPrices;
  };

  const finalizeInventory = (items, prices) => {
    let min = 99999;
    let minName = '';
    let max = 0;
    let maxName = '';

    items.forEach((game) => {
      const appid = game.appid;
      const priceData = prices[appid];

      if (appid === 730) setContainsCSGO(true);

      const gamePrice = {
        price: 0, owned: 0, ownedTradeable: 0, avg24: 0, avg7: 0, avg30: 0, p24ago: 0, p30ago: 0, p90ago: 0, appid: appid, game: gameName(appid), stickerVal: 0, patchVal: 0,
      };

      game.data.forEach((item) => {
        item['price'] = priceData[item.hash_name];

        if (priceData[item.hash_name].found) {
          const pd = priceData[item.hash_name];
          stats.price += pd.price * item.amount;
          stats.owned += item.amount;
          stats.ownedTradeable += (item.marketable) ? item.amount : 0;
          stats.avg24 += pd.avg24 * item.amount;
          stats.avg7 += pd.avg7 * item.amount;
          stats.avg30 += pd.avg30 * item.amount;
          stats.p24ago += pd.p24ago * item.amount;
          stats.p30ago += pd.p30ago * item.amount;
          stats.p90ago += pd.p90ago * item.amount;

          gamePrice.price += pd.price * item.amount;
          gamePrice.owned += item.amount;
          gamePrice.ownedTradeable += (item.marketable) ? item.amount : 0;
          gamePrice.avg24 += pd.avg24 * item.amount;
          gamePrice.avg7 += pd.avg7 * item.amount;
          gamePrice.avg30 += pd.avg30 * item.amount;
          gamePrice.p24ago += pd.p24ago * item.amount;
          gamePrice.p30ago += pd.p30ago * item.amount;
          gamePrice.p90ago += pd.p90ago * item.amount;

          if (appid === 730) {
            if (item.stickers != null) {
              const type = item.stickers.type;
              item.stickers.stickers.forEach(sticker => {
                if (type === 'sticker') gamePrice.stickerVal += Math.round(stickerPrices[sticker.long_name].Price * rate * 100) / 100;
                else gamePrice.patchVal += Math.round(stickerPrices[sticker.long_name].Price * rate * 100) / 100;
              });
            }
          }

          if (pd.price < min) {
            min = pd.price;
            minName = item.name;
          }

          if (max < pd.price) {
            max = pd.price;
            maxName = item.name;
          }
        } else {
          if (item.marketable && item.tradable) {
            stats.owned += item.amount;
            stats.ownedTradeable += item.amount;
            gamePrice.owned += item.amount;
            gamePrice.ownedTradeable += item.amount;
            stats.missingPrices += item.amount;
          }
        }

        if (!item.marketable && !item.tradable) {
          stats.owned += item.amount;
          gamePrice.owned += item.amount;
        }
      });

      stats.games.push(gamePrice);
    });

    stats.cheapest.name = minName;
    stats.cheapest.price = min;
    stats.expensive.price = max;
    stats.expensive.name = maxName;

    setInventoryData(items);
    setFinalInventory(items);
  };

  loadInventory();

  const getItemCount = (id, assets) => {
    let count = 0;
    for (let i = 0; i < assets.length; i++) {
      const assetID = assets[i].classid + '-' + assets[i].instanceid;
      if (id === assetID) count++;
    }
    return count;
  };

  const getItemRarity = (tags) => {
    let rarity = null;
    tags.forEach(tag => {
      if (tag.category.toLowerCase() === 'rarity') rarity = tag.localized_tag_name;
    });
    return rarity;
  };

  const getRarityColor = (tags) => {
    let color = null;
    tags.forEach(tag => {
      if (tag.category.toLowerCase() === 'rarity') color = tag.color;
    });
    return color;
  };

  function findStickers(desc) {
    let hasStickers = false;
    let dID;
    for (let i = 0; i < desc.length; i++) {
      if (desc[i].value.includes('sticker_info')) {
        hasStickers = true;
        dID = i;
        break;
      }
    }
    if (!hasStickers) return null;

    let html = desc[dID].value;
    const count = (html.match(/img/g) || []).length;
    const type = (html.match('Sticker')) ? 'sticker' : 'patch';

    for (let j = 0; j < count; j++) {
      html = html.replace('<br><div id="sticker_info" name="sticker_info" title="Sticker" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>', '');
      html = html.replace('<br><div id="sticker_info" name="sticker_info" title="Patch" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>', '');
      html = html.replace('</center></div>', '');
      html = html.replace('<img width=64 height=48 src="', '');
      html = html.replace('<br>Sticker: ', '');
      html = html.replace('<br>Patch: ', '');
      html = html.replace('">', ';');
    }

    let tmpArr = html.split(';');
    const tmpNames = tmpArr[count].replace(', Champion', '; Champion').replace(', Champion', '; Champion').replace(', Champion', '; Champion').replace(', Champion', '; Champion').replace(', Champion', '; Champion').split(', ');
    tmpArr = tmpArr.splice(0, count);

    const tmpStickers = [];
    for (let j = 0; j < count; j++) {
      const abb = (type === 'sticker') ? 'Sticker | ' : 'Patch | ';
      const sticker = { name: (tmpNames[j]).replace('; Champion', ', Champion'), img: tmpArr[j], long_name: (abb + tmpNames[j]).replace('; Champion', ', Champion') };
      tmpStickers.push(sticker);
    }

    return {
      type: type,
      sticker_count: count,
      stickers: tmpStickers,
    };
  }

  function sleep(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  /*useLayoutEffect(() => {
				setRate(rates[props.rate].exc)
				setCurr(rates[props.rate].abb)
		}, [props.rate])*/

  /*useEffect(() => {
				async function loadInventoryOnCreate() {
						if (!loaded) {
								let internetConnection = await NetInfo.fetch();
								if (!internetConnection.isInternetReachable && !internetConnection.isConnected) {
										setAlert("No internet connection")
										return
								}

								setLoading(true)
								for (let i = 0; i < props.games.length; i++) {
										await getInventory(props.games[i], i === props.games.length - 1).then(null)
										if (i !== props.games.length - 1) await sleep(7000)
								}
						}
				}
				loadInventoryOnCreate().then(() => null)
		}, [loaded])*/


  const gameName = (id) => {
    for (let i = 0; i < games.length; i++) {
      if (id === games[i].appid) {
        return games[i].name;
      }
    }
  };

  const [ sortBy, setSortBy ] = useState(0);
  const [ sortOrder, setSortOrder ] = useState(0);

  const changeSortBy = (sort) => {
    if (sort !== sortBy) {
      setSortBy(sort);
      const tmpInventory = cloneDeep(inventoryData);

      tmpInventory.forEach(game => {
        if (sort === 1) {
          game.data.sort((a, b) => {
            return (b.name < a.name) ? 1 : -1;
          });
        }

        if (sort === 2) {
          game.data.sort((a, b) => {
            if (a.price.found && b.price.found) return b.price.price - a.price.price;
            if (!a.price.found && !b.price.found) return 0;
            if (!a.price.found) return 1;
            else return -1;
          });
        }

        if (sort === 3) {
          game.data.sort((a, b) => {
            if (a.price.found && b.price.found) return b.price.price * b.amount - a.price.price * a.amount;
            if (!a.price.found && !b.price.found) return 0;
            if (!a.price.found) return 1;
            else return -1;
          });
        }

        if (sortOrder === 1) game.data.reverse();
      });

      setFinalInventory(tmpInventory);
    }
  };

  const changeSortOrder = (order) => {
    if (order !== sortOrder) {
      setSortOrder(order);
      finalInventory.forEach(game => {
        game.data.reverse();
      });
    }
  };

  const [ alert, setAlert ] = useState('');
  const [ renderUnsellable, setRenderUnsellable ] = useState(false);
  const [ renderNameTag, setRenderNameTag ] = useState(false);
  const [ renderAppliedSticker, setRenderAppliedSticker ] = useState(false);
  const [ orderVisible, setOrderVisible ] = useState(false);
  const [ finalInventory, setFinalInventory ] = useState([]);
  const [ itemVisible, setItemVisible ] = useState(false);
  const [ modalItem, setModalItem ] = useState({ price: { found: false } });
  const scrollRef = useRef();

  function displayItem(item) {
    let render = item.tradable === 1 || item.marketable === 1;
    let renderSearch = true;

    if (search !== '') {
      renderSearch = (item.name.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase()));
    }

    if (renderUnsellable) {
      render = true;
    }

    if (item.appid === 730) {
      if (renderNameTag) {
        render = item.hasOwnProperty('nametag') && render;
      }

      if (renderAppliedSticker) {
        if (item.hasOwnProperty('stickers')) {
          render = item.stickers != null && render;
        }
      }
    }
    return (render && renderSearch);
  }

  const _renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
      </View>
    );
  };

  const rarityBackground = color => {
    color = color.replace('#', '');
    const colors = color.match(/.{1,2}/g);
    colors[0] = Math.ceil((parseInt(colors[0], 16) + 222) / 2);
    colors[1] = Math.ceil((parseInt(colors[1], 16) + 222) / 2);
    colors[2] = Math.ceil((parseInt(colors[2], 16) + 222) / 2);
    return `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
  };

  const rarityText = color => {
    color = color.replace('#', '');
    const colors = color.match(/.{1,2}/g);
    colors[0] = Math.ceil(parseInt(colors[0], 16) / 2);
    colors[1] = Math.ceil(parseInt(colors[1], 16) / 2);
    colors[2] = Math.ceil(parseInt(colors[2], 16) / 2);
    return `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
  };

  const _renderInventoryItem = ({ item, index }) => {
    return (
      displayItem(item) ?
        <View>
          <Pressable style={styles.itemContainer} onPress={() => {
            setModalItem(item);
            setItemVisible(true);
          }}>
            <View style={[ styles.column, { width: '70%' } ]}>
              <Text bold style={styles.itemName}>{ item.name }</Text>
              <View style={styles.row}>
                <Text style={[ styles.itemType ]}>{ item.type }</Text>
                { item.rarity ?
                  <Text style={[ styles.itemType, { backgroundColor: rarityBackground(item.rarity_color), color: rarityText(item.rarity_color) } ]}>{ item.rarity.replace(' Grade', '') }</Text>
                  : null}
                { priceChange(item.price.p24ago, item.price.price) }
              </View>
            </View>

            <View style={[ styles.column, { justifyContent: 'space-between', width: '30%' } ]}>
              <Text style={styles.itemPriceSingular}><Text bold>{curr} { (rate * item.price.price).toFixed(2) }</Text> x { item.amount }</Text>
              <Text bold style={styles.itemPriceTotal}>{curr} { (Math.round(item.price.price * rate * 100) * item.amount / 100).toFixed(2) }</Text>
            </View>
          </Pressable>
          <Divider width={1} />
        </View> : null
    );
  };

  const _renderSectionHeader = ({ section: { game } }) => {
    return (
      <View style={styles.sectionContainer}>
        <Text bold style={styles.sectionText}>{ game }</Text>
      </View>
    );
  };

  const priceChange = (oldPrice, currentPrice, removeBg = false) => {
    if (oldPrice > 0 && currentPrice > 0) {
      if (oldPrice > currentPrice) {
        return (
          <Text bold style={[ styles.itemPriceChange, styles.pcDecrease, (removeBg ? { backgroundColor: '#ffffff00', width: '33.3%' } : {}) ]}>
            { (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(1) }%
          </Text>
        );
      }
      if (oldPrice < currentPrice) {
        return (
          <Text bold style={[ styles.itemPriceChange, styles.pcIncrease, (removeBg ? { backgroundColor: '#ffffff00', width: '33.3%' } : {}) ]}>
							+{ (((currentPrice - oldPrice) / oldPrice) * 100).toFixed(1) }%
          </Text>
        );
      }
    }
    return <Text bold style={[ styles.itemPriceChange, styles.pcUnchanged, (removeBg ? { backgroundColor: '#ffffff00', width: '33.3%' } : {}) ]}>0%</Text>;
  };

  const [ fabVisible, setFabVisible ] = useState(false);
  const [ showSheet, setShowSheet ] = useState(false);
  const sheetRef = React.createRef();
  const [ isExpanded, setIsExpanded ] = useState(true);
  const onScroll = ({ nativeEvent }) => {
    const currentScrollPosition = Math.floor(nativeEvent?.contentOffset?.y) ?? 0;
    setIsExpanded(currentScrollPosition <= 0);
  };

  const getAppliedValue = (applied) => {
    let tmpPrice = 0.0;
    applied.forEach(apply => {
      tmpPrice += (Math.round(stickerPrices[apply.long_name].Price * 100 * rate)) / 100;
    });
    return tmpPrice;
  };

  return(
    <GestureHandlerRootView>
      <View>
        <View style={{ height: '100%' }}>
          {
            (isEmpty) ?
              <View style={styles.column}>
                {
                  (loadStatus == 429) ?
                    <Text style={{ textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 36 }}>
											Too many requests.{'\n'}Too many attempted requests to Steam in a short period of time.{'\n'}Try again later.
                    </Text>
                    :
                    (loadStatus == 1) ?
                      <Text style={{ textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 36 }}>
											Couldn't get price data.{'\n'}Check if the service is down on{'\n'}https://status.linquint.dev
                      </Text>
                      :
                      <Text style={{ textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 36 }}>
											No items found.{'\n'}Choose different games and try again
                      </Text>
                }
              </View> :
              (loading || fetching) ?
                <ActionList list={actionList} act={actionID} steamid={props.steam} /> :
                <View style={[ styles.column, { alignItems: 'center', marginVertical: resize(8) } ]}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={{ marginHorizontal: resize(8), flex: 1, height: resize(40), fontSize: resize(16), padding: 0 }}
                      placeholder='Start typing item name'
                      mode={'outlined'}
                      onChangeText={text => setSearch(text)}
                      label={'Item search'}
                      activeOutlineColor={'#1f4690'}
                      left={
                        <TextInput.Icon
                          icon={() => (<Icon name={'filter'} type={'feather'} color={'#1f4690'} />)}
                          size={resize(24)}
                          style={{ margin: 0, paddingTop: resize(8) }}
                          name={'at'}
                          forceTextInputFocus={false}
                        />
                      }
                    />
                  </View>
                </View>
          }
          <SectionList
            renderItem={_renderInventoryItem}
            renderSectionHeader={_renderSectionHeader}
            sections={finalInventory}
            stickySectionHeadersEnabled={true}
            ref={scrollRef}
            onScroll={onScroll}
            nestedScrollEnabled={true}
            ListEmptyComponent={() => (
              (loaded) ?
                <Text>Inventory is empty</Text> : null
            )}
            ListFooterComponent={() => (
              (loaded) ?
                <TouchableOpacity style={styles.scrollProgress} onPress={() => {
                  scrollRef.current?.scrollToLocation({ itemIndex: 0, sectionIndex: 0, animated: true });
                }}>
                  <Icon name={'angle-double-up'} type={'font-awesome'} size={resize(48)} color={'#555'} />
                  <Text style={{ fontSize: resize(14) }}>This is the end of the inventory</Text>
                  <Text style={{ fontSize: resize(14) }}>Tap to scroll back to top</Text>
                </TouchableOpacity> : null
            )}
          />
        </View>

        <AnimatedFAB
          icon={() => (<Icon name={'filter'} type={'feather'} size={resize(24)} color={'#1f4690'} />)}
          label={'Filter'}
          extended={isExpanded}
          onPress={() => {
            if (loaded) setFilterVisible(true);
          }}
          uppercase={false}
          visible={loaded}
          animateFrom={'left'}
          iconMode={'dynamic'}
          style={{ bottom: resize(80), left: 16, position: 'absolute', backgroundColor: '#91BCEC', borderRadius: 16 }}
          loading={true}
          color={'#1f4690'}
        />

        <AnimatedFAB
          icon={() => (<Icon name={'bar-chart'} type={'feather'} size={resize(24)} color={'#1f4690'} />)}
          label={'Sort order'}
          extended={isExpanded}
          onPress={() => {
            setOrderVisible(true);
          }}
          uppercase={false}
          visible={loaded}
          animateFrom={'right'}
          iconMode={'dynamic'}
          style={{ bottom: resize(80), right: 16, position: 'absolute', backgroundColor: '#91BCEC', borderRadius: 16 }}
          loading={true}
          color={'#1f4690'}
        />

        <Modal
          isVisible={filterVisible}
          onBackdropPress={() => setFilterVisible(false)}
          animationIn={'rubberBand'}
          animationOut={'fadeOutDown'}
          animationInTiming={200}
        >
          <SafeAreaView style={styles.containerStyle}>
            <Text bold style={styles.fModalTitle}>Filter</Text>

            <Text bold style={styles.fModalGameTitle}>All Games</Text>
            <BouncyCheckbox
              isChecked={renderUnsellable}
              onPress={(isChecked) => setRenderUnsellable(isChecked)}
              text={<Text style={{ fontSize:resize(14), color: '#f07167' }}>Display <Text bold>non-tradable</Text> items</Text>}
              textStyle={{ textDecorationLine: 'none' }}
              fillColor={'#f07167'}
              iconStyle={{ borderWidth:resize(3) }}
              style={{ marginLeft: resize(16) }}
              size={resize(22)}
            />

            { (containsCSGO) ?
              <View>
                <Text bold style={styles.fModalGameTitle}>Counter-Strike: Global Offensive</Text>
                <BouncyCheckbox
                  isChecked={renderNameTag}
                  onPress={(isChecked) => setRenderNameTag(isChecked)}
                  text={<Text style={{ fontSize:resize(14), color: '#f07167' }}>Display items with <Text bold>Name Tags</Text> only</Text>}
                  textStyle={{ textDecorationLine: 'none' }}
                  fillColor={'#f07167'}
                  iconStyle={{ borderWidth:resize(3) }}
                  style={{ marginLeft: resize(16), marginVertical: resize(8) }}
                  size={resize(22)}
                />

                <BouncyCheckbox
                  isChecked={renderAppliedSticker}
                  onPress={(isChecked) => setRenderAppliedSticker(isChecked)}
                  text={<Text style={{ fontSize:resize(14), color: '#f07167' }}>Display items with <Text bold>Stickers</Text> only</Text>}
                  textStyle={{ textDecorationLine: 'none' }}
                  fillColor={'#f07167'}
                  iconStyle={{ borderWidth:resize(3) }}
                  style={{ marginLeft: resize(16), marginVertical: resize(8) }}
                  size={resize(22)}
                />
              </View> : null
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
          <SafeAreaView style={styles.containerStyle}>
            <Text bold style={styles.fModalTitle}>Sort inventory</Text>

            <View style={styles.row}>
              <View style={[ styles.column, { width: '50%' } ]}>
                <Text style={styles.fModalGameTitle}>Sort by</Text>

                <TouchableOpacity style={[ styles.sortButton, sortBy === 0 ? { backgroundColor: '#f07167' } : null ]} onPress={() => changeSortBy(0)}>
                  <Text style={[ styles.sortButtonText, sortBy === 0 ? { color: '#fff' } : null ]}>Date</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[ styles.sortButton, sortBy === 1 ? { backgroundColor: '#f07167' } : null ]} onPress={() => changeSortBy(1)}>
                  <Text style={[ styles.sortButtonText, sortBy === 1 ? { color: '#fff' } : null ]}>Name</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[ styles.sortButton, sortBy === 2 ? { backgroundColor: '#f07167' } : null ]} onPress={() => changeSortBy(2)}>
                  <Text style={[ styles.sortButtonText, sortBy === 2 ? { color: '#fff' } : null ]}>Price</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[ styles.sortButton, sortBy === 3 ? { backgroundColor: '#f07167' } : null ]} onPress={() => changeSortBy(3)}>
                  <Text style={[ styles.sortButtonText, sortBy === 3 ? { color: '#fff' } : null ]}>Total Price</Text>
                </TouchableOpacity>
              </View>

              <View style={[ styles.column, { width: '50%' } ]}>
                <Text style={styles.fModalGameTitle}>Sort order</Text>

                <TouchableOpacity style={[ styles.sortButton, sortOrder === 0 ? { backgroundColor: '#f07167' } : null ]} onPress={() => changeSortOrder(0)}>
                  <Text style={[ styles.sortButtonText, sortOrder === 0 ? { color: '#fff' } : null ]}>{
                    sortBy === 0 ? 'Newest first' : sortBy === 1 ? 'A to Z' : 'Expensive first'
                  }</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[ styles.sortButton, sortOrder === 1 ? { backgroundColor: '#f07167' } : null ]} onPress={() => changeSortOrder(1)}>
                  <Text style={[ styles.sortButtonText, sortOrder === 1 ? { color: '#fff' } : null ]}>{
                    sortBy === 0 ? 'Oldest first' : sortBy === 1 ? 'Z to A' : 'Cheapest first'
                  }</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {(loaded) ?
          <Modal
            isVisible={itemVisible}
            onBackdropPress={() => setItemVisible(false)}
            animationIn={'fadeInUpBig'}
            animationOut={'fadeOutDown'}
            animationInTiming={200}
            animationOutTiming={200}
            onBackButtonPress={() => setItemVisible(false)}
          >
            <SafeAreaView style={[ styles.containerStyle, { backgroundColor: '#fff' } ]}>

              <Text style={styles.itemModalTitle}>{ modalItem.name }</Text>
              <View style={[ styles.row, { alignSelf: 'center' } ]}>
                <Icon name={'type'} type={'feather'} color={'#666'} size={resize(16)} style={{ marginRight: resize(4) }} />
                <Text style={styles.itemModalSubtitle}>{ modalItem.type }</Text>
                {
                  (modalItem.rarity != null) ?
                    <View style={[ styles.row, { marginLeft: resize(16) } ]}>
                      <Icon name={'circle'} type={'font-awesome'} color={modalItem.rarity_color} size={resize(16)} style={{ marginRight: resize(4) }} />
                      <Text style={[ styles.itemModalSubtitle, { color: modalItem.rarity_color } ]}>{ modalItem.rarity }</Text>
                    </View> : null
                }
              </View>

              {
                (modalItem.nametag != null) ?
                  <Text bold style={styles.itemModalSubtitle}>{ modalItem.nametag }</Text> : null
              }

              {(!modalItem.marketable || !modalItem.tradable) ?
                <View style={[ styles.row, { alignSelf: 'center' } ]}>
                  <Icon name={'alert-circle'} type={'feather'} size={resize(16)} color={'#f07167'} />
                  <Text style={styles.itemModalAlert}>
                    {!modalItem.marketable && !modalItem.tradable ? 'Item cannot be sold or traded' : !modalItem.marketable ? 'Item cannot be sold' : 'Item cannot be traded' }
                  </Text>
                </View> : null
              }

              <Image
                source={{ uri: 'https://community.cloudflare.steamstatic.com/economy/image/' + modalItem.image }}
                resizeMode={'contain'}
                style={[ styles.itemIcon, (modalItem.rarity_color != null) ? { borderColor: modalItem.rarity_color } : null ]}
              />

              {modalItem.stickers != null ?
                <View style={styles.column}>
                  {modalItem.stickers.stickers.map(sticker => (
                    <View style={[ styles.row, { justifyContent: 'space-evenly' } ]}>
                      <Image
                        source={{ uri: sticker.img }}
                        style={[ { width: resize(40), height: resize(40) } ]}
                        resizeMode={'cover'}
                      />

                      <Text style={{ width: resize(200), textAlignVertical: 'center', fontSize: resize(14) }}>
                        { sticker.long_name.replace('Sticker | ', '').replace('Patch | ', '') }
                      </Text>

                      <Text bold style={{ width: resize(94), textAlignVertical: 'center', textAlign: 'right', fontSize: resize(14) }}>
                        { curr } { (stickerPrices[sticker.long_name].Price * rate).toFixed(2) }
                      </Text>
                    </View>
                  ))}

                  <View style={[ styles.row, { justifyContent: 'space-between', marginTop: resize(4) } ]}>
                    <Text style={styles.totalAppliedValueText}>Total applied { modalItem.stickers.type } value:</Text>
                    <Text bold style={styles.totalAppliedValue}>{ curr } { (getAppliedValue(modalItem.stickers.stickers)).toFixed(2) }</Text>
                  </View>

                </View> : null
              }

              <Divider style={{ marginVertical: resize(8) }} />

              {
                (modalItem.price.found) ?
                  <View>
                    <View style={[ styles.row, { alignSelf: 'center' } ]}>
                      <Text style={styles.itemModalUpdated}>Min and max prices since 2022-12-13</Text>
                    </View>

                    <View style={[ styles.row, { alignSelf: 'center' } ]}>
                      <Text style={styles.itemModalUpdated}>Last updated </Text>
                      <Text style={styles.itemModalUpdated} bold>{ Math.floor(modalItem.price.ago / 60 / 60) }</Text>
                      <Text style={styles.itemModalUpdated}> hours </Text>
                      <Text style={styles.itemModalUpdated} bold>{ Math.floor(modalItem.price.ago / 60 % 60) }</Text>
                      <Text style={styles.itemModalUpdated}> minutes ago</Text>
                    </View>

                    <View style={[ styles.row, { alignSelf: 'center' } ]}>
                      <Text bold style={[ styles.itemModalListed ]}>{ modalItem.price.listed } </Text>
                      <Text style={styles.itemModalListed}>listings on Steam Market</Text>
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly', marginTop: resize(4) } ]}>
                      <Text style={styles.itemModalAvgTitle}>Min price</Text>
                      <Text style={styles.itemModalAvgTitle}>Max price</Text>
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly' } ]}>
                      <Text bold style={styles.itemModalAvgValue}>{curr} { (modalItem.price.min * rate).toFixed(2) }</Text>
                      <Text bold style={styles.itemModalAvgValue}>{curr} { (modalItem.price.max * rate).toFixed(2) }</Text>
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly', marginTop: resize(4) } ]}>
                      <Text style={styles.itemModalAvgTitle}>24 hours ago</Text>
                      <Text style={styles.itemModalAvgTitle}>30 days ago</Text>
                      <Text style={styles.itemModalAvgTitle}>90 days ago</Text>
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly' } ]}>
                      <Text bold style={styles.itemModalPriceHistory}>{ curr } { (modalItem.price.p24ago * rate).toFixed(2) }</Text>
                      <Text bold style={styles.itemModalPriceHistory}>{ curr } { (modalItem.price.p30ago * rate).toFixed(2) }</Text>
                      <Text bold style={styles.itemModalPriceHistory}>{ curr } { (modalItem.price.p90ago * rate).toFixed(2) }</Text>
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly' } ]}>
                      { priceChange(modalItem.price.p24ago * rate, modalItem.price.price * rate, true) }
                      { priceChange(modalItem.price.p30ago * rate, modalItem.price.price * rate, true) }
                      { priceChange(modalItem.price.p90ago * rate, modalItem.price.price * rate, true) }
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly', marginTop: resize(4) } ]}>
                      <Text style={styles.itemModalAvgTitle}>24h average</Text>
                      <Text style={styles.itemModalAvgTitle}>7d average</Text>
                      <Text style={styles.itemModalAvgTitle}>30d average</Text>
                    </View>

                    <View style={[ styles.row, { justifyContent: 'space-evenly', marginBottom: resize(12) } ]}>
                      <Text bold style={styles.itemModalAvgValue}>{curr} { (modalItem.price.avg24 * rate).toFixed(3) }</Text>
                      <Text bold style={styles.itemModalAvgValue}>{curr} { (modalItem.price.avg7 * rate).toFixed(3) }</Text>
                      <Text bold style={styles.itemModalAvgValue}>{curr} { (modalItem.price.avg30 * rate).toFixed(3) }</Text>
                    </View>

                    <View style={[ styles.row ]}>
                      <Text style={styles.itemModalPriceOwned}><Text bold>{ curr } { (modalItem.price.price * rate).toFixed(2) }</Text> x { modalItem.amount }</Text>
                      <Text bold style={styles.itemModalPrice}>{ curr } { (Math.round(modalItem.price.price * rate * 100) * modalItem.amount / 100).toFixed(2) }</Text>
                    </View>
                  </View> : (!modalItem.marketable && !modalItem.tradable) ?
                    <Text bold style={{ textAlign: 'center' }}>Item cannot be sold or traded</Text> :
                    <Text bold style={{ textAlign: 'center' }}>Price was not found in the database</Text>
              }

            </SafeAreaView>
          </Modal> : null
        }

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          style={{ backgroundColor: '#193C6E' }}
          action={{
            label: 'DISMISS',
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}>
          <View><Text style={styles.snackbarText}>{snackError}</Text></View>
        </Snackbar>

        { (loaded) ?
          <Summary
            ref={sheetRef}
            stats={stats}
            curr={rates[props.rate].abb}
            rate={rates[props.rate].exc}
            steam={props.steam}
            games={props.games}
            scale={scale}
          /> : null}
      </View>
    </GestureHandlerRootView>
  );
}

// function Item(props) {
//     const [open, setOpen] = useState(false)
//     const onPress = () => {
//         LayoutAnimation.easeInEaseOut();
//         setOpen(!open)
//     }
//     const inv = props.inv
//     const img = 'https://community.cloudflare.steamstatic.com/economy/image/' + inv.icon_url
//     const not_found = 'https://icon-library.com/images/development_not_found-512.png'
//     const winWidth = Dimensions.get('window').width;

//     const [scale] = useState(Dimensions.get('window').width / 423);
//     const resize = (size) => {
//         return Math.ceil(size * scale)
//     }

//     const getAppliedPrice = (name) => {
//         return props.stPrices[name]
//     }

//     const getTotalAppliedValue = (items) => {
//         let baseText = ((items.type === 'sticker') ? 'Applied stickers value ' : 'Applied patches value ')
//         let sum = 0.0
//         items.stickers.forEach(item => {
//             sum += parseFloat(Math.round(props.stPrices[item.long_name] * props.rate * 100) / 100)
//         })
//         return (
//             <Text style={styles.totalAppliedValueText}>{baseText}<Text bold style={styles.totalAppliedValue}>{props.curr} {Math.round(sum * 100) / 100}</Text></Text>
//         )
//     }

//     const getStickerWidth = (count) => {
//         let tmpW = Math.floor(winWidth / count * 0.95)
//         return (tmpW > 72) ? 72 : tmpW
//     }

//     const duration = inv.Updated
//     let minutes = Math.floor(duration / 60 % 60),
//         hours = Math.floor(duration / 60 / 60),
//         seconds = Math.floor(duration % 60);

//     return (
//         <Pressable onPress={() => onPress()}>
//             <View style={[styles.container]}>
//                 <View style={{display: 'flex', flexDirection: 'row',}}>
//                     <View style={[styles.flowColumn, {width: '96%'}]}>
//                         <Text bold style={styles.itemName}>{inv.market_name}</Text>
//                         <Text style={styles.itemType}>{inv.type}</Text>
//                     </View>
//                 </View>
//                 <View style={[styles.flowRow]}>
//                     <Text style={styles.itemPriceTitle}>Owned</Text>
//                     <Text style={styles.itemPriceTitle}>Price per item</Text>
//                     <Text style={styles.itemPriceTitle}>Total Price</Text>
//                 </View>
//                 <View style={styles.flowRow}>
//                     <Text bold style={styles.itemPrice}>{inv.amount}</Text>
//                     <Text bold style={styles.itemPrice}>{props.curr} {Math.round(inv.Price * props.rate * 100) / 100}</Text>
//                     <Text bold style={styles.itemPrice}>{props.curr} {(inv.Price === 'NaN' ? 'NaN' : Math.round(inv.Price * props.rate * 100) / 100 * inv.amount)}</Text>
//                 </View>
//             </View>
//             { open &&
//                 <View style={styles.containerCollapsable}>
//                     <View style={styles.row}>
//                         <Image style={{width: '22%', aspectRatio: 1.3, marginRight: 4}} source={open ? {uri: img} : {uri: not_found}} />
//                         <View style={[styles.column, {width: '73%'}]}>
//                             <Text style={styles.detail}>Item is <Text style={styles.detailBold}>{inv.marketable === 1 ? 'marketable' : 'non-marketable'}</Text> and <Text style={styles.detailBold}>{inv.tradable ? 'tradable' : 'non-tradable'}</Text></Text>
//                             { (inv.Price === 'NaN' || (inv.Price === 0.03 && inv.Listed === 0)) ?
//                                 <View>
//                                     <Text style={styles.detailBold}>Market details unavailable for this item</Text>
//                                 </View> :
//                                 <View>
//                                     <Text style={styles.detail}>Price updated <Text bold style={styles.detailBold}>{hours}</Text>h <Text bold style={styles.detailBold}>{minutes}</Text>min <Text bold style={styles.detailBold}>{seconds}</Text>s ago</Text>
//                                     <Text style={styles.detail}><Text bold style={styles.detailBold}>{inv.Listed}</Text> listings on Steam Market</Text>
//                                 </View>
//                             }
//                             {inv.hasOwnProperty('fraudwarnings') ? <Text style={styles.detail}>Name Tag: <Text bold>{inv.fraudwarnings[0].substring(12, inv.fraudwarnings[0].length - 2)}</Text></Text> : null}
//                         </View>
//                     </View>
//                     {
//                         inv.hasOwnProperty('stickers') ?
//                             <View style={styles.column}>
//                                 <Text bold style={styles.stpaType}>Applied { (inv.stickers.type) ? (inv.stickers.sticker_count > 1) ? 'stickers' : 'sticker' : (inv.stickers.sticker_count > 1) ? 'patches' : 'patch' }</Text>
//                                 <View style={styles.stpaRow}>
//                                     {
//                                         inv.stickers.stickers.map(sticker => (
//                                             <Image style={{ aspectRatio: 1.3, width: resize(getStickerWidth(inv.stickers.sticker_count)) }} source={open ? { uri: sticker.img } : {uri: not_found}} />
//                                         ))
//                                     }
//                                 </View>
//                                 <View style={styles.stpaRow}>
//                                     {
//                                         inv.stickers.stickers.map(sticker => (
//                                             <Text bold style={{ width: resize(getStickerWidth(inv.stickers.sticker_count)), textAlign: 'center', color: '#555', fontSize: resize(14) }}>{Math.round(getAppliedPrice(sticker.long_name) * props.rate * 100) / 100}</Text>
//                                         ))
//                                     }
//                                 </View>
//                                 { getTotalAppliedValue(inv.stickers) }
//                             </View> : null
//                     }
//                     {(inv.Price === 'NaN' || (inv.Price === 0.03 && inv.Listed === 0)) ?
//                         null :
//                         <View style={{alignSelf: 'center'}}>
//                             <View style={styles.flowRow}>
//                                 <Text style={styles.avgTitle}>24 hour average</Text>
//                                 <Text style={styles.avgTitle}>7 day average</Text>
//                                 <Text style={styles.avgTitle}>30 day average</Text>
//                             </View>
//                             <View style={styles.flowRow}>
//                                 <Text bold style={styles.avgDetails}>{props.curr} {Math.round(inv.avg24 * props.rate * 1000) / 1000}</Text>
//                                 <Text bold style={styles.avgDetails}>{props.curr} {Math.round(inv.avg7 * props.rate * 1000) / 1000}</Text>
//                                 <Text bold style={styles.avgDetails}>{props.curr} {Math.round(inv.avg30 * props.rate * 1000) / 1000}</Text>
//                             </View>
//                         </View>
//                     }
//                 </View>
//             }
//         </Pressable>
//     )
// }

const resize = (size) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const styles = StyleSheet.create ({
  sectionContainer: {
    backgroundColor: '#F2F2F2',
    paddingVertical: resize(8),
    paddingLeft: resize(8),
  },
  sectionText: {
    fontSize: resize(24),
    color: '#0A5270',
  },
  itemContainer: {
    borderRadius: 16,
    paddingVertical: resize(8),
    width: '94%',
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  itemPriceSingular: {
    fontSize: resize(14),
    color: '#0B4F6C',
    textAlign: 'right',
  },
  itemPriceTotal: {
    fontSize: resize(16),
    color: '#131B23',
    textAlign: 'right',
  },
  itemImageSmall: {
    height: resize(64),
    width: resize(64),
    marginRight: 8,
  },
  container: {
    marginTop: 6,
    marginBottom: 6,
    width: '95%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
    alignSelf: 'center',
  },
  containerCollapsable: {
    width: '95%',
    display: 'flex',
    flexDirection: 'column',
    marginVertical: 4,
    alignSelf: 'center',
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#00a',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  flowRow: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  flowColumn: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  gameTitle: {
    color: '#222',
  },
  appID: {
    color: '#222',
  },
  containerSelected: {
    borderWidth: 1.0,
    borderColor: '#0f0',
  },
  gameName: {
    fontSize: resize(24),
    marginVertical: 8,
    marginLeft: 8,
    color: '#333',
  },
  itemIcon: {
    width: resize(160),
    height: resize(160),
    borderWidth: 1,
    borderColor: '#00a',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: resize(8),
    alignSelf: 'center',
  },
  itemName: {
    fontSize: resize(15),
    color: '#485A70',
    height: resize(48),
  },
  itemType: {
    fontSize: resize(13),
    color: '#2F3C4A',
    backgroundColor: '#AFBBCA',
    paddingHorizontal: resize(8),
    paddingVertical: resize(4),
    borderRadius: 30,
    marginRight: resize(8),
  },
  itemPriceChange: {
    fontSize: resize(13),
    color: '#fff',
    paddingHorizontal: resize(8),
    paddingVertical: resize(4),
    borderRadius: 30,
    textAlign: 'center',
  },
  pcIncrease: {
    backgroundColor: '#7fff7f',
    color: '#336433',
  },
  pcDecrease: {
    backgroundColor: '#ff7f7f',
    color: '#663333',
  },
  pcUnchanged: {
    backgroundColor: '#ff9f7f',
    color: '#664033',
  },
  itemPriceTitle: {
    width: '33%',
    textAlign: 'center',
    color: '#777',
    fontSize: resize(14),
  },
  itemPrice: {
    width: '33%',
    textAlign: 'center',
    color: '#333',
    fontSize: resize(16),
  },
  avgTitle: {
    color: '#777',
    width: '32%',
    textAlign: 'center',
    fontSize: resize(14),
  },
  avgDetails: {
    fontSize: resize(14),
    color: '#333',
    width: '32%',
    textAlign: 'center',
  },
  alert: {
    position: 'absolute',
    top: resize(8),
    backgroundColor: '#229',
    width: '90%',
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: 8,
  },
  msg: {
    margin: resize(8),
    color: '#fff',
  },
  detailsPress: {
    width: '67%',
    alignSelf: 'center',
    backgroundColor: '#d3d5d8',
    marginVertical: resize(8),
    borderRadius: 8,
  },
  detailsText: {
    fontSize: resize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    marginVertical: 8,
    color: '#333',
  },
  statsTitle: {
    fontSize: resize(14),
    textAlignVertical: 'center',
    textAlign: 'left',
    width: '45%',
    color: '#555',
  },
  statsDetails: {
    fontSize: resize(16),
    textAlign: 'right',
    width: '55%',
    color: '#333',
  },
  statsDetailsS: {
    fontSize: resize(12),
    fontWeight: 'normal',
    textAlign: 'right',
    width: '55%',
    color: '#333',
  },
  scrollProgress: {
    width: '65%',
    alignSelf: 'center',
    alignItems: 'center',
    padding: 8,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 5,
    marginBottom: 82,
  },
  summarySection: {
    paddingVertical: resize(12),
    alignSelf: 'center',
  },
  inputView: {
    width: '90%',
    height: resize(44),
    borderRadius: 8,
    paddingHorizontal: resize(10),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  searchInput: {
    fontSize: resize(14),
    width: '100%',
  },
  fsRow: {
    width: '90%',
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fsCell: {
    width: '48%',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  dropdown: {
    backgroundColor: 'white',
    borderColor: '#229',
    borderWidth: 2,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 8,
    borderRadius: 8,
    height: resize(38.5),
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderRadius: 8,
  },
  item: {
    paddingVertical: resize(16),
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: resize(16),
  },
  filterPressable: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: '#229',
    borderWidth: 2,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    height: resize(38.5),
    justifyContent: 'center',
  },
  filterPressableText: {
    fontSize: resize(18),
    textAlignVertical: 'center',
    height: '100%',
  },
  stpaRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '96%',
    alignSelf: 'center',
  },
  stpaType: {
    fontSize: resize(16),
    width: '100%',
    textAlign: 'center',
  },
  sumGame: {
    fontSize: resize(20),
    textAlign: 'center',
    marginBottom: 4,
    color: '#0A5270',
  },
  totalAppliedValueText: {
    fontSize: resize(16),
    marginBottom: resize(8),
    color: '#777',
  },
  totalAppliedValue: {
    fontSize: resize(16),
    color: '#333',
    textAlign: 'right',
  },
  snackbarText: {
    fontSize: resize(12),
    color: '#ddd',
  },
  containerStyle: {
    backgroundColor: '#fdfcdc',
    padding: resize(16),
    alignSelf: 'center',
    borderRadius: 24,
    width: '100%',
  },
  fModalTitle: {
    textAlign: 'left',
    color: '#0081a7',
    fontSize: resize(28),
  },
  fModalGameTitle: {
    color: '#0081a7',
    fontSize: resize(20),
    marginVertical: resize(8),
  },
  detailBold: {
    fontSize: resize(14),
  },
  detail: {
    fontSize: resize(14),
  },
  sortButton: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: resize(12),
    marginVertical: resize(8),
    backgroundColor: '#ffffff00',
    borderColor: '#f07167',
  },
  sortButtonText: {
    height: resize(48),
    fontSize: resize(18),
    color: '#f07167',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  itemModalTitle: {
    fontSize: resize(18),
    textAlign: 'center',
    color: '#333',
  },
  itemModalSubtitle: {
    fontSize: resize(16),
    textAlign: 'center',
    color: '#666',
  },
  itemModalAlert: {
    fontSize: resize(14),
    textAlign: 'center',
    color: '#f07167',
    marginLeft: resize(4),
  },
  itemModalStickerImage: {
    width: resize(64),
    height: resize(64),
    marginRight: resize(12),
  },
  itemModalUpdated: {
    fontSize: resize(12),
    color: '#666',
  },
  itemModalAvgTitle: {
    fontSize: resize(14),
    color: '#666',
    width: '33.3%',
    textAlign: 'center',
  },
  itemModalAvgValue: {
    fontSize: resize(14),
    color: '#444',
    width: '33.3%',
    textAlign: 'center',
  },
  itemModalPriceOwned: {
    fontSize: resize(16),
    color: '#555',
    width: '50%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  itemModalPrice: {
    fontSize: resize(18),
    color: '#333',
    width: '50%',
    textAlign: 'center',
  },
  itemModalListed: {
    fontSize: resize(14),
    color: '#555',
  },
  itemModalPriceHistory: {
    fontSize: resize(16),
    color: '#333',
    width: '33.3%',
    textAlign: 'center',
  },
});
