import { colors } from './../styles/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IInventory, IInventoryItem, IInventoryResAsset, IInventoryResDescriptionDescription, IInventoryResDescriptionTag,
  ISticker } from './types';
import { Dimensions } from 'react-native';
import { IExchangeRate, IGameSummary, IInventories, IItem, IItemPriceRes, ISteamInventoryAsset, ISteamInventoryDescriptionDescription,
  ISteamProfile, ISteamUser, ISummary, IInventoryGame, IFilterOptions,
  ISortOptions, IPriceDiff, IItemSticker } from 'types';
import { emptyBaseSummary } from './objects';

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
  clone<T>(obj: T): T {
    if (!obj) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  },
  isSteamIDValid(steamID: string) {
    return !(steamID === '' || /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/? ]+/.test(steamID) || /[a-zA-Z]/.test(steamID) || steamID.length === 0)
      && steamID.length === 17 && /^[0-9]+$/.test(steamID);
  },
  sleep(milliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  },
  resize(size: number) {
    const scale = Dimensions.get('window').width / 423;
    return Math.ceil(size * scale);
  },
  // ! Extend String
  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  price(currency: IExchangeRate, cost: number, count: number = 1): string {
    if (!cost) {
      cost = 0;
    }
    const unitPrice = +(cost * currency.rate).toFixed(2);
    return new Intl.NumberFormat('en-UK', { style: 'currency', currency: currency.code }).format(unitPrice * count);
  },
  priceAsNum(currency: IExchangeRate, cost: number, count: number = 1): number {
    if (!cost) {
      return 0;
    }
    const unitPrice = +(cost * currency.rate).toFixed(2);
    return unitPrice * count;
  },
  search(subject: string, query: string): boolean {
    if (!subject || !query) {
      return true;
    }
    const normalized = subject.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, ' ').toLowerCase();
    return normalized.includes(query.toLowerCase());
  },

  // * --- INVENTORY HELPERS --- *
  inv: {
    itemCount(assets: ISteamInventoryAsset[], classid: string, instanceid: string): number {
      return assets.filter(asset => asset.classid === classid && asset.instanceid === instanceid).length;
    },
    itemType(item: IItem): string {
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
    priceDiff(item: IItemPriceRes): IPriceDiff {
      if (!item.price) {
        return {
          day: { percent: 0, amount: 0 },
          month: { percent: 0, amount: 0 },
          threeMonths: { percent: 0, amount: 0 },
          year: { percent: 0, amount: 0 },
        };
      }
      return {
        day: {
          percent: item.p24ago > 0 ? (item.price - item.p24ago) / item.p24ago * 100 : 0,
          amount: item.p24ago > 0 ? item.price - item.p24ago : 0,
        },
        month: {
          percent: item.p30ago > 0 ? (item.price - item.p30ago) / item.p30ago * 100 : 0,
          amount: item.p30ago > 0 ? item.price - item.p30ago : 0,
        },
        threeMonths: {
          percent: item.p90ago > 0 ? (item.price - item.p90ago) / item.p90ago * 100 : 0,
          amount: item.p90ago > 0 ? item.price - item.p90ago : 0,
        },
        year: {
          percent: item.yearAgo > 0 ? (item.price - item.yearAgo) / item.yearAgo * 100 : 0,
          amount: item.yearAgo > 0 ? item.price - item.yearAgo : 0,
        },
      };
    },
    nametag(item: IItem): string {
      if (item.fraudwarnings && item.fraudwarnings.length > 0) {
        return `"${item.fraudwarnings[0].replaceAll('Name Tag: ', '').replaceAll('\'', '')}"`;
      }
      const description = item.descriptions.find(d => d.value.includes('Name Tag: '));
      if (description) {
        return `"${description.value.replaceAll('Name Tag: ', '').replaceAll('\'', '')}"`;
      }
      return '';
    },
    collection(item: IItem): string | null {
      const collectionTag = item.tags?.find(tag => [ 'Collection', 'Sticker Collection' ].includes(tag.localized_category_name));
      if (collectionTag) {
        return collectionTag.localized_tag_name;
      }
      return null;
    },
    findStickers(descriptions: ISteamInventoryDescriptionDescription[], searchType: 'sticker' | 'patch' | 'charm'): IItemSticker[] | undefined {
      const appliedItems = descriptions.find(d => d.value.includes(`title="${helpers.capitalize(searchType)}"`));
      if (!appliedItems) {
        return undefined;
      }

      let html = appliedItems.value;
      const count = (html.match(/img/g) || []).length;
      if (count === 0) {
        return undefined;
      }

      // eslint-disable-next-line max-len
      html = html.replaceAll(`<br><div id="sticker_info" name="sticker_info" title="${helpers.capitalize(searchType)}" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>`, '');
      html = html.replaceAll('</center></div>', '');
      html = html.replaceAll('<img width=64 height=48 src="', '');
      html = html.replaceAll(`<br>${helpers.capitalize(searchType)}: `, '');
      html = html.replaceAll('">', ';');

      let tmpArr = html.split(';');

      // Manage exceptions
      const exceptions = [ 'Rock, Paper, Scissors (Foil)' ];
      tmpArr = tmpArr.map(itm => {
        const included = exceptions.find(e => itm.includes(e));
        if (included) {
          const escapedName = included.replaceAll(',', ';');
          return itm.replace(included, escapedName);
        }
        return itm;
      });

      const tmpNames = tmpArr[count].replaceAll(', Champion', '; Champion').split(', ');
      tmpArr = tmpArr.splice(0, count);

      const tmpStickers = [];
      for (let j = 0; j < count; j++) {
        const abbreviation = `${helpers.capitalize(searchType)} | `;
        const sticker = {
          name: (tmpNames[j]).replace('; Champion', ', Champion').replaceAll(';', ','),
          img: tmpArr[j],
          longName: (abbreviation + tmpNames[j]).replace('; Champion', ', Champion').replaceAll(';', ','),
        };
        tmpStickers.push(sticker);
      }

      return tmpStickers;
    },
    stickersTotal(prices: { [hash: string]: number }, stickers: IItemSticker[], currency: IExchangeRate) {
      return stickers.reduce<number>((val, { longName }) => val += helpers.priceAsNum(currency, prices[longName]), 0);
    },
    // eslint-disable-next-line max-len
    generateSummary(profile: ISteamProfile, inventory: IInventories, gamesList: IInventoryGame[], currency: IExchangeRate, stickerPrices: { [hash: string]: number }): ISummary {
      const games: IGameSummary[] = [];

      Object.entries(inventory).map(([ appid, items ]) => {
        const gameSummary: IGameSummary = {
          ...helpers.clone(emptyBaseSummary),
          game: gamesList.find(g => g.appid === appid)!,
          withNameTag: appid === '730' ? 0 : undefined,
          withStickers: appid === '730' ? 0 : undefined,
          withPatches: appid === '730' ? 0 : undefined,
          withCharms: appid === '730' ? 0 : undefined,
          stickerValue: appid === '730' ? 0 : undefined,
          patchValue: appid === '730' ? 0 : undefined,
          charmValue: appid === '730' ? 0 : undefined,
        };

        for (const item of items) {
          gameSummary.totalValue += helpers.priceAsNum(currency, item.price.price, item.amount);
          gameSummary.itemCount += item.amount;
          gameSummary.sellableItems += item.marketable ? item.amount : 0;
          gameSummary.avg24 += helpers.priceAsNum(currency, item.price.avg24, item.amount);
          gameSummary.avg7 += helpers.priceAsNum(currency, item.price.avg7, item.amount);
          gameSummary.avg30 += helpers.priceAsNum(currency, item.price.avg30, item.amount);
          gameSummary.p24ago += helpers.priceAsNum(currency, item.price.p24ago, item.amount);
          gameSummary.p30ago += helpers.priceAsNum(currency, item.price.p30ago, item.amount);
          gameSummary.p90ago += helpers.priceAsNum(currency, item.price.p90ago, item.amount);
          gameSummary.yearAgo += helpers.priceAsNum(currency, item.price.yearAgo, item.amount);
          if (item.appid === 730) {
            gameSummary.withNameTag! += !!this.nametag(item) ? 1 : 0;
            gameSummary.withStickers! += item.stickers?.length ? 1 : 0;
            gameSummary.withPatches! += item.patches?.length ? 1 : 0;
            gameSummary.withCharms! += item.charms?.length ? 1 : 0;
            gameSummary.stickerValue! += item.stickers?.length ? this.stickersTotal(stickerPrices, item.stickers, currency) : 0;
            gameSummary.patchValue! += item.patches?.length ? this.stickersTotal(stickerPrices, item.patches, currency) : 0;
            gameSummary.charmValue! += item.charms?.length ? this.stickersTotal(stickerPrices, item.charms, currency) : 0;
          }
        }
        games.push(gameSummary);
      });

      return {
        games,
        profile,
        currency,
        totalValue: games.reduce<number>((val, game) => val += game.totalValue, 0),
        itemCount: games.reduce<number>((val, game) => val += game.itemCount, 0),
        sellableItems: games.reduce<number>((val, game) => val += game.sellableItems, 0),
        avg24: games.reduce<number>((val, game) => val += game.avg24, 0),
        avg7: games.reduce<number>((val, game) => val += game.avg7, 0),
        avg30: games.reduce<number>((val, game) => val += game.avg30, 0),
        p24ago: games.reduce<number>((val, game) => val += game.p24ago, 0),
        p30ago: games.reduce<number>((val, game) => val += game.p30ago, 0),
        p90ago: games.reduce<number>((val, game) => val += game.p90ago, 0),
        yearAgo: games.reduce<number>((val, game) => val += game.yearAgo, 0),
      };
    },
    isVisible(item: IItem, search: string, options: IFilterOptions): boolean {
      return ((options.nonMarketable || !!item.marketable)
        || (options.nonTradable || !!item.tradable))
        && (item.appid != 730 || !options.applied ||
          ((item.stickers?.length || 0) + (item.patches?.length || 0) + (item.charms?.length || 0)) > 0)
        && helpers.search(item.market_hash_name, search);
    },
    sortInventory(inventory: IItem[], options: ISortOptions): IItem[] {
      return inventory.sort((a, b) => {
        switch (options.by) {
        case 0: {
          return 0;
        };
        case 1: {
          if (options.order === 'asc') {
            return a.market_hash_name < b.market_hash_name ? -1 : 1;
          }
          return a.market_hash_name < b.market_hash_name ? 1 : -1;
        }
        case 2: {
          if (!a.price.found) {
            return 1;
          }
          if (!b.price.found) {
            return -1;
          }
          if (options.order === 'asc') {
            return a.price.price - b.price.price;
          }
          return b.price.price - a.price.price;
        }
        case 3: {
          if (!a.price.found) {
            return 1;
          }
          if (!b.price.found) {
            return -1;
          }
          if (options.order === 'asc') {
            switch (options.period) {
            case 'day': return b.price.difference.day.amount - a.price.difference.day.amount;
            case 'month': return b.price.difference.month.amount - a.price.difference.month.amount;
            case 'threeMonths': return b.price.difference.threeMonths.amount - a.price.difference.threeMonths.amount;
            case 'year': return b.price.difference.year.amount - a.price.difference.year.amount;
            }
          }
          switch (options.period) {
          case 'day': return a.price.difference.day.amount - b.price.difference.day.amount;
          case 'month': return a.price.difference.month.amount - b.price.difference.month.amount;
          case 'threeMonths': return a.price.difference.threeMonths.amount - b.price.difference.threeMonths.amount;
          case 'year': return a.price.difference.year.amount - b.price.difference.year.amount;
          }
        }
        case 4: {
          if (!a.price.found) {
            return 1;
          }
          if (!b.price.found) {
            return -1;
          }
          if (options.order === 'asc') {
            switch (options.period) {
            case 'day': return b.price.difference.day.percent - a.price.difference.day.percent;
            case 'month': return b.price.difference.month.percent - a.price.difference.month.percent;
            case 'threeMonths': return b.price.difference.threeMonths.percent - a.price.difference.threeMonths.percent;
            case 'year': return b.price.difference.year.percent - a.price.difference.year.percent;
            }
          }
          switch (options.period) {
          case 'day': return a.price.difference.day.percent - b.price.difference.day.percent;
          case 'month': return a.price.difference.month.percent - b.price.difference.month.percent;
          case 'threeMonths': return a.price.difference.threeMonths.percent - b.price.difference.threeMonths.percent;
          case 'year': return a.price.difference.year.percent - b.price.difference.year.percent;
          }
        }
        }
        return 0;
      });
    },
  },

  // * --- OLD HELPER FUNCTIONS THAT ARE REQUIRED TO MIGRATE SAVES --- *

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
  async loadDataForMigration(): Promise<{ currency?: number; profiles: ISteamProfile[] }> {
    const dataToMigrate: { currency?: number; profiles: ISteamProfile[] } = {
      profiles: [],
    };
    const savedKeys = await AsyncStorage.getAllKeys();
    for (const key of savedKeys) {
      if (key === 'currency') {
        dataToMigrate.currency = +JSON.parse(await AsyncStorage.getItem(key) || '').val;
      } else if (!key.startsWith('prevGames')) {
        const profile = JSON.parse(await AsyncStorage.getItem(key) || '') as ISteamProfile;
        dataToMigrate.profiles.push(profile);
      }
    }
    return dataToMigrate;
  },
  async saveSetting(name: string, value: number) {
    await AsyncStorage.setItem(name, JSON.stringify({ value }));
  },

  // * --- OLD HELPER FUNCTIONS --- *

  async loadPreviousGames(id: string): Promise<IInventoryGame[]> {
    const savedKeys = await AsyncStorage.getAllKeys();
    const savedGamesKey = savedKeys.find(key => key === `prevGames${id}`);
    if (savedGamesKey) {
      const games = await AsyncStorage.getItem(savedGamesKey);
      if (games) {
        return (JSON.parse(games) as IInventoryGame[]);
      }
    }
    return [];
  },
  async savePreviousGames(id: string, games: IInventoryGame[]): Promise<void> {
    if (games.length) {
      await AsyncStorage.setItem(`prevGames${id}`, JSON.stringify(games));
    } else {
      throw new Error('You must select at least one game.');
    }
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
  profile: {
    isVanity(vanity: string, profile: ISteamUser | null) {
      if (!profile) {
        return false;
      }
      let profileVanity = profile.profileurl.slice(0, profile.profileurl.length - 1);
      const slashId = profileVanity.lastIndexOf('/');
      profileVanity = profileVanity.slice(slashId + 1);
      return profileVanity === vanity.toLowerCase();
    },
  },
  inventory: {
    getRarity(tags: IInventoryResDescriptionTag[]) {
      return tags?.find(tag => tag.category.toLowerCase() === 'rarity')?.localized_tag_name;
    },
    getRarityColor(tags: IInventoryResDescriptionTag[]) {
      return tags?.find(tag => tag.category.toLowerCase() === 'rarity')?.color || colors.textAccent;
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
