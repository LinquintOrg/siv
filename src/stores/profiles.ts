import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SteamProfile } from '@/api/types';

export interface SavedProfile {
  steamid: string;
  name: string;
  avatar: string;
}

const MAX_RECENT = 20;

interface ProfilesState {
  favorites: SavedProfile[];
  recent: SavedProfile[];
  addRecent: (profile: SteamProfile) => void;
  removeRecent: (steamid: string) => void;
  clearRecent: () => void;
  toggleFavorite: (profile: SteamProfile) => void;
}

export function toSavedProfile(profile: SteamProfile): SavedProfile {
  return { steamid: profile.steamid, name: profile.personaname, avatar: profile.avatarfull || profile.avatar };
}

export const useProfiles = create<ProfilesState>()(
  persist(
    set => ({
      favorites: [],
      recent: [],
      addRecent: profile => set(state => ({
        recent: [ toSavedProfile(profile), ...state.recent.filter(p => p.steamid !== profile.steamid) ].slice(0, MAX_RECENT),
        // Keep favourite names and avatars fresh
        favorites: state.favorites.map(p => p.steamid === profile.steamid ? toSavedProfile(profile) : p),
      })),
      removeRecent: steamid => set(state => ({ recent: state.recent.filter(p => p.steamid !== steamid) })),
      clearRecent: () => set({ recent: [] }),
      toggleFavorite: profile => set(state => ({
        favorites: state.favorites.some(p => p.steamid === profile.steamid)
          ? state.favorites.filter(p => p.steamid !== profile.steamid)
          : [ ...state.favorites, toSavedProfile(profile) ],
      })),
    }),
    {
      name: 'profiles',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useIsFavorite = (steamid: string) => useProfiles(state => state.favorites.some(p => p.steamid === steamid));
