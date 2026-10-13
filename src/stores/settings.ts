import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemePreference } from '@/theme';

interface SettingsState {
  currency: string;
  /** Dark by default; 'system' follows the phone's setting */
  theme: ThemePreference;
  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemePreference) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    set => ({
      currency: 'USD',
      theme: 'dark',
      setCurrency: currency => set({ currency }),
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
