import { State, hookstate, useHookstate } from '@hookstate/core';
import { ICurrency, ISteamProfile } from './types';

const rate = hookstate<number>(46);
const rates = hookstate<ICurrency[]>([]);
const profiles = hookstate<ISteamProfile[]>([]);

const wrapRate = (s: State<number>) => ({
  get: () => s.value,
  set: (newState: number) => s.set(() => newState),
});

const wrapRates = (s: State<ICurrency[]>) => ({
  getAll: () => s.value,
  getOne: (id: number): ICurrency => {
    if (id < s.value.length) {
      return s.value[id];
    }
    return s.value.at(-1)!;
  },
  set: (newRates: ICurrency[]) => s.set(s => [ ...s, ...newRates ]),
});

const wrapProfiles = (s: State<ISteamProfile[]>) => ({
  getAll: () => s.value,
  getByID: (id: string): ISteamProfile | undefined => {
    return s.value.find(p => p.id === id);
  },
  add: (newProfile: ISteamProfile) => s.set(s => [ ...s, newProfile ]),
  set: (newProfiles: ISteamProfile[]) => s.set(newProfiles),
  delete: (id: string) => s.set(s => s.filter(p => !(p.id === id))),
});

export const useRateState = () => wrapRate(useHookstate(rate));
export const useRatesState = () => wrapRates(useHookstate(rates));
export const useProfilesState = () => wrapProfiles(useHookstate(profiles));
