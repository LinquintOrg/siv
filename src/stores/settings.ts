import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  currency: string;
  themeMode: ThemeMode;
  setCurrency: (currency: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    set => ({
      currency: 'USD',
      themeMode: 'system',
      setCurrency: currency => set({ currency }),
      setThemeMode: themeMode => set({ themeMode }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
