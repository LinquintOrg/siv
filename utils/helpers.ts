import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRateState, useProfilesState, useScaleState } from './store.ts';
import { IInventoryGame, ISteamProfile, TPagesType, TStackNavigationList } from './types.ts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export const helpers = {
  async waitUntil(condition: () => boolean, checkInterval = 100): Promise<void> {
    return new Promise(resolve => {
      if (condition()) {
        resolve();
      } else {
        setTimeout(() => {
          void this.waitUntil(condition, checkInterval);
          resolve();
        }, checkInterval);
      }
    });
  },
  isSteamIDValid(steamID: string) {
    return !(steamID == '' || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+/.test(steamID) || /[a-zA-Z]/.test(steamID) || steamID.length === 0)
      && steamID.length === 17 && /^[0-9]+$/.test(steamID);
  },
  sleep(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  },
  navigateToLoad(navigation: NativeStackScreenProps<TStackNavigationList>, screen: TPagesType) {
    navigation.navigation.navigate({ key: screen });
  },
  async saveProfile(profile: ISteamProfile) {
    const profiles = useProfilesState();
    const exists = profiles.getByID(profile.id);
    if (exists) {
      throw new Error('Profile is already saved');
    }

    await AsyncStorage.setItem(profile.id, JSON.stringify(profile));
    profiles.add(profile);
  },
  async deleteProfile(id: string) {
    const profiles = useProfilesState();
    await AsyncStorage.removeItem(id);
    profiles.delete(id);
  },
  async saveSetting(name: string, value: number) {
    if (name === 'currency') {
      const rate = useRateState();
      rate.set(value);
    }
    await AsyncStorage.setItem(name, JSON.stringify({ value }));
  },
  resize(size: number) {
    const scale = useScaleState();
    return Math.ceil(size * scale.get());
  },
  async loadPreviousGames(id: string): Promise<IInventoryGame[]> {
    const savedKeys = await AsyncStorage.getAllKeys();
    const savedGamesKey = savedKeys.find(key => key === `prevGames${id}`);
    if (savedGamesKey) {
      const games = await AsyncStorage.getItem(savedGamesKey);
      if (games) {
        return (JSON.parse(games) as { val: IInventoryGame[] }).val;
      }
    }
    return [];
  }
};
