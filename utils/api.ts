import axios, { AxiosInstance } from 'axios';
import { IExchangeRate, IInventoryGame, IMusicKitsRes, ISteamUser, ISteamUserRes, IVanityRes } from 'types';

export default class api {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: 'https://linquint.dev/api' });
  }

  public async getRates(): Promise<IExchangeRate[]> {
    const ratesRes = await this.axiosInstance.get<IExchangeRate[]>('/rates');
    return ratesRes.data;
  }

  public async getInventoryGames(): Promise<IInventoryGame[]> {
    const gamesRes = await this.axiosInstance.get<IInventoryGame[]>('/games/inventory');
    return gamesRes.data;
  }

  public async getMusicKits(): Promise<IMusicKitsRes> {
    const musicKits = await this.axiosInstance.get<IMusicKitsRes>('/musickits');
    return musicKits.data;
  }

  public async findSteamIdFromVanity(str: string): Promise<string | null> {
    // eslint-disable-next-line max-len
    const vanityRes = await this.axiosInstance.get<IVanityRes>(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.EXPO_PUBLIC_STEAM_KEY}&vanityurl=${str}`);
    if (vanityRes.data.response.success) {
      return vanityRes.data.response.steamid;
    }
    return null;
  }

  public async findSteamProfile(str: string): Promise<ISteamUser | null> {
    // eslint-disable-next-line max-len
    const profileRes = await this.axiosInstance.get<ISteamUserRes>(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.EXPO_PUBLIC_STEAM_KEY}&steamids=${str}`);
    if (profileRes.data.response.players.length > 0) {
      return profileRes.data.response.players[0];
    }
    return null;
  }

  public async batchSteamProfiles(ids: string[]): Promise<ISteamUser[]> {
    // eslint-disable-next-line max-len
    const profilesRes = await this.axiosInstance.get<ISteamUserRes>(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.EXPO_PUBLIC_STEAM_KEY}&steamids=${ids.join(',')}`);
    return profilesRes.data.response.players;
  }
}
