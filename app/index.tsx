import Button from '@/Button';
import Input from '@/Input';
import Loader from '@/Loader';
import Profile from '@/Profile';
import Text from '@/Text';
import api from '@utils/api';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { colors, global, variables } from 'styles/global';
import styles from 'styles/pages/profile';
import { ISteamProfile, ISteamUser } from 'types';

export default function HomePage() {
  const $api = new api();

  const [ search, setSearch ] = useState('');
  const [ searching, setSearching ] = useState(false);
  const [ foundProfile, setFoundProfile ] = useState<ISteamUser | null>(null);
  const [ savedProfiles, setSavedProfiles ] = useState<ISteamProfile[]>([]);

  useEffect(() => {
    async function prepare() {
      try {
        const profiles = await sql.getAllProfiles();
        setSavedProfiles(profiles);
      } catch (err) {
        console.error(err);
      }
    }
    prepare();
  });

  async function onSubmitSearch() {
    let idInput = search.trim();

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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    } finally {
      setSearch('');
      setFoundProfile(null);
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
        searching || foundProfile ?
          <View style={styles.section}>
            {
              searching
                ? <Loader text='Finding profile...' />
                : !!foundProfile ?
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
                  </View> : null
            }
          </View> : null
      }

      <Text bold style={global.title}>Saved Profiles</Text>
      {
        savedProfiles.map(profile => (
          <Profile profile={profile} key={profile.id} />
        ))
      }
    </>
  );
}
