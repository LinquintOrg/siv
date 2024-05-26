import axios, { AxiosInstance } from 'axios';
import { IMusicKitsRes } from 'types';

export default class api {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({ baseURL: 'https://linquint.dev/api' });
  }

  public async getMusicKits(): Promise<IMusicKitsRes> {
    const musicKits = await this.axiosInstance.get<IMusicKitsRes>('/musickits');
    return musicKits.data;
  }
}
