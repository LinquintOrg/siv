import { create } from 'zustand';

import type { InventoryItem } from '@/api/types';
import { itemPrice } from '@/utils/steam';

export const SORTS = {
  'total-desc': 'Total value',
  'price-desc': 'Price: high to low',
  'price-asc': 'Price: low to high',
  'amount-desc': 'Quantity',
  name: 'Name',
} as const;

export type SortKey = keyof typeof SORTS;

interface InventoryViewState {
  query: string;
  sort: SortKey;
  pricedOnly: boolean;
  tradableOnly: boolean;
  setQuery: (query: string) => void;
  setSort: (sort: SortKey) => void;
  togglePriced: () => void;
  toggleTradable: () => void;
  reset: () => void;
}

/**
 * Filter and sort for the open inventory. Shared with the item screen so its
 * previous/next buttons follow the same order as the grid.
 */
export const useInventoryView = create<InventoryViewState>()(set => ({
  query: '',
  sort: 'total-desc',
  pricedOnly: false,
  tradableOnly: false,
  setQuery: query => set({ query }),
  setSort: sort => set({ sort }),
  togglePriced: () => set(state => ({ pricedOnly: !state.pricedOnly })),
  toggleTradable: () => set(state => ({ tradableOnly: !state.tradableOnly })),
  reset: () => set({ query: '', pricedOnly: false, tradableOnly: false }),
}));

export function visibleItems(items: InventoryItem[], view: Pick<InventoryViewState, 'query' | 'sort' | 'pricedOnly' | 'tradableOnly'>) {
  const q = view.query.trim().toLowerCase();
  const price = (i: InventoryItem) => itemPrice(i) ?? -1;
  const filtered = items.filter(item =>
    (!view.pricedOnly || itemPrice(item) !== null)
    && (!view.tradableOnly || item.tradable)
    && (!q || item.name.toLowerCase().includes(q) || item.itemType.toLowerCase().includes(q)),
  );
  switch (view.sort) {
    case 'total-desc':
      return filtered.sort((a, b) => price(b) * b.amount - price(a) * a.amount);
    case 'price-desc':
      return filtered.sort((a, b) => price(b) - price(a));
    case 'price-asc':
      // Unpriced items go last
      return filtered.sort((a, b) => (itemPrice(a) ?? Infinity) - (itemPrice(b) ?? Infinity));
    case 'amount-desc':
      return filtered.sort((a, b) => b.amount - a.amount);
    case 'name':
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
}
