import { IInventories, IInventoryGame } from 'types';
import { create } from 'zustand';

interface IStore {
  games: IInventoryGame[];
  inventory: IInventories;
  setGames: (games: IInventoryGame[]) => void;
  setInventory: (inv: IInventories) => void;
}

const useStore = create<IStore>()(set => ({
  games: [],
  inventory: {},
  setGames: (games: IInventoryGame[]) => set(() => ({ games })),
  setInventory: (inv: IInventories) => set(() => ({ inventory: inv })),
}));

export default useStore;