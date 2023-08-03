import { NavigationAction } from '@react-navigation/routers';
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

export interface IUserSave {
  id: number;
  public: boolean;
  state: number;
  url: string;
  name: string;
}

export interface IUserSavesProps {
  users: IUserSave[];
  nav: NavigationAction;
  loadInv: (nav: NavigationAction, id: number) => void;
  displayErr: () => void;
  toggleModal: (user: IUserSave) => void;
}

export interface ICurrency {
  abb: string;
  full: string;
  exc: number;
  flag: string;
  sym?: string;
}

export interface ISettingsProps {
  saveSetting: (title: string, value: number | string) => void;
  rates: ICurrency[];
  rate: number;
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

export interface ISteamProfile {
  id: string;
  name: string;
  url: string;
  public: boolean;
  state: string;
}

export interface IProfilesProps {
  onLayoutRootView: () => Promise<void>;
}
