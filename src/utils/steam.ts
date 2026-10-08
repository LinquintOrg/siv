import type { InventoryItem } from '@/api/types';

export function itemImageUrl(iconUrl: string, size?: number) {
  const base = `https://community.cloudflare.steamstatic.com/economy/image/${iconUrl}`;
  return size ? `${base}/${size}fx${size}f` : base;
}

export function marketListingUrl(appid: number, marketName: string) {
  return `https://steamcommunity.com/market/listings/${appid}/${encodeURIComponent(marketName)}`;
}

export function profileUrl(steamid: string) {
  return `https://steamcommunity.com/profiles/${steamid}`;
}

/** Stable key for an inventory item (one entry per classid/instanceid pair). */
export function itemKey(item: Pick<InventoryItem, 'classid' | 'instanceid'>) {
  return `${item.classid}_${item.instanceid}`;
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
