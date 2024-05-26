export interface IExchangeRate {
  code: string;
  rate: number;
}

export interface IInventoryGame {
  appid: number;
  img: string;
  name: string;
}

export interface ISteamProfile {
  id: string;
  name: string;
  url: string;
  public: boolean;
  state: number;
}

export interface IMusicKit {
  artist: string;
  title: string;
  image?: string;
  price?: number;
  statPrice?: number;
}

export interface IMusicKitsRes {
  kits: IMusicKit[];
  count: number;
}
