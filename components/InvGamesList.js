import {Text, TouchableOpacity, View, StyleSheet, Image, ScrollView, Pressable} from "react-native";
import React from "react";
import {useState} from "react";
import gamesJson from '../assets/inv-games.json'
import {Icon} from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";

export default function InvGamesList(props) {
    const gj = gamesJson;
    const [loadedPrevGames, setLoadedPrevGames] = useState(false)
    const [prevGames, setPrevGames] = useState([]);
    const [snackbarVisible, setSnackbarVisible] = useState(false)

    if (!loadedPrevGames) getAllKeys().then(() => {
        setLoadedPrevGames(true)
    })

    async function getAllKeys() {
        await AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiGet(keys, (err, stores) => {
                const values = []
                stores.map((result/*, i, store*/) => {
                    if (result[0].includes('prevGames' + props.steamID)) {
                        values.push(JSON.parse(result[1]))
                    }
                });
                setPrevGames(values)
            });
        });
    }

    async function saveLoadedGames(name, value) {
        let tmp = {
            'val': value
        }
        await AsyncStorage.setItem(name, JSON.stringify(tmp))
    }

    function getGameImage(appid) {
        for (let i = 0; i < gj.games.length; i++) {
            if (appid === gj.games[i].appid) return gj.games[i].url
        }
    }

    return(
        <View style={{height: '100%'}}>
            <Text style={[styles.title, {fontSize: 24}]}>Choose games to load</Text>
            <Text style={styles.title}>Use previously loaded games</Text>
            {
                (prevGames.length === 0) ? <Text style={styles.previousGamesSubtitle}>You will be able to see previous games next time you use this profile</Text> :
                    <Pressable style={styles.previousGames} onPress={() => {
                        props.setPrevState(prevGames[0]?.val)
                    }}>
                        {
                            prevGames[0]?.val.map((item) => (
                                <Image style={{ height: 48, width: 48, borderRadius: 8, marginRight: 8 }} source={{uri: getGameImage(item)}} />
                            ))
                        }
                    </Pressable>
            }

            <Text style={styles.title}>Select games from the list</Text>
            <ScrollView style={{borderRadius: 8}}>
                {
                    gj.games.map((item) => (
                        <TouchableOpacity key={item.name} style={styles.container} onPress={() => {
                            if (props.hasState(item.appid)) {
                                props.removeState(item.appid)
                            } else {
                                props.setState([item.appid])
                            }
                        }}>
                            <Image style={{ height: 48, width: 48, borderRadius: 8, marginRight: 8 }} source={{uri: item.url} } />

                            <View style={{ display: 'flex', flexDirection: 'column', width: '77%' }}>
                            <Text style={styles.gameTitle}>{item.name}</Text>
                            <Text style={styles.appID}>{item.appid}</Text>
                            </View>

                            <Icon name={ (props.hasState(item.appid)) ? 'check-square-o' : 'square-o' } type='font-awesome' size={25}
                            style={{alignSelf: 'center'}} />
                        </TouchableOpacity>
                    ))
                }
            </ScrollView>

            <TouchableOpacity style={styles.buttonProceed} onPress={() => {
                if (props.state.length > 0) {
                    let id = 'prevGames' + props.steamID
                    saveLoadedGames(id, props.state).then(() => props.proceed())
                } else {
                    setSnackbarVisible(true)
                }
            }}>
                <Text style={styles.buttonMediumText}>Proceed</Text>
                <Icon type={'font-awesome-5'} name={'angle-double-right'} size={32} color={'#193C6E'} />
            </TouchableOpacity>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                style={{backgroundColor: "#193C6E"}}
                action={{
                    label: 'OKAY',
                    onPress: () => {
                        setSnackbarVisible(false)
                    },
                }}
            >
                <View><Text style={styles.snackbarText}>Choose at least one game.</Text></View>
            </Snackbar>
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        marginVertical: 6,
        width: '95%',
        backgroundColor: '#ccc',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 8,
        alignSelf: 'center',
        elevation: 3,
    },
    gameTitle: {
        color: '#333',
        fontWeight: "bold"
    },
    appID: {
        color: '#777'
    },
    containerSelected: {
        borderWidth: 1.0,
        borderColor: '#0f0',
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    buttonProceed: {
        alignSelf: "center",
        backgroundColor: '#FFF',
        width: '80%',
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        marginVertical: 4,
        display: 'flex',
        flexDirection: 'row',
        borderWidth: 2.0,
        borderColor: '#193C6E',
    },
    buttonMediumText: {
        fontSize: 24,
        color: '#193C6E',
        fontWeight: "bold",
        marginHorizontal: 8,
        width: '75%',
    },
    previousGames: {
        width: '80%',
        alignSelf: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#ddd',
        borderRadius: 8,
        padding: 4,
    },
    previousGamesSubtitle: {
        width: '90%',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 15
    },
    snackbarText: {
        fontSize: 15,
        color: '#ddd'
    }

})