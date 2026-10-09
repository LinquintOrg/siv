import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    set => ({
      currency: 'USD',
      setCurrency: currency => set({ currency }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
