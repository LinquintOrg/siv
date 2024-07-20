import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode } from 'react';
import { ISteamProfile } from 'types';

export interface ITextStyle {
  [key: string]: string | number;
}

export interface ITextStyleObject {
  [key: string]: ITextStyle;
}

export interface ITextProps {
  bold?: boolean;
  style?: ITextStyle | ITextStyleObject | ITextStyle[];
  children: ReactNode;
}

export interface IMusicKitPricesProps {
  kit: { artist: string; song: string };
  prices: { Hash: string; Price: number }[];
}

export interface IActionList {
  action: number;
  extra: string | number;
}

export interface IActionListProps {
  act: number;
  list: IActionList[];
  steamid: string;
}

export interface IUserSavesProps {
  navigation: NativeStackNavigationProp<TStackNavigationList, 'Home', undefined>;
  displayErr: () => void;
  toggleModal: (user: ISteamProfile) => void;
}

export interface ICurrency {
  abb: string;
  full: string;
  exc: number;
  flag: string;
  sym?: string;
}

export interface IMusicKit {
  artist: string;
  dir: string;
  img?: string;
  song: string;
}

export interface IMusicKitPrice {
  Hash: string;
  Price: number;
}

export interface IMusicKitProps {
  item: IMusicKit;
  play: (item: IMusicKit) => Promise<void>;
  search: string;
  prices: IMusicKitPrice[];
}

export interface IMusicKitsProps {
  kits: IMusicKit[];
}

export interface IProfilesProps {
  navigation: NativeStackNavigationProp<TStackNavigationList, 'Home', undefined>;
}

export interface IVanitySearchResponse {
  response: {
    steamid: string;
    success: number;
  }
}

export interface IPlayerSummariesResponse {
  response: {
    players: {
      steamid: string;
      communityvisibilitystate: number;
      profilestate: number;
      personaname: string;
      commentpermission: number;
      profileurl: string;
      avatar: string;
      avatarmedium: string;
      avatarfull: string;
      avatarhash: string;
      lastlogoff: number;
      personastate: number;
      realname: string;
      primaryclanid: string;
      timecreated: number;
      personastateflags: number;
      loccountrycode: string;
      locstatecode: string;
    }[];
  }
}

export const VPages: string[] = [ 'Profiles', 'Games', 'Inventory' ];
export type TPagesType = typeof VPages[number];

export interface INavigateToProps {
  steamid: string;
}

export type TStackNavigationList = {
  Home: undefined;
  Games: { steamId: string };
  Inventory: { games: IInventoryGame[], steamId: string };
};

export interface IInventoryGame {
  name: string;
  appid: string;
  classid: number;
  url: string;
}

export interface IChooseGamesProps {
  navigation: NativeStackNavigationProp<TStackNavigationList, 'Games', string>;
  route: RouteProp<TStackNavigationList, 'Games'>;
}

export interface IInventoryPageProps {
  route: RouteProp<TStackNavigationList, 'Inventory'>;
}

export interface IInventoryResAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

export interface IInventoryResDescriptionDescription {
  type: string;
  value: string;
  color?: string;
}

export interface IInventoryResDescriptionTag {
  category: string;
  internal_name: string;
  localized_category_name: string;
  localized_tag_name: string;
  color?: string;
}

export interface IInventoryOmittedItem {
  appid: number;
  classid: string;
  instanceid: string;
  icon_url: string;
  icon_url_large: string;
  tradable: number;
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  commodity: number;
  marketable: number;
  fraudwarnings?: string[];
  descriptions: IInventoryResDescriptionDescription[];
  owner_descriptions: { type: string; value: string; color?: string }[];
  tags: IInventoryResDescriptionTag[];
}

export interface IInventoryResDescription extends IInventoryOmittedItem {
  currency: number;
  background_color: string;
  market_hash_name: string;
  market_tradable_restriction: number;
  actions: { link: string; name: string }[];
  market_actions: { link: string; name: string }[];
}

export interface IInventoryResponse {
  success: number;
  rwgrsn: number;
  total_inventory_count: number;
  assets: IInventoryResAsset[];
  descriptions: IInventoryResDescription[];
}

export interface IInventoryOmittedItemAmount extends IInventoryOmittedItem {
  amount: number;
}

export interface IPriceBase {
  found: boolean;
}

export interface IPrice extends IPriceBase {
  price: number;
  listed: number;
  ago: number;
  avg24: number;
  avg7: number;
  avg30: number;
  min: number;
  max: number;
  p30ago: number;
  p24ago: number;
  p90ago: number;
}

export interface IPricesResponse {
  [appid: string]: {
    [hash: string]: IPriceBase | IPrice;
  }
}

export interface ISticker {
  type: string;
  sticker_count: number;
  stickers: { name: string; img: string; long_name: string; }[];
}

export interface IInventoryItem extends IInventoryOmittedItemAmount {
  price: IPrice;
  stickers?: ISticker;
}

export interface IInventoryBase {
  [appid: number]: {
    count: number;
    items: IInventoryOmittedItemAmount[];
  }
}

export interface IInventory extends IInventoryBase {
  [appid: number]: {
    count: number;
    items: IInventoryItem[];
  }
}

export interface IGameExtended extends IInventoryGame {
  price: number;
  items: number;
}

export interface IDisplayItemProps {
  item?: IInventoryItem;
  stickerPrices: { [hash: string]: { Price: number } };
}

export interface IGameStatistic {
  game: IInventoryGame;
  price: number;
  owned: number;
  ownedTradeable: number;
  avg24: number;
  avg7: number;
  avg30: number;
  p24ago: number;
  p30ago: number;
  p90ago: number;
  missingPrices: number;
  cheapest: {
    name: string;
    price: number;
  };
  expensive: {
    name: string;
    price: number;
  };
  stickersVal?: number;
  patchesVal?: number;
}

export interface IInventoryStats extends Omit<IGameStatistic, 'game'> {
  steamID: string;
  games: IGameStatistic[];
}

export interface ISteamMarketSearchData {
  query: string;
  search_descriptions: boolean;
  total_count: number;
  pagesize: number;
  prefix: string;
  class_prefix: string;
}

export interface ISteamMarketSearchResult {
  name: string;
  hash_name: string;
  sell_listings: number;
  sell_price: number;
  sell_price_text: string;
  app_icon: string;
  app_name: string;
  sale_price_text: string;
  asset_description: {
    appid: number;
    classid: string;
    instanceid: string;
    background_color: string;
    icon_url: string;
    tradable: number;
    name: string;
    name_color: string;
    type: string;
    market_name: string;
    market_hash_name: string;
    commodity: number;
  };
}

export interface ISteamMarketResponse {
  success: boolean;
  start: number;
  pagesize: number;
  total_count: number;
  searchdata?: ISteamMarketSearchData;
  results: ISteamMarketSearchResult[];
}

export interface IDropdownItem {
  value: number;
  label: string;
}
