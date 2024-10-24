import Button from '@/Button';
import Input from '@/Input';
import Loader from '@/Loader';
import Profile from '@/Profile';
import Text from '@/Text';
import api from '@utils/api';
import { helpers } from '@utils/helpers';
import { sql } from '@utils/sql';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { colors, global, templates } from 'styles/global';
import styles from 'styles/pages/profile';
import { IInventoryGame, ISteamProfile, ISteamUser } from 'types';
import useStore from 'store';
import { router, useFocusEffect } from 'expo-router';
import { Icon } from 'react-native-elements';
import { Dialog, Button as PaperButton } from 'react-native-paper';

export default function HomePage() {
  const $api = new api();
  const $store = useStore();

  const [ search, setSearch ] = useState('');
  const [ searching, setSearching ] = useState(false);
  const [ foundProfile, setFoundProfile ] = useState<ISteamUser | null>(null);
  const [ savedProfiles, setSavedProfiles ] = useState<ISteamProfile[]>([]);
  const [ pageInFocus, setPageInFocus ] = useState(false);
  const [ removalDialog, setRemovalDialog ] = useState<ISteamProfile | null>(null);

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
    if (pageInFocus && !savedProfiles.length) {
      prepare();
    }
  });

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

  function removeSearch() {
    setFoundProfile(null);
    setSearch('');
  }

  function goToInventory() {
    if (linkToInventory) {
      router.push(linkToInventory);
    }
  }

  function removeProfile(toRemove: ISteamProfile) {
    setRemovalDialog(toRemove);
  }

  async function confirmRemove() {
    try {
      const newPlayerList = await sql.deleteProfile(removalDialog!.id);
      setSavedProfiles(newPlayerList);
    } finally {
      setRemovalDialog(null);
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
          <Pressable style={styles.section} onLongPress={removeSearch}>
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
          </Pressable>
      }

      <Text style={global.title}>Saved Profiles</Text>
      <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center', marginTop: helpers.resize(-10), marginBottom: helpers.resize(12) } ]}>
        <Icon name='infocirlce' type='ant-design' color={colors.primary} />
        <Text style={{ fontSize: helpers.resize(15) }}>Long press profile to remove it</Text>
      </View>
      <ScrollView>
        {
          savedProfiles.map(profile => (
            <Profile profile={profile} key={profile.id} removeProfile={() => removeProfile(profile)} />
          ))
        }
      </ScrollView>

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

      {
        !!removalDialog &&
        <Dialog
          visible={!!removalDialog}
          onDismiss={() => setRemovalDialog(null)}
          theme={{
            colors: {
              primary: colors.primary,
              accent: colors.primary,
              backdrop: '#fff0',
            },
            roundness: helpers.resize(3),
          }}>
          <Dialog.Icon icon='alert' />
          <Dialog.Title style={{ fontSize: helpers.resize(24) }}>Remove this profile?</Dialog.Title>
          <Dialog.Content>
            <Text bold style={{ fontSize: helpers.resize(16) }}>{ removalDialog.name }</Text>
            <Text>{ removalDialog.id }</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton labelStyle={{ fontSize: helpers.resize(16) }} onPress={() => setRemovalDialog(null)}>
              Cancel
            </PaperButton>
            <PaperButton labelStyle={{ fontSize: helpers.resize(16), color: colors.error }} onPress={confirmRemove}>
              Delete
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      }
    </>
  );
}
