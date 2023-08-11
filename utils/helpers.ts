import { colors } from './../styles/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScaleState } from './store.ts';
import { IInventory, IInventoryGame, IInventoryItem, IInventoryResAsset, IInventoryResDescriptionDescription, IInventoryResDescriptionTag,
  ISteamProfile, ISticker } from './types.ts';

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
  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

    if (count === 0) {
      return undefined;
    }

    // eslint-disable-next-line max-len
    html = html.replaceAll(`<br><div id="sticker_info" name="sticker_info" title="${this.capitalize(type)}" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>`, '');
    html = html.replaceAll('</center></div>', '');
    html = html.replaceAll('<img width=64 height=48 src="', '');
    html = html.replaceAll(`<br>${this.capitalize(type)}: `, '');
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
  pastelify(color: string, white = 255) {
    if (!color) {
      return colors.text;
    }
    color = color.replace('#', '');
    const matched = Array.from(color.match(/.{1,2}/g)!);
    const rgb: number[] = [];
    matched.forEach(c => rgb.push(Math.ceil((parseInt(c, 16) + white) / 2)));
    return `rgb(${rgb.join(',')})`;
  },
  transparentize(color: string, opacity: number) {
    const alpha = (Math.round(opacity * 255)).toString(16);
    const opaqueColor = `${color}${alpha}`;
    if (opaqueColor.includes('#')) {
      return opaqueColor;
    }
    return `#${opaqueColor}`;
  },
  timeAgo(time: number, ms = false) {
    if (ms) {
      time = Math.round(time / 1000);
    }
    const days = Math.floor(time / (24 * 60 * 60));
    const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    return `${days} days ${hours} hours ${minutes} minutes ago`;
  },
  inventory: {
    getRarity(tags: IInventoryResDescriptionTag[]) {
      return tags.find(tag => tag.category.toLowerCase() === 'rarity')?.localized_tag_name;
    },
    getRarityColor(tags: IInventoryResDescriptionTag[]) {
      return tags.find(tag => tag.category.toLowerCase() === 'rarity')?.color || colors.textAccent;
    },
    isEmpty(inventory: IInventory) {
      let len = 0;
      Object.keys(inventory).forEach(key => {
        len += inventory[parseInt(key, 10)].items.length;
      });
      return len === 0;
    },
    itemType(item: IInventoryItem): string {
      if (item.appid === 232090) {
        return 'None';
      }
      if (item.tags) {
        return item.tags[0].localized_tag_name;
      }
      if (item.type) {
        return item.type;
      }
      return 'None';
    },
    gameItemsPrice(items: IInventoryItem[]): number {
      let price = 0;
      items.forEach(item => {
        price += item.price.price * item.amount;
      });
      return price;
    },
    appliedValue(rate: number, stickers: ISticker, prices: { [key: string]: { Price: number } } ) {
      let total = 0;
      stickers.stickers.forEach(sticker => {
        const price = prices[sticker.long_name]?.Price || 0;
        total += Math.round(price * 100 * rate) / 100;
      });
      return total;
    },
  },
};
