import Button from '@/Button';
import Input from '@/Input';
import Loader from '@/Loader';
import Profile from '@/Profile';
import Text from '@/Text';
import api from '@utils/api';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { global } from 'styles/global';
import styles from 'styles/pages/profile';
import { IInventoryGame, ISteamProfile, ISteamUser } from 'types';
import useStore from 'store';
import { router, useFocusEffect } from 'expo-router';

export default function HomePage() {
  const $api = new api();
  const $store = useStore();

  const [ search, setSearch ] = useState('');
  const [ searching, setSearching ] = useState(false);
  const [ foundProfile, setFoundProfile ] = useState<ISteamUser | null>(null);
  const [ savedProfiles, setSavedProfiles ] = useState<ISteamProfile[]>([]);
  const [ pageInFocus, setPageInFocus ] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setPageInFocus(true);
      return () => {
        setPageInFocus(false);
      };
    }, []),
  );

  useEffect(() => {
    async function prepare() {
      const profiles = await sql.getAllProfiles();
      setSavedProfiles(profiles);
    }
    prepare();
  });

  async function onSubmitSearch() {
    let idInput = search.trim();
    if (!idInput.length || searching) {
      return;
    }

    try {
      setSearching(true);
      if (!helpers.isSteamIDValid(idInput)) {
        if (helpers.profile.isVanity(idInput, foundProfile)) {
          return;
        }
        const res = await $api.findSteamIdFromVanity(idInput);
        if (!res) {
          return;
        }
        idInput = res;
      }

      if (!helpers.isSteamIDValid(idInput)) {
        return;
      }

      const profile = await $api.findSteamProfile(idInput);
      setFoundProfile(profile);
    } finally {
      setSearching(false);
    }
  }

  async function saveProfile() {
    try {
      if (foundProfile) {
        const newProfile = {
          id: foundProfile.steamid,
          name: foundProfile.personaname,
          url: foundProfile.avatarmedium,
          public: foundProfile.communityvisibilitystate === 3,
          state: foundProfile.personastate,
        };
        await sql.upsertProfile(newProfile);
        setSavedProfiles(savedProfiles.concat(newProfile));
      }
    } finally {
      setSearch('');
      setFoundProfile(null);
    }
  }

  const loadedGames = useMemo<IInventoryGame[]>(() => {
    if (!$store.inventory || !$store.currentProfile) {
      return [];
    }
    return Object.keys($store.inventory).map(id => $store.games.find(({ appid }) => appid === id)!);
  }, [ $store ]);

  const linkToInventory = useMemo(() => {
    if (!$store.inventory || !$store.currentProfile) {
      return '';
    }
    return `/inventory/${$store.currentProfile.id}?games=${loadedGames.map(game => game.appid).join(',')}`;
  }, [ $store, loadedGames ]);

  function goToInventory() {
    if (linkToInventory) {
      router.push(linkToInventory);
    }
  }

  return (
    <>
      <Input
        icon={{ name: 'at-sign', type: 'feather' }}
        label='Profile search'
        value={search}
        onChange={setSearch}
        onSubmit={onSubmitSearch}
      />

      {
        (searching || foundProfile) &&
          <View style={styles.section}>
            {
              searching
                ? <Loader text='Finding profile...' />
                : foundProfile &&
                  <View style={styles.flowRow}>
                    <Image source={{ uri: foundProfile.avatarfull }} style={styles.image} />
                    <View style={styles.flowDown}>
                      <Text style={styles.profileName}>{ foundProfile.personaname }</Text>
                      <Text bold style={styles.profileID}>{ foundProfile.steamid }</Text>
                      <Button
                        text='SAVE'
                        textBold
                        onPress={saveProfile}
                      />
                    </View>
                  </View>
            }
          </View>
      }

      {
        (pageInFocus && ($store.isInventoryLoading || $store.inventory) && $store.currentProfile?.name) &&
        <>
          <Text style={global.title}>Loaded inventory</Text>
          <Pressable onPress={goToInventory}>
            <View style={styles.inventoryLoadingWrapper}>
              <Text bold style={styles.profileName}>{ $store.currentProfile.name }</Text>
              {
                $store.isInventoryLoading &&
                  <View style={styles.flowDown}>
                    <Loader size={'large'} text='Loading inventory...' />
                  </View>
              }
              {
                !$store.isInventoryLoading && $store.inventory && loadedGames.length &&
                  <View>
                    {
                      loadedGames.map(game => (
                        <View style={styles.gameWrapper}>
                          <Image source={{ uri: game.img }} style={styles.gameIcon} />
                          <Text bold style={styles.gameName}>{ game.name }</Text>
                        </View>
                      ))
                    }
                  </View>
              }
            </View>
          </Pressable>
        </>
      }

      <Text style={global.title}>Saved Profiles</Text>
      {
        savedProfiles.map(profile => (
          <Profile profile={profile} key={profile.id} />
        ))
      }
    </>
  );
}
