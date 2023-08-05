import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScaleState } from './store.ts';
import { IInventoryGame, IInventoryResAsset, IInventoryResDescriptionDescription, ISteamProfile } from './types.ts';

/**
 * ! Helper functions should not be used with states store
 */

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
    return !(steamID == '' || /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/? ]+/.test(steamID) || /[a-zA-Z]/.test(steamID) || steamID.length === 0)
      && steamID.length === 17 && /^[0-9]+$/.test(steamID);
  },
  sleep(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  },
  async saveProfile(profile: ISteamProfile) {
    const exists = await AsyncStorage.getItem(profile.id);
    if (exists) {
      throw new Error('Profile is already saved');
    }
    await AsyncStorage.setItem(profile.id, JSON.stringify(profile));
  },
  async deleteProfile(id: string) {
    await AsyncStorage.removeItem(id);
  },
  async saveSetting(name: string, value: number) {
    await AsyncStorage.setItem(name, JSON.stringify({ value }));
  },
  resize(size: number) {
    return Math.ceil(size * useScaleState().get());
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
  },
  countItems(classid: string, instanceid: string, assetData: IInventoryResAsset[]) {
    const items = assetData.filter(asset => asset.classid === classid && asset.instanceid === instanceid);
    return items.length;
  },
  findStickers(descriptions: IInventoryResDescriptionDescription[]) {
    const htmlStickers = descriptions.find(d => d.value.includes('sticker_info'));
    if (!htmlStickers) {
      return undefined;
    }

    let html = htmlStickers.value;
    const count = (html.match(/img/g) || []).length;
    const type = (html.match('Sticker')) ? 'sticker' : 'patch';

    // eslint-disable-next-line max-len
    html = html.replaceAll(`<br><div id="sticker_info" name="sticker_info" title="${type.toUpperCase()}" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>`, '');
    html = html.replaceAll('</center></div>', '');
    html = html.replaceAll('<img width=64 height=48 src="', '');
    html = html.replaceAll(`<br>${type.toUpperCase()}: `, '');
    html = html.replaceAll('">', ';');

    let tmpArr = html.split(';');
    // eslint-disable-next-line max-len
    const tmpNames = tmpArr[count].replaceAll(', Champion', '; Champion').split(', ');
    tmpArr = tmpArr.splice(0, count);

    const tmpStickers = [];
    for (let j = 0; j < count; j++) {
      const abb = (type === 'sticker') ? 'Sticker | ' : 'Patch | ';
      const sticker = {
        name: (tmpNames[j]).replace('; Champion', ', Champion'),
        img: tmpArr[j],
        long_name: (abb + tmpNames[j]).replace('; Champion', ', Champion'),
      };
      tmpStickers.push(sticker);
    }

    return { type, sticker_count: count, stickers: tmpStickers };
  },
};
