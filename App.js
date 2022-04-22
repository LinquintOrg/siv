import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import {useState} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import InvGamesList from "./components/InvGamesList.js";
import Inventory from "./components/Inventory.js";
import MusicKits from "./components/MusicKits";
import UserSaves from "./components/UserSaves";
import Settings from "./components/Settings";
import AsyncStorage from '@react-native-async-storage/async-storage'
import SteamMarket from "./components/SteamMarket";
import {ColorfulTabBar} from "react-navigation-tabbar-collection";
import * as Sentry from 'sentry-expo';
import {Snackbar} from "react-native-paper";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function App() {
    Sentry.init({
        dsn: 'https://755f445790cc440eb625404426d380d7@o1136798.ingest.sentry.io/6188926',
        enableInExpoDevelopment: true,
        debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
        tracesSampleRate: 1.0,
        integrations: [
            new Sentry.Native.ReactNativeTracing({
                tracingOrigins: ["domr.xyz"],
            }),
        ],
    });

    const [rate, setRate] = useState(0)         // selected currency
    const [rates, setRates] = useState()        // downloaded rates from database
    const [loadedRates, setLoadedRates] = useState(false)       // Are rates loaded?
    const [loadedUsers, setLoadedUsers] = useState(false)       // Are saved profiles loaded
    const [users, setUsers] = useState([])      // Saved profiles
    const [snackbarVisible, setSnackbarVisible] = useState(false)

    if (!loadedRates) {
        setLoadedRates(true)
        getRates()
    }

    if (!loadedUsers) {
        setLoadedUsers(true)
        getAllKeys().then(r => null)
    }

    function navigateToLoad(navigation, steamID) {
        navigation.navigate('Choose games', { steamId: steamID })
    }

    function getRates() {
        fetch('https://domr.xyz/rates_full.php')
            .then(response => response.json())
            .then(json => setRates(json.rates))
    }

    async function saveProfile(id, name, url) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === id) return;
        }

        let tmp = {
            'id': id,
            'name': name,
            'url': url
        }
        await AsyncStorage.setItem(id, JSON.stringify(tmp))
        setUsers(users.concat(tmp))
    }

    async function saveSetting(name, value) {
        console.log('Save setting: [ ' + name + ' => ' + value + ' ]')
        let tmp = {
            'val': value
        }
        await AsyncStorage.setItem(name, JSON.stringify(tmp))
    }

    async function getAllKeys() {
        await AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiGet(keys, (err, stores) => {
                const values = []
                stores.map((result/*, i, store*/) => {
                    if (result[0] === 'currency') {
                        setRate(JSON.parse(result[1]).val)
                    } else {
                        if (!result[0].includes('prevGames')) {
                            console.log('Update: ' + result[1])
                            values.push(JSON.parse(result[1]))
                        }
                    }
                });
                setUsers(values)
            });
        });
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
        const [dataPfp, setPfp] = useState('https://domr.xyz/api/Files/img/profile.png') // search profile picture

        function isSteamIDValid() {
            return !(steamID == '' || steamID.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+/) || steamID.length === 0)
        }

        const getProfileData = async (sid) => {
            if (sid.length === 17) {
                setLoading(true)
                let id = '7401764DA0F7B99794826E9E2512E311';
                setLoading(true)

                await fetch(
                    'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + id + '&steamids=' + sid
                )
                    .then((response) => response.json())
                    .then((json) => {
                        setName(json.response.players[0].personaname)
                        setPfp(json.response.players[0].avatarfull)
                    })
                    .catch((error) => console.error(error))
                    .finally(() => {
                        setLoading(false)
                        setSteamID(sid)
                    })
            } else {
                setSnackbarVisible(true)
                await sleep(3000).then(r => setSnackbarVisible(false))
            }
        }

        function sleep(milliseconds) {
            return new Promise((resolve) => {
                setTimeout(resolve, milliseconds);
            });
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

        return (
            <View style={{backgroundColor: '#fff', height: '100%'}}>
                <Text style={[styles.title, {fontWeight: 'bold'}]}>Find Steam profile</Text>
                <Text style={[styles.title, {fontSize: 12}]}>Enter SteamID64 and tap search button</Text>

                <View style={styles.inputView} disabled={isLoading}>
                    <Icon color='#333' name='at' type='font-awesome' size={20}/>
                    <TextInput
                        style={{marginHorizontal: 8, borderBottomWidth: 1.0, flex: 1}}
                        placeholder='Enter SteamID64'
                        onChangeText={text => setSteamIDtyped(text)}
                        onEndEditing={() => setSteamID(steamIDtyped)}
                    />
                    <Text style={[(steamIDtyped.length === 17) ? {color: '#0f0'} : {color: '#f00'}, {fontSize: 12, width: 45, textAlign: 'center'}]}>{steamIDtyped.length} / 17</Text>

                    <TouchableOpacity style={{padding: 4}} onPress={() => {
                        getProfileData(steamIDtyped).then(r => null)
                    }}>
                        <Icon name='search' type='font-awesome' size={20}/>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                    <Image style={styles.profilePicture} source={ { uri: dataPfp } } />
                    <View style={styles.flowDown}>
                        <Text style={styles.profileID}>{ steamID }</Text>
                        <Text style={styles.profileName} numberOfLines={1}>{ dataName }</Text>

                        <View style={styles.flowRow}>
                            <TouchableOpacity style={styles.buttonSmall} onPress={() => navigateToLoad(navigation, steamID) } disabled={!isSteamIDValid(steamID)}>
                                <Text style={styles.buttonSmallText}>LOAD</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.buttonSmall} onPress={() => saveProfile(steamID, dataName, dataPfp)} disabled={!isSteamIDValid(steamID)}>
                                <Text style={styles.buttonSmallText}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text style={[styles.title, {fontWeight: 'bold'}]}>Saved profiles</Text>
                <Text style={[styles.title, {fontSize: 13}]}>Tap on profile to load it</Text>
                <Text style={[styles.title, {fontSize: 13}]}>Long press on profile to remove it</Text>
                <UserSaves users={users} loadInv={navigateToLoad} nav={navigation} deleteUser={deleteProfile} />

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    style={{backgroundColor: "#193C6E"}}>
                    <View><Text style={styles.snackbarText}>Steam ID must be <Text style={{fontWeight: 'bold'}}>17 characters long</Text> and contain only <Text style={{fontWeight: 'bold'}}>numbers</Text>.</Text></View>
                </Snackbar>
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

        function proceedLoading() {
            navigation.navigate('Inventory', { games: selState, steamID: route.params.steamId, rates: rates, rate: rate })
        }

        return (
            <View style={{backgroundColor: '#fff', height: '100%'}}>
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
            <View style={{backgroundColor: '#fff', height: '100%'}}>
                <Inventory games={gamesList} steam={steamID} rates={rates} rate={rate} />
            </View>
        );
    }

    function TabSteamMarket() {
        return (
            <View style={{backgroundColor: '#fff', height: '100%'}}>
                <SteamMarket exchange={rates[rate].exc} rate={rates[rate].abb} />
            </View>
        );
    }

    function TabMusicKit() {
        return (
            <View style={{backgroundColor: '#fff', height: '100%'}}>
                <MusicKits rate={rates[rate].abb} exchange={rates[rate].exc} />
            </View>
        );
    }

    function TabLoadout() {
        return (
            <View style={{backgroundColor: '#fff', height: '100%'}}>
                <Text style={styles.title}>Loadouts will be available in the future version!</Text>
            </View>
        );
    }

    function TabSettings() {
        return (
            <View style={{backgroundColor: '#fff', height: '100%'}}>
                <Settings rates={rates} rate={rate} setRate={setRate} saveSetting={saveSetting} />
            </View>
        );
    }

    return (
    <NavigationContainer>
          <StatusBar backgroundColor='#fff' translucent={false} style={"dark"} />
          <Tab.Navigator tabBar={(props) => <ColorfulTabBar {...props} />}>
              <Tab.Screen name="Profiles" component={TabProfile}
                  options={{
                      tabBarLabelStyle: {color: '#194D5C', fontSize: 11},
                      tabBarActiveTintColor: '#30BF8E',
                      icon: () => (
                        <Icon name="home" type='font-awesome' color={'#194D5C'} size={24} />
                      ),
                      headerShown: false,
                  }}
              />
              <Tab.Screen name="Steam Market" component={TabSteamMarket}
                  options={{
                      tabBarLabelStyle: {color: '#194D5C', fontSize: 11},
                      tabBarActiveTintColor: '#30BF8E',
                      tabBarIcon: () => (
                      <Icon name="steam" type='font-awesome' color={'#194D5C'} size={24} />
                      ),
                      headerShown: false
                  }}
              />
              <Tab.Screen name="Music Kits" component={TabMusicKit}
                  options={{
                      tabBarLabelStyle: {color: '#194D5C', fontSize: 11},
                      tabBarActiveTintColor: '#30BF8E',
                      tabBarIcon: () => (
                      <Icon name="music" type='font-awesome' color={'#194D5C'} size={24} />
                      ),
                      headerShown: false
                  }}
              />
              <Tab.Screen name="Loadout" component={TabLoadout}
                  options={{
                      tabBarLabelStyle: {color: '#194D5C', fontSize: 11},
                      tabBarActiveTintColor: '#30BF8E',
                      tabBarIcon: () => (
                      <Icon name="diamond" type='font-awesome' color={'#194D5C'} size={24} />
                      ),
                      headerShown: false,
                  }}
              />
              <Tab.Screen name="Settings" component={TabSettings}
                  options={{
                      tabBarLabelStyle: {color: '#194D5C', fontSize: 11},
                      tabBarActiveTintColor: '#30BF8E',
                      tabBarIcon: () => (
                      <Icon name="wrench" type='font-awesome' color={'#194D5C'} size={24} />
                      ),
                      headerShown: false
                  }}
              />
          </Tab.Navigator>
      </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputView: {
        width: '90%',
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 10,
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
    },
    warning: {
        fontSize: 12,
        color: '#f00',
        fontWeight: 'bold',
        paddingLeft: 12
    },
    button: {
        backgroundColor: '#122334',
        width: 150,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonSmall: {
        backgroundColor: '#379C63',
        width: '35%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginTop: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20
    },
    buttonSmallText: {
        fontSize: 16,
        color: '#fff',
    },
    buttonMediumText: {
        fontSize: 24,
        color: '#fff',
    },
    singleButtonSection: {
        alignItems: 'center'
    },
    profileSection: {
        borderWidth: 0,
        borderRadius: 8,
        marginVertical: 16,
        padding: 8,
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#0E273E',
        width: '94%',
        alignSelf: 'center',
    },
    profilePicture: {
        width: '16%',
        borderRadius: 8,
        marginEnd: 8,
        aspectRatio: 1.0,
    },
    profileName: {
        fontSize: 14,
        fontWeight: "bold",
        color: '#aaa'
    },
    profileID: {
        fontSize: 16,
        fontWeight: "bold",
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
        fontSize: 15,
        color: '#ddd',
        width: '50%',
        textAlign: 'left',
    },
});

export default Sentry.Native.wrap(App);
