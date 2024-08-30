import { ImmutableObject, State, hookstate, useHookstate } from '@hookstate/core';
import { ICurrency } from './types';
import { Dimensions } from 'react-native';
import { ISteamProfile } from 'types';

const rate = hookstate<string>('EUR');
const rates = hookstate<ICurrency[]>([]);
const profiles = hookstate<ISteamProfile[]>([]);
const preloaded = hookstate<boolean>(false);
const scale = hookstate(Dimensions.get('window').width / 423);

function object<T>(value: ImmutableObject<T>): T {
  return JSON.parse(JSON.stringify(value)) as unknown as T;
}

const wrapRate = (s: State<string>) => ({
  get: () => s.value,
  set: (newState: string) => s.set(() => newState),
});

const wrapRates = (s: State<ICurrency[]>) => ({
  getAll: () => s.value.map(item => object<ICurrency>(item)),
  getOne: (id: number): ICurrency => {
    if (id < s.value.length) {
      return s.value[id];
    }
    return s.value.at(-1)!;
  },
  set: (newRates: ICurrency[]) => s.set(() => newRates),
});

const wrapProfiles = (s: State<ISteamProfile[]>) => ({
  getAll: () => s.value.map(item => object<ISteamProfile>(item)),
  getByID: (id: string): ISteamProfile | undefined => {
    const obj = s.value.map(item => object<ISteamProfile>(item));
    return obj.find(p => p.id === id);
  },
  add: (newProfile: ISteamProfile) => s.set(val => [ ...val, newProfile ]),
  set: (newProfiles: ISteamProfile[]) => s.set(() => newProfiles),
  delete: (id: string) => s.set(val => val.filter(p => !(p.id === id))),
  exists: (id: string) => s.value.some(p => p.id === id),
});

const wrapPreloaded = (s: State<boolean>) => ({
  get: () => s.value,
  set: (newState: boolean) => s.set(() => newState),
});

const wrapScale = (s: State<number>) => ({
  get: () => s.value,
});

export const useRateState = () => wrapRate(useHookstate(rate));
export const useRatesState = () => wrapRates(useHookstate(rates));
export const useProfilesState = () => wrapProfiles(useHookstate(profiles));
export const usePreloadedState = () => wrapPreloaded(useHookstate(preloaded));
export const useScaleState = () => wrapScale(scale);

export function useStore() {
  useRateState();
  useRatesState();
  useProfilesState();
  usePreloadedState();
  useScaleState();
}
