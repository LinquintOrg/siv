export interface IExchangeRate {
  code: string;
  rate: number;
}

export interface IInventoryGame {
  appid: string;
  img: string;
  name: string;
}

export interface ISteamProfile {
  id: string;
  name: string;
  url: string;
  public: boolean;
  state: number;
}

export interface IMusicKit {
  id: number;
  artist: string;
  title: string;
  image: string;
  folder: string;
  price: {
    normal: number;
    stattrak: number;
  };
}

export interface IMusicKitsRes {
  kits: IMusicKit[];
}

export interface IVanityRes {
  response: {
    steamid: string;
    success: 0 | 1;
  }
}

export interface ISteamUser {
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
}

export interface ISteamUserRes {
  response: {
    players: ISteamUser[];
  };
}

export interface ISteamInventoryAsset {
  appid: number;
  contextid: '2';
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

export interface ISteamInventoryDescriptionDescription {
  type: string;
  value: string;
  color?: string;
}

export interface ISteamInventoryDescriptionTag {
  category: string;
  internal_name: string;
  localized_category_name: string;
  localized_tag_name: string;
}

export interface ISteamInventoryDescription {
  appid: number;
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  icon_url_large: string;
  tradable: 0 | 1;
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  commodity: 0 | 1;
  market_tradable_restriction: number;
  marketable: 0 | 1;
  descriptions: ISteamInventoryDescriptionDescription[];
  tags: ISteamInventoryDescriptionTag[];
  actions: {
    link: string;
    name: string;
  }[];
  market_actions: {
    link: string;
    name: string;
  }[];
  fraudwarnings?: string[];
}

export interface ISteamInventoryRes {
  assets: ISteamInventoryAsset[];
  descriptions: ISteamInventoryDescription[];
  total_inventory_count: number;
  success: 0 | 1;
  rwgrsn: number;
}

export interface IPricesReq {
  data: {
    appid: number;
    items: string[];
  }[];
}

export interface IItemPriceRes {
  price: number;
  listed: number;
  ago: number;
  avg24: number;
  avg7: number;
  avg30: number;
  min: number;
  max: number;
  p30ago: number;
  p90ago: number;
  p24ago: number;
  yearAgo: number;
  addedOn: string;
  found: boolean;
}

export interface IPricesRes {
  [appid: string]: {
    [hash: string]: IItemPriceRes;
  };
}

export interface IPriceDiff {
  day: { percent: number; amount: number };
  month: { percent: number; amount: number };
  threeMonths: { percent: number; amount: number };
  year: { percent: number; amount: number };
}

export interface IItemPrice extends IItemPriceRes {
  difference: IPriceDiff;
}

export interface IItemSticker {
  name: string;
  img: string;
  longName: string;
}

export interface IItem extends ISteamInventoryDescription {
  price: IItemPrice;
  amount: number;
  stickers?: IItemSticker[];
  patches?: IItemSticker[];
  charms?: IItemSticker[];
}

export interface IInventories {
  [appid: string]: IItem[];
}

export interface ISummaryBase {
  totalValue: number;
  itemCount: number;
  sellableItems: number;
  avg24: number;
  avg7: number;
  avg30: number;
  p24ago: number;
  p30ago: number;
  p90ago: number;
  yearAgo: number;
}

export interface IGameSummary extends ISummaryBase {
  game: IInventoryGame;
  withNameTag?: number;
  withStickers?: number;
  withPatches?: number;
  withCharms?: number;
  stickerValue?: number;
  patchValue?: number;
  charmValue?: number;
}

export interface ISummary extends ISummaryBase {
  profile: ISteamProfile;
  games: IGameSummary[];
  currency: IExchangeRate;
}

export interface IFilterOptions {
  nonMarketable: boolean;
  nonTradable: boolean;
  applied: boolean;
}

export interface ISortOptions {
  by: number; // 0 - default, 1 - Name, 2 - Price, 3 - Profit/Loss (Amount), 4 - Profit/Loss (Percent)
  order: 'desc' | 'asc';
  period: 'day' | 'month' | 'threeMonths' | 'year';
}
