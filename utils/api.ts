/* eslint-disable max-len */
import axios, { AxiosInstance } from 'axios';
import { IExchangeRate, IInventoryGame, IMusicKitsRes, IPricesReq, IPricesRes, ISteamInventoryRes, ISteamUser, ISteamUserRes, IVanityRes } from 'types';

export default class api {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: 'https://linquint.dev/api' });
  }

  public async getRates(): Promise<IExchangeRate[]> {
    console.log('calling getRates');
    const ratesRes = await this.axiosInstance.get<IExchangeRate[]>('/rates');
    return ratesRes.data;
  }

  public async getInventoryGames(): Promise<IInventoryGame[]> {
    console.log('calling getInventoryGames');
    const gamesRes = await this.axiosInstance.get<IInventoryGame[]>('/games/inventory');
    return gamesRes.data;
  }

  public async getMusicKits(): Promise<IMusicKitsRes> {
    console.log('calling getMusicKits');
    const musicKits = await this.axiosInstance.get<IMusicKitsRes>('/musickits');
    return musicKits.data;
  }

  public async findSteamIdFromVanity(str: string): Promise<string | null> {
    console.log('calling findSteamIdFromVanity');
    const vanityRes = await this.axiosInstance.get<IVanityRes>(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.EXPO_PUBLIC_STEAM_KEY}&vanityurl=${str}`);
    if (vanityRes.data.response.success) {
      return vanityRes.data.response.steamid;
    }
    return null;
  }

  public async findSteamProfile(str: string): Promise<ISteamUser | null> {
    console.log('calling findSteamProfile');
    const profileRes = await this.axiosInstance.get<ISteamUserRes>(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.EXPO_PUBLIC_STEAM_KEY}&steamids=${str}`);
    if (profileRes.data.response.players.length > 0) {
      return profileRes.data.response.players[0];
    }
    return null;
  }

  public async batchSteamProfiles(ids: string[]): Promise<ISteamUser[]> {
    console.log('calling batchSteamProfiles');
    const profilesRes = await this.axiosInstance.get<ISteamUserRes>(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.EXPO_PUBLIC_STEAM_KEY}&steamids=${ids.join(',')}`);
    return profilesRes.data.response.players;
  }

  public async getInventory(steamId: string, appid: string) {
    console.log('calling getInventory');
    const inventoryRes = await this.axiosInstance.get<ISteamInventoryRes>(`https://steamcommunity.com/inventory/${steamId}/${appid}/2/?count=1000`);
    return inventoryRes.data;
  }

  public async getPrices(body: IPricesReq): Promise<IPricesRes> {
    console.log('calling getPrices');
    const pricesRes = await this.axiosInstance.post<IPricesRes>('/prices', body);
    return pricesRes.data;
  }

  public async getStickerPrices(stickers: string[]): Promise<{ [hash: string]: { price: number } }> {
    console.log('calling getStickerPrices');
    const pricesRes = await this.axiosInstance.post<{ [hash: string]: { price: number } }>('/stickers', stickers);
    return pricesRes.data;
  }

  public async devInventory(): Promise<ISteamInventoryRes> {
    console.log('calling devInventory');
    const inventoryRes = await this.axiosInstance.get<ISteamInventoryRes>('https://inventory.linquint.dev/api/Steam/dev/inv730.php');
    return inventoryRes.data;
  }
}
