import { router } from 'expo-router';

import type { InventoryItem, MarketSource } from '@/api/types';

/** Steam's image CDN; item icons (`icon_url` / `image`) are paths under it */
export const STEAM_IMAGE_BASE = 'https://community.cloudflare.steamstatic.com/economy/image/';

/** Full URL of a Steam item icon; `size` has Steam's CDN resize it to a square that size. Use ItemImage to show one */
export function itemImageUrl(iconUrl: string, size?: number) {
  const base = `${STEAM_IMAGE_BASE}${iconUrl}`;
  return size ? `${base}/${size}fx${size}f` : base;
}

export function marketListingUrl(appid: number, marketName: string) {
  return `https://steamcommunity.com/market/listings/${appid}/${encodeURIComponent(marketName)}`;
}

/** Opens an item's market page: its price history, statistics and other versions */
export function openMarketItem(appid: number | string, marketName: string) {
  router.push({ pathname: '/market/[appid]/[hash]', params: { appid: String(appid), hash: marketName } });
}

export function profileUrl(steamid: string) {
  return `https://steamcommunity.com/profiles/${steamid}`;
}

/** Stable key for an inventory item. Copies with different floats or patterns share a classid/instanceid pair */
export function itemKey(item: Pick<InventoryItem, 'classid' | 'instanceid' | 'assetid'>) {
  return [ item.classid, item.instanceid, item.assetid ].filter(Boolean).join('_');
}

/** Marketplaces besides Steam, in the order they're shown */
export const MARKET_SOURCES: MarketSource[] = [ 'skinport', 'waxpeer' ];
export const MARKET_NAMES: Record<MarketSource, string> = { skinport: 'Skinport', waxpeer: 'Waxpeer' };

/**
 * The price an item counts at, as the API counts it in the inventory value (and the leaderboard): Steam's, or
 * Skinport's when Steam's is over a month old or missing (`priceSource`)
 */
export function itemPrice(item: InventoryItem): number | null {
  if (item.valuePrice) {
    return item.valuePrice.price;
  }
  // An API from before valuePrice: Steam's
  return item.price.found ? item.price.price ?? null : null;
}

/** Where `itemPrice` is from; null without one */
export function priceSource(item: InventoryItem): 'steam' | MarketSource | null {
  if (item.valuePrice) {
    return item.valuePrice.source;
  }
  return item.price.found && item.price.price ? 'steam' : null;
}

/** An item's price on a marketplace, or null */
export function marketPrice(item: InventoryItem, source: MarketSource): number | null {
  return item.markets?.[source]?.price ?? null;
}

/** Steam colours come without '#'. */
export function steamColor(color: string | null | undefined) {
  if (!color) {
    return undefined;
  }
  return color.startsWith('#') ? color : `#${color}`;
}

/** Percentage change from `from` to `to`, or null when it can't be computed. */
export function percentChange(from: number | null | undefined, to: number | null | undefined) {
  if (!from || to === null || to === undefined) {
    return null;
  }
  return ((to - from) / from) * 100;
}

/** "12 min ago", "3 h ago", "5 days ago", or the date when it's over a month ago */
export function timeAgo(time: number | string | null | undefined) {
  if (time === null || time === undefined) {
    return '—';
  }
  const ms = typeof time === 'number' ? time : new Date(time).getTime();
  if (!Number.isFinite(ms)) {
    return '—';
  }
  const mins = Math.floor(Math.max(0, Date.now() - ms) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
