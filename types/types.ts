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

export interface IVanityRes {
  response: {
    steamid: string;
    success: 0 | 1;
  }
}

export interface ISteamUser {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  commentpermission: number;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  realname: string;
  primaryclanid: string;
  timecreated: number;
  personastateflags: number;
  loccountrycode: string;
}

export interface ISteamUserRes {
  response: {
    players: ISteamUser[];
  };
}
