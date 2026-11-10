import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemePreference } from '@/theme';

interface SettingsState {
  currency: string;
  /** Dark by default; 'system' follows the phone's setting */
  theme: ThemePreference;
  /** Send crash and error reports to Sentry (release builds only) */
  crashReports: boolean;
  setCurrency: (currency: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setCrashReports: (crashReports: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    set => ({
      currency: 'USD',
      theme: 'dark',
      crashReports: true,
      setCurrency: currency => set({ currency }),
      setTheme: theme => set({ theme }),
      setCrashReports: crashReports => set({ crashReports }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
