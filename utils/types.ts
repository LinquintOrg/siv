import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode } from 'react';

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

export interface ISteamProfile {
  id: string;
  name: string;
  url: string;
  public: boolean;
  state: number;
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

export interface ILoaderProps {
  text?: string;
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
  appid: number;
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

export interface IInventoryResDescription {
  appid: number;
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  icon_url_large: string;
  tradable: number;
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  commodity: number;
  marketable: number;
  market_tradable_restriction: number;
  descriptions: IInventoryResDescriptionDescription[];
  actions: { link: string; name: string }[];
  owner_descriptions: { type: string; value: string; color?: string }[];
  market_actions: { link: string; name: string }[];
  tags: IInventoryResDescriptionTag[];
}

export interface IInventoryResponse {
  success: number;
  rwgrsn: number;
  total_inventory_count: number;
  assets: IInventoryResAsset[];
  descriptions: IInventoryResDescription[];
}

export interface IInventoryOmittedItem {
  classid: string;
  instanceid: string;
  icon_urL: string;
  tradable: number;
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  commodity: number;
  marketable: number;
  descriptions: IInventoryResDescriptionDescription[];
  owner_descriptions: { type: string; value: string; color?: string }[];
  tags: IInventoryResDescriptionTag[];
}

export interface IInventoryOmittedItemAmount extends IInventoryOmittedItem {
  amount: number;
}

export interface IInventoryItem extends IInventoryOmittedItem {

}

export interface IInventoryBase {
  [appid: number]: {
    count: number;
    items: IInventoryOmittedItemAmount[];
  }
}
