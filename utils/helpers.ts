import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRateState, useRatesState, useProfilesState } from './store.ts';
import { ISteamProfile } from './types.ts';

const rate = useRateState();
const rates = useRatesState();
const profiles = useProfilesState();

export const helpers = {
  isSteamIDValid(steamID: string) {
    return !(steamID == '' || steamID.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+/) || steamID.match(/[a-zA-Z]/) || steamID.length === 0);
  },
  async saveProfile(profile: ISteamProfile) {
    const exists = profiles.getByID(profile.id);
    if (exists) {
      throw new Error('Profile is already saved');
    }

    await AsyncStorage.setItem(profile.id, JSON.stringify(profile));
    profiles.add(profile);
  },
  async deleteProfile(id: string) {
    await AsyncStorage.removeItem(id);
    profiles.delete(id);
  },
  async saveSetting(name: string, value: number) {
    if (name === 'currency') {
      rate.set(value);
    }
    await AsyncStorage.setItem(name, JSON.stringify({ value }));
  },
  async updateProfiles() {
    const savedKeys = await AsyncStorage.getAllKeys();
    const savedData = await AsyncStorage.multiGet(savedKeys);
    console.log(JSON.stringify(savedData));

    // await AsyncStorage.getAllKeys(async (_err, keys) => {
    //   await AsyncStorage.multiGet(keys, async () => {
    //     const ids = [];
    //     for (const key of keys) {
    //       switch (key) {
    //       case 'currency': {
    //         setRate(JSON.parse(await AsyncStorage.getItem('currency')).val);
    //         break;
    //       }
    //       default: {
    //         if (!key.includes('prevGames')) {
    //           ids.push(key);
    //         }
    //       }
    //       }
    //     }

    //     await fetch('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + id + '&steamids=' + ids.join(','))
    //       .then(response => response.json())
    //       .then(async json => {
    //         let values = [];
    //         for (const user of json.response.players) {
    //           const tmp = {
    //             'id': user.steamid,
    //             'name': user.personaname,
    //             'url': user.avatarmedium,
    //             'public': user.communityvisibilitystate === 3,
    //             'state': user.personastate
    //           };

    //           await AsyncStorage.removeItem(user.steamid).then(async () => {
    //             await AsyncStorage.setItem(user.steamid, JSON.stringify(tmp)).then(async () => {
    //               values = values.concat([ tmp ]);
    //             });
    //           });
    //         }
    //         setUsers(values);
    //       });
    //   });
    // });
  },
  async deleteProfile(id: string) {
    await AsyncStorage.removeItem(id);
    const newUsers = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].id !== id) {
        newUsers.push(users[i]);
      }
    }
    setUsers(newUsers);
  }
};

