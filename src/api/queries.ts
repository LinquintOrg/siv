import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api } from './client';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const queryKeys = {
  profile: (steamid: string) => [ 'profile', steamid ] as const,
  inventory: (steamid: string, appid: number) => [ 'inventory', steamid, appid ] as const,
};

export function useRates() {
  return useQuery({ queryKey: [ 'rates' ], queryFn: api.rates, staleTime: 6 * HOUR });
}

export function useInventoryGames() {
  return useQuery({ queryKey: [ 'inventoryGames' ], queryFn: api.inventoryGames, staleTime: HOUR });
}

export function useProfile(steamid: string) {
  return useQuery({
    queryKey: queryKeys.profile(steamid),
    queryFn: () => api.searchProfile(steamid),
    staleTime: 10 * MINUTE,
  });
}

export function useInventory(steamid: string, appid: number) {
  return useQuery({
    queryKey: queryKeys.inventory(steamid, appid),
    queryFn: () => api.inventory(steamid, appid),
    staleTime: 5 * MINUTE,
    retry: 1,
  });
}

export function useLeaderboard(filters: { appid?: number; search?: string }) {
  return useInfiniteQuery({
    queryKey: [ 'leaderboard', filters ],
    queryFn: ({ pageParam }) => api.leaderboard({ ...filters, page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: last => last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    staleTime: 5 * MINUTE,
  });
}

export function useMusicKits() {
  return useQuery({ queryKey: [ 'musicKits' ], queryFn: api.musicKits, staleTime: HOUR });
}
