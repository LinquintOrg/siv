import * as React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Snackbar, TextInput } from 'react-native-paper';
import UserSaves from '../components/UserSaves';
import { global, styles, colors, variables } from '../styles/global';
import { helpers } from '../utils/helpers';
import Text from '../components/Text';
import Modal from 'react-native-modal';
import NetInfo from '@react-native-community/netinfo';
import * as Sentry from 'sentry-expo';
import { IPlayerSummariesResponse, IProfilesProps, ISteamProfile, IVanitySearchResponse } from '../utils/types';
import Loader from '../components/Loader';
// import Clipboard from '@react-native-community/clipboard';
import { useProfilesState } from '../utils/store';
import { STEAM_API } from '@env';

export default function StackProfilesMain(props: IProfilesProps) {
  const profiles = useProfilesState();
  const [ steamIDtyped, setSteamIDtyped ] = React.useState<string>(''); // SteamID value (updates while being typed)
  const [ isLoading, setLoading ] = React.useState(false); // Are search results still loading
  const [ snackError, setSnackError ] = React.useState(false);
  const [ snackSuccess, setSnackSuccess ] = React.useState(false);
  const [ errorText, setErrorText ] = React.useState('');
  const [ successText, setSuccessText ] = React.useState('');
  const [ profile, setProfile ] = React.useState<ISteamProfile>({
    id: '', name: '', public: false, state: 3, url: 'https://inventory.linquint.dev/api/Files/img/profile.png',
  });
  const [ selectedProfile, setSelectedProfile ] = React.useState<ISteamProfile | undefined>(undefined);

  // TODO: [Pages/Profiles.tsx]: See if it would be possible to keep the same order when updating profiles.

  const getProfileData = async () => {
    // const id = STEAM_API;
    const id = '7401764DA0F7B99794826E9E2512E311';
    setLoading(true);
    const steamid = steamIDtyped;
    let validValue = helpers.isSteamIDValid(steamid);
    let p = { id: '', name: '', public: false, state: 3, url: 'https://inventory.linquint.dev/api/Files/img/profile.png' };

    const internetConnection = await NetInfo.fetch();
    if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
      setSnackError(true);
      setErrorText('No internet connection');
      return;
    }

    if (!helpers.isSteamIDValid(steamid)) {
      setProfileSearchText('Finding Steam profile...');
      try {
        const profileRes = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${id}&vanityurl=${steamid}`);
        const profileObj = await profileRes.json() as IVanitySearchResponse;

        if (profileObj.response.success == 0) {
          throw new Error('Profile not found');
        }
        validValue = true;
        p = { ...p, id: profileObj.response.steamid };
      } catch (err) {
        setSnackError(true);
        setErrorText((err as Error).message);
        Sentry.React.captureException(err);
        return;
      }
    } else {
      p = { ...p, id: steamid };
    }

    if (!validValue) {
      setLoading(false);
      return;
    }

    if (helpers.isSteamIDValid(p.id)) {
      setProfileSearchText('Getting Steam profile data...');
      try {
        const profilesRes = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${id}&steamids=${p.id}`);
        const profilesObj = await profilesRes.json() as IPlayerSummariesResponse;
        if (profilesObj.response.players.length === 0) {
          throw new Error('Profile not found');
        }
        p = {
          ...p,
          name: profilesObj.response.players[0].personaname,
          public: profilesObj.response.players[0].communityvisibilitystate === 3,
          state: profilesObj.response.players[0].personastate,
          url: profilesObj.response.players[0].avatarmedium,
        };
        setSnackSuccess(true);
        setSuccessText('Profile found');
      } catch (err) {
        if (snackError) {
          setSnackError(false);
        }
        setSnackError(true);
        setErrorText((err as Error).message);
        Sentry.React.captureException(err);
      } finally {
        setLoading(false);
        setProfile(p);
      }
    }
  };

  const [ isProfileModalVisible, setProfileModalVisible ] = React.useState(false);
  const [ profileSearchText, setProfileSearchText ] = React.useState('Getting Steam profile data...');

  const toggleModal = (profile: ISteamProfile) => {
    if (!isProfileModalVisible){
      setSelectedProfile(profile);
    }
    setProfileModalVisible(!isProfileModalVisible);
  };

  // TODO: [Profiles.tsx]: Clipboard library issue the same as inside the settings page.

  const copyToClipboard = async (copiedText: string | number) => {
    // Clipboard.setString(copiedText.toString());
    setSnackSuccess(true);
    setSuccessText('SteamID64 copied to clipboard');
    await helpers.sleep(3000);
    setSnackSuccess(false);
  };

  function displayPrivateProfileErr() {
    setSnackError(true);
    setErrorText('Selected profile privacy is set to PRIVATE');
  }

  // async function saveProfile() {
  //   const profileToSave = profile;
  //   if (profileToSave.public) {
  //     await helpers.saveProfile(profileToSave);
  //     return;
  //   }
  //   setSnackError(true);
  //   setErrorText('Profile privacy is set to PRIVATE');
  // }

  function clearProfileSearch() {
    setProfile({
      id: '', name: '', public: false, state: 3, url: 'https://inventory.linquint.dev/api/Files/img/profile.png',
    });
  }

  async function saveProfile() {
    try {
      await helpers.saveProfile(profile);
      profiles.add(profile);
      clearProfileSearch();
    } catch (err) {
      setSnackError(true);
      setErrorText((err as Error).message);
      Sentry.React.captureException(err);
    }
  }

  async function deleteProfile() {
    try {
      await helpers.deleteProfile(profile.id);
      profiles.delete(profile.id);
    } catch (err) {
      setSnackError(true);
      setErrorText((err as Error).message);
      Sentry.React.captureException(err);
    }
  }

  return (
    <View style={{ height: '100%' }}>
      <View style={global.inputView}>
        <TextInput
          style={ global.input }
          placeholder='Enter SteamID64'
          mode={'outlined'}
          onChangeText={text => setSteamIDtyped(text)}
          onSubmitEditing={() => void getProfileData()}
          label={'Steam ID64'}
          activeOutlineColor={ colors.primary }
          left={
            <TextInput.Icon
              icon={() => (<Icon name={'at-sign'} type={'feather'} color={colors.primary} />)}
              size={variables.iconSize}
              style={ global.inputIcon }
              forceTextInputFocus={false}
            />
          }
          right={
            <TextInput.Icon
              icon={() => (<Icon name={'search'} type={'feather'} color={'#1F4690'} />)}
              size={ variables.iconLarge }
              style={ global.inputIcon }
              onPress={() => void getProfileData() }
              forceTextInputFocus={false}
            />
          }
        />
      </View>
      <View style={[ global.row, styles.profileSearch.type, { justifyContent: 'space-between' } ]}>
        <Text>Searching by <Text bold>{ /[a-zA-Z]+/.test(steamIDtyped) ? 'CustomURL' : 'SteamID64' }</Text></Text>
        <Text style={[ steamIDtyped.length === 17 ? { color: colors.success }
          : { color: colors.error } ]}
        >
          { /[a-zA-Z]+/.test(steamIDtyped) ? '' : (steamIDtyped.length + ' / 17') }
        </Text>
      </View>

      {
        isLoading ?
          <Loader text={ profileSearchText } /> :
          <View style={[ styles.profileSearch.section, (profile.name === '' && profile.id === '') && { display: 'none' } ]}>
            <View style={global.row}>
              <Image style={styles.profileSearch.image} source={{ uri: profile.url }}/>
              <View style={styles.profileSearch.flowDown}>
                <Text bold style={styles.profileSearch.profileName}>{ profile.name }</Text>
                <Text bold style={styles.profileSearch.profileID}>{ profile.id }</Text>
              </View>
            </View>
            <View style={[ global.smallButtonRow, { marginTop: helpers.resize(8) } ]}>
              <TouchableOpacity style={global.buttonSmall} onPress={() => props.navigation.navigate('Games', { steamId: profile.id })}
                disabled={!helpers.isSteamIDValid(profile.id)}>
                <Text bold style={global.buttonText}>Load</Text>
              </TouchableOpacity>

              <TouchableOpacity style={global.buttonSmall}
                onPress={() => void saveProfile()}
                disabled={!helpers.isSteamIDValid(profile.id)}>
                <Text bold style={global.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
      }

      <Text bold style={[ global.title ]}>Saved profiles</Text>
      <Text style={ global.subtitle }>
        <Text bold>Tap</Text> to select profile
      </Text>
      <Text style={ global.subtitle }>
        <Text bold>Long press</Text> profile to see more options
      </Text>

      <UserSaves
        navigation={props.navigation}
        toggleModal={toggleModal}
        displayErr={displayPrivateProfileErr}
      />

      <Snackbar
        visible={snackSuccess}
        onDismiss={() => setSnackSuccess(false)}
        style={{ backgroundColor: colors.success }}
      >
        <View style={ global.row }>
          <Icon name={'check'} type={'font-awesome'} color={ colors.primary } size={ variables.iconSize } />
          <Text style={ global.snackbarText }>{ successText }</Text>
        </View>
      </Snackbar>

      <Snackbar
        visible={snackError}
        onDismiss={() => setSnackError(false)}
        style={{ backgroundColor: '#eb5855' }}
      >
        <View><Text style={ global.snackbarText }>{ errorText }</Text></View>
      </Snackbar>

      <Modal
        isVisible={isProfileModalVisible && !!selectedProfile}
        onBackdropPress={() => setProfileModalVisible(false)}
        animationIn={'swing'}
        animationOut={'fadeOut'}
        animationInTiming={500}
      >
        {
          selectedProfile ? <View style={ styles.profiles.modal }>
            <Text bold style={ global.title }>Choose an action</Text>
            <Text style={ styles.profiles.modalUser }>{ selectedProfile.name }</Text>

            <View style={[ global.column, { gap: helpers.resize(8) } ]}>
              <TouchableOpacity onPress={() => void deleteProfile()} style={[ global.buttonLarge, { marginVertical: 0 } ]}>
                <Text bold style={ global.buttonText }>Delete user</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity onPress={() => void copyToClipboard(selectedProfile.id)} style={ global.buttonSmall }>
                <Text bold style={ global.buttonText }>Copy SteamID64</Text>
              </TouchableOpacity> */}
            </View>
          </View> : <View>
            <Text bold style={ global.title }>No profile selected</Text>
            <Text style={ global.subtitle }>
              <Text bold>Tap</Text> on a profile to select it.
            </Text>
          </View>
        }
      </Modal>
    </View>
  );
}
