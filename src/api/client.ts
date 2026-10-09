import type {
  ExchangeRates,
  InventoryGame,
  InventoryResponse,
  LeaderboardResponse,
  MusicKit,
  SteamProfile,
} from './types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.linquint.dev';

// Music kit audio files are served statically by the API under /music.
export const MUSIC_URL = process.env.EXPO_PUBLIC_MUSIC_URL ?? `${API_URL}/music`;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit & { query?: Record<string, string | number | undefined> }): Promise<T> {
  const url = new URL(API_URL + path);
  for (const [ key, value ] of Object.entries(init?.query ?? {})) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    ...init,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    // SIVExpress errors look like { operationId, message, details }
    const body = await res.json().catch(() => null) as { message?: string; details?: string } | null;
    throw new ApiError(res.status, body?.details || body?.message || `Request failed (${res.status})`);
  }
  return await res.json() as T;
}

export const api = {
  searchProfile: (search: string) => request<SteamProfile>('/steam/profile', {
    method: 'POST',
    body: JSON.stringify({ search }),
  }),

  // appid can arrive as a string (bigint columns), and screens look games up with ===
  inventoryGames: async () => (await request<InventoryGame[]>('/games/inventory')).map(g => ({ ...g, appid: Number(g.appid) })),

  inventory: (steamid: string, appid: number | string) => request<InventoryResponse>(`/inventory/${steamid}/${appid}`),

  rates: () => request<ExchangeRates>('/rates'),

  leaderboard: (query: { appid?: number; search?: string; page?: number; limit?: number }) =>
    request<LeaderboardResponse>('/leaderboard', { query }),

  musicKits: async () => (await request<{ kits: MusicKit[] }>('/musickits')).kits,

  musicKitFiles: (id: number) => request<string[]>(`/musickit/${id}`),
};
