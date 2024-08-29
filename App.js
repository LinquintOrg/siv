import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image, Dimensions,
    ActivityIndicator
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import {useCallback, useEffect, useState} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import InvGamesList from "./components/InvGamesList.js";
import Inventory from "./components/Inventory.js";
import MusicKits from "./components/MusicKits";
import UserSaves from "./components/UserSaves";
import Settings from "./components/Settings";
import AsyncStorage from '@react-native-async-storage/async-storage'
import SteamMarket from "./components/SteamMarket";
import {CleanTabBar} from "react-navigation-tabbar-collection";
import * as Sentry from '@sentry/react-native';
import {Snackbar, TextInput} from "react-native-paper";
import * as SplashScreen from 'expo-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import Text from './Elements/text'
import {useFonts} from "expo-font";
import Modal from "react-native-modal";
import * as Clipboard from 'expo-clipboard';
import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

registerRootComponent(App);

function App() {
    
    Sentry.init({
      dsn: 'https://755f445790cc440eb625404426d380d7@o1136798.ingest.sentry.io/6188926',
      debug: true,
      tracesSampleRate: 1.0,
    });

    // useFonts({
    //     Nunito: require('./assets/fonts/Nunito-Regular.ttf'),
    //     NunitoBold: require('./assets/fonts/Nunito-Bold.ttf'),
    // });

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const [rate, setRate] = useState(46);           // selected currency
    const [rates, setRates] = useState();           // downloaded rates from database
    const [users, setUsers] = useState([]);         // Saved profiles
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarText, setSnackbarText] = useState("");
    const [snackError, setSnackError] = useState(false);
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();

                let internetConnection = await NetInfo.fetch();
                if (internetConnection.isInternetReachable && internetConnection.isConnected) {
                    let isPrepared = false
                    await updateProfiles().then(async () => {
                        await getRates().then(() => isPrepared = true)
                    })
                    if (!isPrepared) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                } else {
                    setSnackbarText("No internet connection")
                    setSnackError(true)
                }
            } catch (e) {
                console.log('Caught an error:')
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare().then(() => null);
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) return null

    function navigateToLoad(navigation, steamID) {
        navigation.navigate('Choose games', { steamId: steamID })
    }

    async function getRates() {
        fetch('https://inventory.linquint.dev/rates_full.php')
            .then(response => response.json())
            .then(json => setRates(json.rates))
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    async function saveProfile(id, name, url, isPublic, state) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                setSnackError(true)
                setSnackbarText("Profile is already saved")
                await sleep(2500).then(() => setSnackError(false))
                return;
            }
        }

        let tmp = {
            'id': id,
            'name': name,
            'url': url,
            'public': isPublic,
            'state': state
        }
        await AsyncStorage.setItem(id, JSON.stringify(tmp))
        setUsers(users.concat(tmp))
    }

    async function updateProfiles() {
        let id = '7401764DA0F7B99794826E9E2512E311';

        await AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiGet(keys, async () => {
                const ids = []
                for (const key of keys) {
                    switch (key) {
                        case 'currency': {
                            setRate(JSON.parse(await AsyncStorage.getItem('currency')).val)
                            break;
                        }
                        default: {
                            if (!key.includes('prevGames')) {
                                ids.push(key)
                            }
                        }
                    }
                }

                await fetch('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + id + '&steamids=' + ids.join(','))
                    .then(response => response.json())
                    .then(async json => {
                        let values = []
                        for (const user of json.response.players) {
                            let tmp = {
                                'id': user.steamid,
                                'name': user.personaname,
                                'url': user.avatarmedium,
                                'public': user.communityvisibilitystate === 3,
                                'state': user.personastate
                            }

                            await AsyncStorage.removeItem(user.steamid).then(async () => {
                                await AsyncStorage.setItem(user.steamid, JSON.stringify(tmp)).then(async () => {
                                    values = values.concat([tmp])
                                })
                            })
                        }
                        setUsers(values)
                    })
            });
        })
    }

    async function saveSetting(name, value) {
        if (name === 'currency') {
            setRate(value)
        }
        let tmp = {
            'val': value
        }
        await AsyncStorage.setItem(name, JSON.stringify(tmp))
    }

    function TabProfile(/*{ navigation }*/) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='ProfilesAndInv' component={StackProfilesMain} />
                <Stack.Screen name='Choose games' component={StackGames} screenOptions={{ headerShown: false }} />
                <Stack.Screen name='Inventory' component={StackInventory} />
            </Stack.Navigator>
        );
    }

    function StackProfilesMain({ navigation }) {
        const [steamIDtyped, setSteamIDtyped] = useState('');         // SteamID value (updates while being typed)
        const [steamID, setSteamID] = useState('');
        const [isLoading, setLoading] = useState(false);        // Are search results still loading
        const [dataName, setName] = useState('');       // Search Profile name
        const [dataPfp, setPfp] = useState('https://inventory.linquint.dev/api/Files/img/profile.png') // search profile picture
        const [dataPublic, setDataPublic] = useState(false)
        const [dataState, setDataState] = useState(0)

        function isSteamIDValid(steamID) {
            return !(steamID == '' || steamID.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+/) || steamID.match(/[a-zA-Z]/) || steamID.length === 0)
        }

        const getProfileData = async (sid) => {
            const id = '7401764DA0F7B99794826E9E2512E311'
            setLoading(true);
            let validValue = isSteamIDValid(sid)

            let internetConnection = await NetInfo.fetch();
            if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
                setSnackError(true)
                setSnackbarText("No internet connection")
                await sleep(3000).then(() => setSnackError(false))
                return
            }

            if (!(sid.length === 17 && isSteamIDValid(sid))) {
                setProfileSearchText("Finding Steam profile...")
                await fetch('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + id + '&vanityurl=' + sid)
                .then((response) => {
                    if (response.ok) return response.json()
                    else return null
                })
                .then(async json => {
                    if (json == null) {
                        setSnackError(true)
                        setSnackbarText("Couldn't retrieve user")
                        await sleep(3000).then(() => setSnackError(false))
                        setLoading(false)
                        return
                    } else {
                        if (json.response.success === 1) {
                            validValue = true
                            sid = json.response.steamid
                        } else {
                            setSnackError(true)
                            setSnackbarText("Couldn't retrieve user")
                            await sleep(3000).then(() => setSnackError(false))
                            setLoading(false)
                            return
                        }
                    }
                })
            }

            if (!validValue) return
            if (sid.length === 17 && isSteamIDValid(sid)) {
                setProfileSearchText("Getting Steam profile data...")
                await fetch(
                    'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + id + '&steamids=' + sid
                )
                    .then((response) => response.json())
                    .then((json) => {
                        setName(json.response.players[0].personaname)
                        setPfp(json.response.players[0].avatarmedium)
                        setDataState(json.response.players[0].personastate)
                        setDataPublic(json.response.players[0].communityvisibilitystate === 3)
                    })
                    .catch((error) => console.error(error))
                    .finally(() => {
                        setLoading(false)
                        setSteamID(sid)
                    })
            } else {
                setSnackError(true)
                setSnackbarText("Entered SteamID64 is incorrect")
                await sleep(3000).then(() => setSnackError(false))
                setLoading(false)
            }
        }

        async function deleteProfile(id) {
            await AsyncStorage.removeItem(id)
            const newUsers = []
            for (let i = 0; i < users.length; i++) {
                if (users[i].id !== id) {
                    newUsers.push(users[i])
                }
            }
            setUsers(newUsers)
        }

        const [isProfileModalVisible, setProfileModalVisible] = useState(false);
        const [profileModalData, setProfileModalData] = useState({name: '', id: ''});
        const [profileSearchText, setProfileSearchText] = useState("Getting Steam profile data...")

        const toggleModal = (profile) => {
            if (!isProfileModalVisible) setProfileModalData(profile)
            setProfileModalVisible(!isProfileModalVisible)
        };

        const copyToClipboard = async (copiedText) => {
            Clipboard.setStringAsync(copiedText.toString()).then(() => {
                setSnackbarVisible(true)
                sleep(3000).then(() => setSnackbarVisible(false))
            })
        };

        async function displayPrivateProfileErr() {
            setSnackError(true)
            setSnackbarText("Selected profile privacy is set to PRIVATE")
            await sleep(3000).then(() => setSnackError(false))
        }

        return (
            <View style={{height: '100%'}} onLayout={onLayoutRootView}>
                <View style={styles.inputView} disabled={isLoading}>
                    <TextInput
                        style={{marginHorizontal: resize(8), flex: 1, height: resize(40), fontSize: resize(16), padding: 0}}
                        placeholder='Enter SteamID64'
                        mode={'outlined'}
                        onChangeText={text => setSteamIDtyped(text)}
                        onSubmitEditing={() => {getProfileData(steamIDtyped)}}
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
                                onPress={() => { getProfileData(steamIDtyped).then(() => null) }}
                                forceTextInputFocus={false}
                            />
                        }
                    />
                    <Text bold style={[(steamIDtyped.length === 17 || steamIDtyped.match(/[a-zA-Z]+/)) ? {color: '#0f0'} : {color: '#f00'}, {
                        fontSize: resize(14),
                        width: resize(56),
                        textAlign: 'center',
                        paddingTop: resize(8)
                    }]}>
                        {
                            (steamIDtyped.match(/[a-zA-Z]+/)) ? 'Custom URL' : (steamIDtyped.length + ' / 17')
                        }
                    </Text>
                </View>

                {
                    isLoading ? 
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'center', marginVertical: resize(16),}}>
                            <ActivityIndicator size="small" color='#12428D' />
                            <Text bold style={{color: '#12428D', fontSize: resize(20), marginLeft: resize(8),}}>{profileSearchText}</Text>
                        </View> :
                        <View style={[styles.profileSection, (dataName === '' && steamID === '') && {display: 'none'}]}>
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

                <Text bold style={[styles.title]}>Saved profiles</Text>
                <Text style={[styles.title, {fontSize: resize(14)}]}><Text bold>Tap</Text> to select profile</Text>
                <Text style={[styles.title, {fontSize: resize(14)}]}><Text bold>Long press</Text> profile to see more options</Text>
                <UserSaves users={users} loadInv={navigateToLoad} nav={navigation} deleteUser={deleteProfile} toggleModal={toggleModal} displayErr={displayPrivateProfileErr} />

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    style={{backgroundColor: "#9AD797"}}>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                        <Icon name={'check'} type={'font-awesome'} color={'#193130'} size={resize(20)} />
                        <Text style={[styles.snackbarText, {fontSize: resize(18), marginLeft: resize(12), color: '#193130'}]}>SteamID64 copied to clipboard</Text>
                    </View>
                </Snackbar>

                <Snackbar
                    visible={snackError}
                    onDismiss={() => setSnackError(false)}
                    style={{backgroundColor: "#FF3732"}}>
                    <View><Text style={[styles.snackbarText, {color: '#F4EDEC'}]}>{ snackbarText }</Text></View>
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
            </View>
        )
    }

    function StackGames({ route, navigation }) {
        const [selState, setSelState] = useState([])

        function hasState(state) {
            return selState.includes(state)
        }

        function setState(state) {
            setSelState(selState.concat(state))
        }

        function removeState(state) {
            let newState = []
            for (let i = 0; i < selState.length; i++) {
                if (selState[i] !== state) newState.push(selState[i])
            }
            setSelState(newState)
        }

        function setPrevGamesState(state) {
            setSelState(state)
        }

        function proceedLoading(selection = selState) {
            navigation.navigate('Inventory', { games: selection, steamID: route.params.steamId, rates: rates, rate: rate })
        }

        return (
            <View style={{height: '100%'}}>
                <InvGamesList
                    removeState={removeState}
                    hasState={hasState}
                    setState={setState}
                    steamID={route.params.steamId}
                    proceed={proceedLoading}
                    state={selState}
                    setPrevState={setPrevGamesState}
                />
            </View>
        )
    }

    function StackInventory({route}) {
        const gamesList = route.params.games
        const steamID = route.params.steamID

        return (
            <View style={{height: '100%'}}>
                <Inventory games={gamesList} steam={steamID} rates={rates} rate={rate} />
            </View>
        );
    }

    function TabSteamMarket() {
        return (
            <View style={{height: '100%'}}>
                <SteamMarket exchange={rates[rate].exc} rate={rates[rate].abb} />
            </View>
        );
    }

    function TabMusicKit() {
        return (
            <View style={{height: '100%'}}>
                <MusicKits rate={rates[rate].abb} exchange={rates[rate].exc} />
            </View>
        );
    }

    function TabSettings() {
        return (
            <View style={{height: '100%'}}>
                <Settings rates={rates} rate={rate} setRate={setRate} saveSetting={saveSetting} />
            </View>
        );
    }

    enableScreens();

    return (
    <NavigationContainer>
          <StatusBar backgroundColor={'#f2f2f2'} translucent={false} style={"dark"} />
          <Tab.Navigator tabBar={(props) => <CleanTabBar {...props} />}>
              <Tab.Screen name="Profiles" component={TabProfile}
                  options={{
                      tabBarLabelStyle: {color: '#2379D9', fontSize: resize(14)},
                      tabBarActiveTintColor: '#2379D9',
                      icon: () => (
                        <Icon name="users" type='feather' color={'#322A81'} size={resize(28)} />
                      ),
                      headerShown: false,
                  }}
              />
              <Tab.Screen name="Steam Market" component={TabSteamMarket}
                  options={{
                      tabBarLabelStyle: {color: '#2379D9', fontSize: resize(14)},
                      tabBarActiveTintColor: '#2379D9',
                      tabBarIcon: () => (
                        <Icon name="steam" type={'material-community'} color={'#322A81'} size={resize(28)} />
                      ),
                      headerShown: false
                  }}
              />
              <Tab.Screen name="Music Kits" component={TabMusicKit}
                  options={{
                      tabBarLabelStyle: {color: '#2379D9', fontSize: resize(14)},
                      tabBarActiveTintColor: '#2379D9',
                      tabBarIcon: () => (
                        <Icon name="music" type='feather' color={'#322A81'} size={resize(28)} />
                      ),
                      headerShown: false
                  }}
              />
              <Tab.Screen name="Settings" component={TabSettings}
                  options={{
                      tabBarLabelStyle: {color: '#2379D9', fontSize: resize(14)},
                      tabBarActiveTintColor: '#2379D9',
                      tabBarIcon: () => (
                        <Icon name="settings" type='feather' color={'#322A81'} size={resize(28)} />
                      ),
                      headerShown: false
                  }}
              />
          </Tab.Navigator>
      </NavigationContainer>
    );
}

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423
    return Math.ceil(size * scale)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputView: {
        width: '95%',
        height: resize(44),
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
        marginBottom: resize(16),
    },
    title: {
        textAlign: 'center',
        fontSize: resize(20),
    },
    input: {
        height: resize(40),
        margin: resize(12),
        borderWidth: 1,
        padding: resize(10),
        fontSize: resize(14),
        borderRadius: 8,
    },
    warning: {
        fontSize: resize(12),
        color: '#f00',
        fontWeight: 'bold',
        paddingLeft: 12
    },
    button: {
        backgroundColor: '#122334',
        width: resize(150),
        height: resize(45),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonSmall: {
        backgroundColor: '#91bcec',
        width: '35%',
        height: resize(40),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: resize(20),
        marginTop: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: resize(20)
    },
    buttonSmallText: {
        fontSize: resize(18),
        color: '#12428D',
    },
    buttonMediumText: {
        fontSize: resize(24),
        color: '#fff',
    },
    singleButtonSection: {
        alignItems: 'center'
    },
    profileSection: {
        borderWidth: 0,
        borderRadius: 8,
        marginVertical: resize(8),
        padding: resize(8),
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#0E273E',
        width: '90%',
        alignSelf: 'center',
    },
    profilePicture: {
        width: resize(64),
        borderRadius: 8,
        marginEnd: 8,
        aspectRatio: 1.0,
    },
    profileName: {
        fontSize: resize(14),
        fontWeight: "bold",
        color: '#aaa'
    },
    profileID: {
        fontSize: resize(16),
        color: '#ddd'
    },
    flowDown: {
        display: 'flex',
        flexDirection: "column",
        width: '84%',
    },
    flowRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    snackbarText: {
        fontSize: resize(13),
        color: '#ddd',
        width: '100%',
        textAlign: 'left',
    },
    profileModalView: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: resize(8),
        display: 'flex',
        flexDirection: 'column',
    },
    profileModalTitle: {
        fontSize: resize(26),
        color: '#333',
    },
    profileModalUsername: {
        fontSize: resize(16),
        color: '#666',
    },
    profileModalButton: {
        borderWidth: 3,
        borderRadius: 8,
        padding: resize(8),
        marginTop: resize(12),
        borderColor: '#3342A3',
    },
    profileModalButtonText: {
        fontSize: resize(18),
        color: '#3342A3',
    }
});

export default Sentry.wrap(App);
