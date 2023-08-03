import * as React from 'react';
import { useProfilesState } from '../utils/store';
import { Clipboard, View, TextInput, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { Snackbar } from 'react-native-paper';
import UserSaves from '../components/UserSaves';
import { styles } from '../styles/global';
import { helpers } from '../utils/helpers';
import Text from '../Elements/text';
import Modal from 'react-native-modal';
import NetInfo from '@react-native-community/netinfo';
import { IProfilesProps } from '../utils/types';

export default function StackProfilesMain(/*{ navigation }*/) {
  const profiles = useProfilesState();

  const [ steamIDtyped, setSteamIDtyped ] = React.useState<string>(''); // SteamID value (updates while being typed)
  const [ steamID, setSteamID ] = React.useState<string>('');
  const [ isLoading, setLoading ] = React.useState(false); // Are search results still loading
  const [ dataName, setName ] = React.useState(''); // Search Profile name
  const [ dataPfp, setPfp ] = React.useState('https://inventory.linquint.dev/api/Files/img/profile.png'); // search profile picture
  const [ dataPublic, setDataPublic ] = React.useState(false);
  const [ dataState, setDataState ] = React.useState(0);

  const getProfileData = async (sid: string) => {
    const id = '7401764DA0F7B99794826E9E2512E311';
    setLoading(true);
    let validValue = helpers.isSteamIDValid(sid);

    const internetConnection = await NetInfo.fetch();
    if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
      setSnackError(true);
      setSnackbarText('No internet connection');
      await sleep(3000).then(() => setSnackError(false));
      return;
    }

    if (!(sid.length === 17 && isSteamIDValid(sid))) {
      setProfileSearchText('Finding Steam profile...');
      await fetch('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + id + '&vanityurl=' + sid)
        .then((response) => {
          if (response.ok) return response.json();
          else return null;
        })
        .then(async json => {
          if (json == null) {
            setSnackError(true);
            setSnackbarText('Couldn\'t retrieve user');
            await sleep(3000).then(() => setSnackError(false));
            setLoading(false);
            return;
          } else {
            if (json.response.success === 1) {
              validValue = true;
              sid = json.response.steamid;
            } else {
              setSnackError(true);
              setSnackbarText('Couldn\'t retrieve user');
              await sleep(3000).then(() => setSnackError(false));
              setLoading(false);
              return;
            }
          }
        });
    }

    if (!validValue) return;
    if (sid.length === 17 && isSteamIDValid(sid)) {
      setProfileSearchText('Getting Steam profile data...');
      await fetch(
        'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + id + '&steamids=' + sid
      )
        .then((response) => response.json())
        .then((json) => {
          setName(json.response.players[0].personaname);
          setPfp(json.response.players[0].avatarmedium);
          setDataState(json.response.players[0].personastate);
          setDataPublic(json.response.players[0].communityvisibilitystate === 3);
        })
        .catch((error) => console.error(error))
        .finally(() => {
          setLoading(false);
          setSteamID(sid);
        });
    } else {
      setSnackError(true);
      setSnackbarText('Entered SteamID64 is incorrect');
      await sleep(3000).then(() => setSnackError(false));
      setLoading(false);
    }
  };

  async function deleteProfile(id) {
    await AsyncStorage.removeItem(id);
    const newUsers = [];
    for (let i = 0; i < users.length; i++) {
      if (users[i].id !== id) {
        newUsers.push(users[i]);
      }
    }
    setUsers(newUsers);
  }

  const [ isProfileModalVisible, setProfileModalVisible ] = React.useState(false);
  const [ profileModalData, setProfileModalData ] = React.useState({name: '', id: ''});
  const [ profileSearchText, setProfileSearchText ] = React.useState('Getting Steam profile data...');

  const toggleModal = (profile) => {
    if (!isProfileModalVisible) setProfileModalData(profile);
    setProfileModalVisible(!isProfileModalVisible);
  };

  const copyToClipboard = async (copiedText) => {
    Clipboard.setStringAsync(copiedText.toString()).then(() => {
      setSnackbarVisible(true);
      sleep(3000).then(() => setSnackbarVisible(false));
    });
  };

  async function displayPrivateProfileErr() {
    setSnackError(true);
    setSnackbarText('Selected profile privacy is set to PRIVATE');
    await sleep(3000).then(() => setSnackError(false));
  }

  return (
    <>
      <View style={styles.inputView} disabled={isLoading}>
        <TextInput
          style={{marginHorizontal: resize(8), flex: 1, height: resize(40), fontSize: resize(16), padding: 0}}
          placeholder='Enter SteamID64'
          mode={'outlined'}
          onChangeText={text => setSteamIDtyped(text)}
          onSubmitEditing={() => {getProfileData(steamIDtyped);}}
          label={'Steam ID64'}
          activeOutlineColor={'#1f4690'}
          left={
            <TextInput.Icon
              icon={() => (<Icon name={'at-sign'} type={'feather'} color={'#1f4690'} />)}

              size={resize(24)}
              style={{margin: 0, paddingTop: resize(8)}}
              name={'at'}
              forceTextInputFocus={false}
            />
          }
          right={
            <TextInput.Icon
              icon={() => (<Icon name={'search'} type={'feather'} color={'#1F4690'} />)}
              name='arrow-right'
              size={resize(36)}
              style={{margin: 0, paddingTop: resize(8)}}
              onPress={() => { getProfileData(steamIDtyped).then(() => null); }}
              forceTextInputFocus={false}
            />
          }
        />
        <Text bold style={[ (steamIDtyped.length === 17 || steamIDtyped.match(/[a-zA-Z]+/)) ? {color: '#0f0'} : {color: '#f00'}, {
          fontSize: resize(14),
          width: resize(56),
          textAlign: 'center',
          paddingTop: resize(8)
        } ]}>
          {
            (steamIDtyped.match(/[a-zA-Z]+/)) ? 'Custom URL' : (steamIDtyped.length + ' / 17')
          }
        </Text>
      </View>

      {
        isLoading ?
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'center', marginVertical: resize(16)}}>
            <ActivityIndicator size="small" color='#12428D' />
            <Text bold style={{color: '#12428D', fontSize: resize(20), marginLeft: resize(8)}}>{profileSearchText}</Text>
          </View> :
          <View style={[ styles.profileSection, (dataName === '' && steamID === '') && {display: 'none'} ]}>
            <Image style={styles.profilePicture} source={{uri: dataPfp}}/>
            <View style={styles.flowDown}>
              <Text bold style={styles.profileID}>{steamID}</Text>
              <Text bold style={styles.profileName} numberOfLines={1}>{dataName}</Text>

              <View style={styles.flowRow}>
                <TouchableOpacity style={styles.buttonSmall} onPress={() => navigateToLoad(navigation, steamID)}
                  disabled={!isSteamIDValid(steamID)}>
                  <Text bold style={styles.buttonSmallText}>Load</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSmall}
                  onPress={() => saveProfile(steamID, dataName, dataPfp, dataPublic, dataState)}
                  disabled={!isSteamIDValid(steamID)}>
                  <Text bold style={styles.buttonSmallText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      }

      <Text bold style={[ styles.title ]}>Saved profiles</Text>
      <Text style={[ styles.title, {fontSize: resize(14)} ]}><Text bold>Tap</Text> to select profile</Text>
      <Text style={[ styles.title, {fontSize: resize(14)} ]}><Text bold>Long press</Text> profile to see more options</Text>
      <UserSaves
        users={users}
        loadInv={navigateToLoad}
        nav={navigation}
        deleteUser={deleteProfile}
        toggleModal={toggleModal}
        displayErr={displayPrivateProfileErr}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        style={{backgroundColor: '#9AD797'}}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <Icon name={'check'} type={'font-awesome'} color={'#193130'} size={resize(20)} />
          <Text style={[ styles.snackbarText, {fontSize: resize(18), marginLeft: resize(12), color: '#193130'} ]}>SteamID64 copied to clipboard</Text>
        </View>
      </Snackbar>

      <Snackbar
        visible={snackError}
        onDismiss={() => setSnackError(false)}
        style={{backgroundColor: '#FF3732'}}>
        <View><Text style={[ styles.snackbarText, {color: '#F4EDEC'} ]}>{ snackbarText }</Text></View>
      </Snackbar>

      <Modal
        isVisible={isProfileModalVisible}
        onBackdropPress={() => setProfileModalVisible(false)}
        animationIn={'swing'}
        animationOut={'fadeOut'}
        animationInTiming={500}
      >
        <View style={styles.profileModalView}>
          <Text bold style={styles.profileModalTitle}>Choose action</Text>
          <Text style={styles.profileModalUsername}>{profileModalData.name}</Text>

          <TouchableOpacity onPress={() => deleteProfile(profileModalData.id)} style={styles.profileModalButton}>
            <Text bold style={styles.profileModalButtonText}>Delete user</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => copyToClipboard(profileModalData.id)} style={styles.profileModalButton}>
            <Text bold style={styles.profileModalButtonText}>Copy SteamID64</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
