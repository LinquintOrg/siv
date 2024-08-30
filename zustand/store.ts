import { IExchangeRate, IInventories, IInventoryGame } from 'types';
import { create } from 'zustand';

interface IStore {
  games: IInventoryGame[];
  inventory: IInventories;
  stickerPrices: { [hash: string]: number }
  currency: IExchangeRate;
  setGames: (games: IInventoryGame[]) => void;
  setInventory: (inv: IInventories) => void;
  setCurrency: (c: IExchangeRate) => void;
}

const useStore = create<IStore>()(set => ({
  games: [],
  inventory: {},
  stickerPrices: {},
  currency: { code: 'USD', rate: 1 },
  setGames: (games: IInventoryGame[]) => set(() => ({ games })),
  setInventory: (inv: IInventories) => set(() => ({ inventory: inv })),
  setCurrency: (c: IExchangeRate) => set(() => ({ currency: c })),
}));

export default useStore;
