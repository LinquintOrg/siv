import { router } from 'expo-router';

import type { InventoryItem } from '@/api/types';

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

export function itemPrice(item: InventoryItem): number | null {
  return item.price.found ? item.price.price ?? null : null;
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
