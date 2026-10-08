import { IExchangeRate, IInventories, IInventoryGame, ISteamProfile, ISummary } from 'types';
import { create } from 'zustand';

interface IStore {
  games: IInventoryGame[];
  inventory: IInventories;
  stickerPrices: { [hash: string]: number };
  currency: IExchangeRate;
  summary: ISummary | null;
  isInventoryLoading: boolean;
  currentProfile: ISteamProfile | null;
  currencyNames: { [code: string]: { name: string; symbol: string } };

  setGames: (games: IInventoryGame[]) => void;
  setInventory: (inv: IInventories) => void;
  setCurrency: (c: IExchangeRate) => void;
  setSummary: (sum: ISummary) => void;
  setIsInventoryLoading: (isLoading: boolean) => void;
  setCurrentProfile: (profile: ISteamProfile | null) => void;
  setCurrencyNames: (names: { [code: string]: { name: string; symbol: string } }) => void;
}

const useStore = create<IStore>()(set => ({
  games: [],
  inventory: {},
  stickerPrices: {},
  currency: { code: 'USD', rate: 1 },
  summary: null,
  isInventoryLoading: false,
  currentProfile: null,
  currencyNames: {},
  setGames: (games: IInventoryGame[]) => set(() => ({ games })),
  setInventory: (inv: IInventories) => set(() => ({ inventory: inv })),
  setCurrency: (c: IExchangeRate) => set(() => ({ currency: c })),
  setSummary: (sum: ISummary) => set(() => ({ summary: sum })),
  setIsInventoryLoading: (isLoading: boolean) => set(() => ({ isInventoryLoading: isLoading })),
  setCurrentProfile: (profile: ISteamProfile | null) => set(() => ({ currentProfile: profile })),
  setCurrencyNames: (names: { [code: string]: { name: string; symbol: string } }) => set(() => ({ currencyNames: names })),
}));

export default useStore;
