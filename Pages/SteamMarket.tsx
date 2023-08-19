import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { Dropdown } from 'react-native-element-dropdown';
import Text from '../components/Text';
import { AnimatedFAB, Snackbar, TextInput } from 'react-native-paper';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import { useRateState, useRatesState } from '../utils/store';
import { helpers } from '../utils/helpers';
import { colors, global, variables } from '../styles/global';
import * as Sentry from 'sentry-expo';
import { IDropdownItem, ISteamMarketResponse, ISteamMarketSearchResult } from '../utils/types';
import Loader from '../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function () {
  const rate = useRateState();
  const rates = useRatesState();

  const [ errorText, setErrorText ] = useState('');
  const [ successText, setSuccessText ] = useState('');
  const [ errorSnack, setErrorSnack ] = useState(false);
  const [ successSnack, setSuccessSnack ] = useState(false);

  const [ loading, setLoading ] = useState(true);
  const [ loadedGames, setLoadedGames ] = useState(false);
  const [ games ] = useState<IDropdownItem[]>([ { value: 0, label: 'All Games' } ]);

  const [ loadingResults, setLoadingResults ] = useState(false);
  const [ loadedResults, setLoadedResults ] = useState(false);
  const [ searchTimeout, setSearchTimeout ] = useState(false);
  const [ searchResults, setSearchResults ] = useState<ISteamMarketResponse>({
    success: false,
    start: 0,
    pagesize: 0,
    total_count: 0,
    results: [],
  });

  // TODO: [SteamMarket.tsx]: Search query persists after querying a search.
  const sortByValues = [
    { label: 'Default - no specific order', value: 0 },
    { label: 'Price', value: 1 },
    { label: 'Name', value: 2 },
  ];
  const [ filterGame, setFilterGame ] = useState(0);
  const [ searchQuery, setSearchQuery ] = useState('');
  const [ sortBy, setSortBy ] = useState(0);
  const [ sortAsc, setSortAsc ] = useState(true);
  const [ searchDesc, setSearchDesc ] = useState(false);

  function convertPrice(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return (Math.round(p * 100 * r.exc) * amount / 100);
  }

  function price(p: number, amount = 1) {
    const r = rates.getOne(rate.get());
    return `${r.abb} ${convertPrice(p, amount).toFixed(2)}`;
  }

  async function checkInternetConnection() {
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
  }

  useEffect(() => {
    async function prepare() {
      try {
        await checkInternetConnection();
        const gamesRes = await fetch('https://inventory.linquint.dev/api/Steam/getGames.php');
        const gamesJson = ((await gamesRes.json()) as { appid: number; name: string }[]).map<IDropdownItem>(game => (
          { value: game.appid, label: game.name }
        ));
        games.push(...gamesJson);
        setLoadedGames(true);
      } catch (err) {
        setErrorText((err as Error).message);
        setErrorSnack(true);
        Sentry.React.captureException(err);
      } finally {
        setLoading(false);
      }
    }

    void prepare();
  }, []);

  async function search() {
    if (searchTimeout) {
      return;
    }

    setLoadingResults(true);
    setShowSheet(false);
    const sd = (searchDesc) ? 1 : 0;
    const column = (sortBy === 0) ? '' : (sortBy === 1) ? '&sort_column=price' : '&sort_column=name';
    const dir = (sortAsc) ? 'asc' : 'desc';
    // eslint-disable-next-line max-len
    const url = `https://steamcommunity.com/market/search/render/?search_descriptions=${sd}${column}&sort_dir=${dir}&appid=${filterGame}&norender=1&count=100&start=0&query=${searchQuery}`;

    try {
      await checkInternetConnection();
      const searchRes = await fetch(url);
      const searchJson = (await searchRes.json()) as ISteamMarketResponse;
      setSearchResults(searchJson);
      setLoadedResults(true);
      void timeoutCountdown(15000);
    } catch (err) {
      setErrorText((err as Error).message);
      setErrorSnack(true);
      Sentry.React.captureException(err);
    } finally {
      setLoadingResults(false);
    }
  }

  function getSortIcon() {
    if (sortBy === 1) {
      if (sortAsc) return 'sort-amount-asc';
      else return 'sort-amount-desc';
    }
    if (sortBy === 2) {
      if (sortAsc) return 'sort-alpha-asc';
      else return 'sort-alpha-desc';
    }
    return 'align-justify';
  }

  function sleep(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  const [ timeoutLen, setTimeoutLen ] = useState(0);
  const timeoutCountdown = async (tLen: number) => {
    setSearchTimeout(true);
    if (tLen > 0) {
      setTimeoutLen(Math.round(tLen / 1000));
      await sleep(1000);
      await timeoutCountdown(tLen - 1000);
    } else {
      setTimeoutLen(0);
      setSearchTimeout(false);
    }
  };

  const _renderItem = (item: IDropdownItem, active: number) => {
    return (
      <View style={[ global.dropdownSelect, active === item.value ? { backgroundColor: colors.secondary } : {} ]}>
        <Text style={global.dropdownSelectText}>{item.label}</Text>
      </View>
    );
  };

  const scrollRef = useRef<FlatList>(null);
  const [ showSheet, setShowSheet ] = useState(false);
  const [ isExpanded, setIsExpanded ] = useState(true);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollPosition = Math.floor(e.nativeEvent.contentOffset.y) ?? 0;
    setIsExpanded(currentScrollPosition <= 0);
  };

  const _renderSteamItem = ({ item }: { item: ISteamMarketSearchResult }) => (
    <View style={global.rowContainer}>
      <Image
        style={global.rowImage}
        resizeMode={'contain'}
        source={{ uri: `https://community.akamai.steamstatic.com/economy/image/${item.asset_description.icon_url}` }}
      />
      <View style={[ global.column, { width: helpers.resize(228) } ]}>
        <Text style={[ global.subtitle, { textAlign: 'left' } ]}>{item.name}</Text>
        <Text bold>{item.app_name}</Text>
      </View>
      <View style={global.column}>
        <Text bold style={global.subtitle}>{ price(item.sell_price / 100) }</Text>
        <Text>{ item.sell_listings } listed</Text>
      </View>
    </View>
  );

  return (
    <>
      {
        loading &&
        <View style={{ marginTop: Dimensions.get('window').height / 2 - 36 }}>
          <Loader text='Downloading Steam Market games list' />
        </View>
      }
      {
        loadingResults &&
        <View style={{ marginTop: Dimensions.get('window').height / 2 - 36 }}>
          <Loader text='Searching the Steam Market...' />
        </View>
      }
      {
        loadedGames && !loadingResults &&
        <View style={global.column}>
          {
            loadedResults &&
            <View style={[ global.header, global.column ]}>
              <Text style={global.headerTitle}>Found { searchResults.total_count } results</Text>
              <Text style={{ color: colors.white }}>
                Showing first { searchResults.start + searchResults.results.length } results
              </Text>
            </View>
          }
          <FlatList
            ref={scrollRef}
            renderItem={_renderSteamItem}
            data={searchResults.results}
            ListFooterComponent={() => (
              (searchResults.results.length > 10) ?
                <TouchableOpacity style={global.scrollEnd} onPress={() => {
                  scrollRef.current?.scrollToIndex({ animated: true, index: 0 });
                }}>
                  <Icon name={'angle-double-up'} type={'font-awesome'} size={variables.iconXLarge} color={colors.textAccent} />
                  <Text style={{ fontSize: helpers.resize(14) }}>This is the end of the search results</Text>
                  <Text style={{ fontSize: helpers.resize(14) }}>Tap to scroll back to top</Text>
                </TouchableOpacity> : null
            )}
            onScroll={onScroll}
          />

          <Modal
            isVisible={showSheet}
            onBackdropPress={() => setShowSheet(false)}
            animationIn={'slideInUp'}
            animationOut={'slideOutDown'}
            animationInTiming={250}
          >
            <SafeAreaView style={global.modal}>
              <ScrollView>
                <Text bold style={global.title}>Search community market</Text>

                <TextInput
                  style={[ global.input, global.width100, { marginHorizontal: 0 } ]}
                  placeholder='Search query'
                  mode={'outlined'}
                  onChangeText={text => setSearchQuery(text)}
                  label={'Search query'}
                  activeOutlineColor={colors.primary}
                  left={
                    <TextInput.Icon
                      icon={() => (<Icon name={'search'} type={'ionicons'} color={colors.primary} />)}
                      size={variables.iconSize}
                      style={{ margin: 0, marginTop: helpers.resize(8) }}
                      forceTextInputFocus={false}
                    />
                  }
                />

                <Text bold style={[ global.dropdownTitle ]}>Game</Text>
                <Dropdown
                  data={games}
                  search
                  searchPlaceholder={'Search for game...'}
                  labelField={'label'}
                  valueField={'value'}
                  placeholder={'Select a game...'}
                  maxHeight={helpers.resize(320)}
                  onChange={(item: IDropdownItem) => setFilterGame(item.value)}
                  value={filterGame}
                  renderItem={(item: IDropdownItem) => _renderItem(item, filterGame)}
                  renderLeftIcon={() => (
                    <Icon name="gamepad" type={'font-awesome'} size={variables.iconSize} color={colors.primary} style={{ marginRight: helpers.resize(8) }} />
                  )}
                  inputSearchStyle={global.dropdownInput}
                  style={global.dropdown}
                  selectedTextStyle={global.selectedTextStyle}
                />

                <Text bold style={[ global.dropdownTitle ]}>Sort by</Text>
                <Dropdown
                  data={sortByValues}
                  labelField={'label'}
                  valueField={'value'}
                  placeholder={'Select a sort option...'}
                  maxHeight={helpers.resize(170)}
                  onChange={(item: IDropdownItem) => setSortBy(item.value)}
                  value={sortBy}
                  renderItem={(item: IDropdownItem) => _renderItem(item, sortBy)}
                  renderLeftIcon={() => (
                    <Icon name="sort" type={'font-awesome'} size={variables.iconSize} color={colors.primary} style={{ marginRight: helpers.resize(8) }} />
                  )}
                  inputSearchStyle={global.dropdownInput}
                  style={global.dropdown}
                  selectedTextStyle={global.selectedTextStyle}
                />

                <Text bold style={[ global.dropdownTitle ]}>Sort order</Text>
                <Dropdown
                  data={sortBy === 0 ? [ { value: 0, label: 'Default order' } ] : [ { value: 0, label: 'Ascending' }, { value: 1, label: 'Descending' } ]}
                  labelField={'label'}
                  valueField={'value'}
                  placeholder={'Select a sort order option...'}
                  maxHeight={helpers.resize(170)}
                  onChange={(item: IDropdownItem) => setSortAsc(item.label === 'Ascending')}
                  value={sortAsc ? 0 : 1}
                  renderItem={(item: IDropdownItem) => _renderItem(item, sortAsc ? 0 : 1)}
                  renderLeftIcon={() => (
                    <Icon
                      name={getSortIcon()}
                      type={'font-awesome'}
                      size={variables.iconSize}
                      color={colors.primary}
                      style={{ marginRight: helpers.resize(8) }}
                    />
                  )}
                  inputSearchStyle={global.dropdownInput}
                  style={global.dropdown}
                  selectedTextStyle={global.selectedTextStyle}
                />

                <BouncyCheckbox
                  isChecked={searchDesc}
                  onPress={(isChecked) => setSearchDesc(isChecked)}
                  text={<Text style={{ fontSize: helpers.resize(16), color: colors.primary }}>Search in <Text bold>item description</Text></Text>}
                  textStyle={{ textDecorationLine: 'none' }}
                  fillColor={colors.primary}
                  iconStyle={{ borderWidth: helpers.resize(3), borderColor: colors.primary }}
                  style={{ marginVertical: helpers.resize(16), alignSelf: 'center' }}
                  size={helpers.resize(26)}
                />

                <Pressable
                  style={[ global.modalButton, { marginHorizontal: 0 }, !searchTimeout && global.modalButtonActive ]}
                  onPress={() => {
                    void search();
                  }}
                  disabled={searchTimeout}
                >
                  <Text bold style={[ global.modalButtonText, !searchTimeout ? global.modalButtonTextActive : {} ]}>
                  SEARCH{timeoutLen > 0 && ` (${timeoutLen})`}
                  </Text>
                </Pressable>
              </ScrollView>
            </SafeAreaView>
          </Modal>

        </View>
      }

      <AnimatedFAB
        icon={() => (<Icon name={'search'} type={'feather'} size={variables.iconSize} color={colors.primary} />)}
        label={'Search'}
        extended={isExpanded}
        onPress={() => {
          if (loadedGames) setShowSheet(true);
          else {
            setErrorText('Steam market games list couldn\'t be loaded');
            setErrorSnack(true);
          }
        }}
        uppercase={false}
        visible={ loadedGames && !loadingResults }
        animateFrom={'right'}
        iconMode={'dynamic'}
        style={[ global.actionButtonRight ]}
        color={colors.primary}
      />

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
    </>
  );
}
