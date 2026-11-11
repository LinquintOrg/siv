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
  avg90?: number | null;
  avg365?: number | null;
  min?: number | null;
  max?: number | null;
  p24ago?: number | null;
  p30ago?: number | null;
  p90ago?: number | null;
  yearAgo?: number | null;
  /** Lowest and highest price per period, and the price at its start */
  ranges?: PriceRanges;
  /** [ day as "YYYY-MM-DD" (UTC), average price, average listings ] for the last 30 days, oldest first */
  daily?: [ string, number, number ][] | null;
}

export type PriceRangePeriod = '7d' | '30d' | '90d' | '1y' | 'all';
export interface PriceRange {
  low: number | null;
  high: number | null;
  /** The price at the start of the period, to measure the change from */
  from: number | null;
}
export type PriceRanges = Record<PriceRangePeriod, PriceRange>;

export type InventoryHistoryRange = '30d' | '90d' | '1y' | 'all';

/** Marketplaces with prices besides Steam's (CS2, Dota 2 and Rust) */
export type MarketSource = 'skinport' | 'waxpeer';

/** An item's price on a marketplace, in USD */
export interface MarketPrice {
  /** The cheapest listing, or Skinport's suggested price when nothing is listed */
  price: number;
  /** The cheapest listing; null when nothing is listed */
  lowest: number | null;
  suggested: number | null;
  /** The highest buy order: about what selling right now gets (Waxpeer) */
  buyOrder: number | null;
  listed: number;
  /** The item's page there (its phase's for Dopplers) */
  url: string | null;
}

/** An inventory's value at each marketplace's prices; null where none of its items has one */
export type MarketValues = Partial<Record<MarketSource, number | null>>;

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
  /** The first copy's asset ID; copies that differ (float, pattern) are separate items */
  assetid?: string;
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
  /** CS2 skins: the floats the skin can have */
  floatRange?: { min: number; max: number };
  /** CS2 Dopplers: the phase ("Phase 2", "Ruby"...). Steam's price is the same for every phase */
  phase?: string;
  collection?: string;
  stickers?: ItemSticker[];
  patches?: ItemSticker[];
  charms?: ItemSticker[];
  price: ItemPrice | { found: false };
  /** CS2, Dota 2 and Rust: each marketplace with a price, of the item's phase for Dopplers */
  markets?: Partial<Record<MarketSource, MarketPrice>>;
  /**
   * The price the item counts at in the inventory's value: Steam's, or Skinport's when Steam's is over a month old or
   * missing. Missing when neither has one (and from APIs before it)
   */
  valuePrice?: { price: number; source: 'steam' | MarketSource };
}

export interface InventoryHistoryEntry {
  inventoryValue: number;
  /** The value at each marketplace's prices; null for lookups from before they were kept */
  marketValues?: MarketValues | null;
  itemCount: number;
  searchedAt: string;
}

/** A change in an inventory's value, split into what prices did and what came and went */
export interface InventoryChange {
  since: string;
  /** Who checked it then: you, anyone looking it up, or the daily leaderboard update */
  by: 'you' | 'search' | 'cron';
  valueThen: number;
  valueNow: number;
  price: number;
  added: { count: number; value: number };
  removed: { count: number; value: number };
}

export interface InventoryResponse {
  items: InventoryItem[];
  history: InventoryHistoryEntry[];
  rank: number | null;
  /** Since the last lookup (the daily leaderboard update doesn't count), a week and a month ago */
  changes?: {
    last: InventoryChange | null;
    week: InventoryChange | null;
    month: InventoryChange | null;
  } | null;
  /** CS2, Dota 2 and Rust: the value at each marketplace's prices (Dopplers by phase); null for other games */
  marketValues?: MarketValues | null;
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

export type ItemHistoryRange = '30d' | '90d' | '1y' | 'all';

/** An item's market page (GET /item): its price summary, history and, for CS2, its versions, cases and related items */
export interface MarketItemPage {
  item: {
    hash: string;
    appid: number;
    image: string | null;
    type: string | null;
    /** CS2 skins: the floats the skin can have */
    floatRange?: { min: number; max: number };
  };
  game: string | null;
  price: {
    latest: number;
    listed: number | null;
    updatedAt: string;
    avg24: number | null;
    avg7: number | null;
    avg30: number | null;
    avg90: number | null;
    avg365: number | null;
    min: number | null;
    max: number | null;
    p24ago: number | null;
    p30ago: number | null;
    p90ago: number | null;
    yearAgo: number | null;
    firstSeen: string | null;
    ranges?: PriceRanges;
  } | null;
  /** 24 hour sales, for the items the API checks (the most listed) */
  sales?: { volume: number; median: number | null; updatedAt: string } | null;
  variants?: {
    hash: string;
    wear: string | null;
    quality: 'normal' | 'stattrak' | 'souvenir';
    price: number | null;
    listed: number | null;
  }[];
  containers?: { slug: string; kind: 'case' | 'collection'; name: string }[];
  related?: { hash: string; image: string | null; price: number; rarity: string; color: string | null }[];
  history: {
    range: ItemHistoryRange;
    bucket: 'day' | 'week';
    /** [ day or week as "YYYY-MM-DD", average price, average listings ], oldest first */
    points: [ string, number, number ][];
  };
  /** CS2, Dota 2 and Rust: each marketplace with a price and its history over the same range */
  markets?: MarketItemMarket[];
}

export interface MarketItemMarket extends MarketPrice {
  source: MarketSource;
  name: string;
  updatedAt: string;
  /** Dopplers: each phase. Empty for other items */
  versions: (MarketPrice & { version: string })[];
  history: {
    /** The phase charted (version=), null for items without phases */
    version: string | null;
    /** [ day or week, average price, average listings ], oldest first */
    points: [ string, number, number ][];
  };
}
