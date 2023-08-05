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
