// Response shapes of the SIVExpress API (see SIVExpress/src/interfaces).

export interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  communityvisibilitystate: number;
  timecreated?: number;
  realname?: string;
  loccountrycode?: string;
}

export interface InventoryGame {
  appid: number;
  name: string;
  icon: string;
}

export interface ItemPrice {
  found: true;
  price?: number | null;
  listed?: number | null;
  ago?: number | null;
  avg24?: number | null;
  avg7?: number | null;
  avg30?: number | null;
  min?: number | null;
  max?: number | null;
  p24ago?: number | null;
  p30ago?: number | null;
  p90ago?: number | null;
  yearAgo?: number | null;
}

export interface ItemSticker {
  name: string;
  img: string;
  longName: string;
  price: number;
}

export interface InventoryItem {
  appid: number;
  classid: string;
  instanceid: string;
  iconUrl: string;
  tradable: boolean;
  marketable: boolean;
  commodity: boolean;
  name: string;
  marketName: string;
  nameColor: string;
  itemType: string;
  amount: number;
  inspectLink?: string;
  condition?: string;
  rarity?: {
    name: string;
    color: string | null;
  };
  nameTag?: string;
  description?: string;
  skinProps?: {
    float: string;
    pattern: number;
  };
  collection?: string;
  stickers?: ItemSticker[];
  patches?: ItemSticker[];
  charms?: ItemSticker[];
  price: ItemPrice | { found: false };
}

export interface InventoryHistoryEntry {
  inventoryValue: number;
  itemCount: number;
  searchedAt: string;
}

export interface InventoryResponse {
  items: InventoryItem[];
  history: InventoryHistoryEntry[];
  rank: number | null;
}

export interface ExchangeRates {
  [code: string]: {
    exchangeRate: number;
    name: string;
  };
}

export interface LeaderboardEntry {
  id: number;
  appid: number;
  steamid: string;
  username: string;
  avatar_url: string;
  inventory_value: number;
  item_count: number;
  last_updated: string;
  game_title: string;
  game_icon: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MusicKit {
  id: number;
  folder: string;
  image: string | null;
  artist: string;
  title: string;
  price: {
    normal: number | null;
    stattrak: number | null;
  };
}
