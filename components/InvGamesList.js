import {TouchableOpacity, View, StyleSheet, Image, ScrollView, Pressable, Dimensions} from "react-native";
import React from "react";
import {useState} from "react";
import gamesJson from '../assets/inv-games.json'
import {Divider, Icon} from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Snackbar } from "react-native-paper";
import Text from '../Elements/text'

export default function InvGamesList(props) {
    const gj = gamesJson;
    const [loadedPrevGames, setLoadedPrevGames] = useState(false)
    const [prevGames, setPrevGames] = useState([]);
    const [snackbarVisible, setSnackbarVisible] = useState(false)

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

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
            <Text bold style={styles.title}>Select games</Text>
            <ScrollView style={{borderRadius: 8}}>
                {
                    gj.games.map((item, index) => (
                        <View>
                            <TouchableOpacity key={item.name} style={styles.container} onPress={() => {
                                if (props.hasState(item.appid)) {
                                    props.removeState(item.appid)
                                } else {
                                    props.setState([item.appid])
                                }
                            }}>
                                <Image style={{ height: resize(48), width: resize(48), borderRadius: 8, marginRight: 8 }} source={{uri: item.url} } />

                                <View style={{ display: 'flex', flexDirection: 'column', width: '77%' }}>
                                    <Text bold style={styles.gameTitle}>{item.name}</Text>
                                    <Text style={styles.appID}>{item.appid}</Text>
                                </View>

                                <Icon name={ (props.hasState(item.appid)) ? 'check-circle' : 'circle' } type='feather' size={resize(24)}
                                      style={{alignSelf: 'center'}} color='#12428D' />
                            </TouchableOpacity>

                            { (gj.games.length - 1 !== index) ? <Divider width={2} style={{width: '95%', alignSelf: 'center', marginVertical: resize(2), borderRadius: 4}} color='#12428D' /> : null }
                        </View>

                    ))
                }
            </ScrollView>

            <Text bold style={styles.title}>Previously used games</Text>
            {
                // (prevGames.length === 0) ? <Text style={styles.previousGamesSubtitle}>You haven't used this profile previously</Text> :
                //     <View style={{width: '95%', alignSelf: 'center', flexDirection: 'row', display: 'flex', justifyContent: 'center',}}>
                //         <TouchableOpacity style={styles.previousGames} onPress={() => {
                //             props.setPrevState(prevGames[0]?.val)
                //         }}>
                //             <ScrollView style={{width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap',}} horizontal showsHorizontalScrollIndicator={false}>
                //             {
                //                 prevGames[0]?.val.map((item) => (
                //                     <Image style={{ height: resize(48), width: resize(48), borderRadius: 8, marginRight: 8 }} source={{uri: getGameImage(item)}} />
                //                 ))
                //             }
                //             </ScrollView>
                //         </TouchableOpacity>

                //         <TouchableOpacity style={{
                //                 backgroundColor: '#12428D',
                //                 borderTopRightRadius: 16,
                //                 borderBottomRightRadius: 16,
                //                 flexDirection: 'row',
                //                 display: 'flex',
                //                 width: '30%',
                //                 justifyContent: 'space-between',
                //                 elevation: 3,
                //                 marginBottom: resize(8),
                //                 paddingTop: resize(16),
                //                 paddingHorizontal: resize(8),
                //             }}
                //             onPress={async () => {
                //                 props.proceed(prevGames[0]?.val)
                //             }}
                //             >
                //                 <Text bold style={styles.buttonMediumText}>Select</Text>
                //                 <Icon type={'font-awesome-5'} name={'angle-double-right'} size={resize(24)} color={'#F2FAFD'} />
                //         </TouchableOpacity>
                //     </View>
            }

            <TouchableOpacity style={styles.buttonProceed} onPress={() => {
                if (props.state.length > 0) {
                    let id = 'prevGames' + props.steamID
                    saveLoadedGames(id, props.state).then(() => props.proceed())
                } else {
                    setSnackbarVisible(true)
                }
            }}>
                <Text bold style={styles.buttonMediumText}>Proceed</Text>
                <Icon type={'font-awesome-5'} name={'angle-double-right'} size={resize(32)} color={'#F2FAFD'} />
            </TouchableOpacity>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                style={{backgroundColor: "#722", color: '#fff'}}
                action={{
                    label: 'OKAY',
                    onPress: () => {
                        setSnackbarVisible(false)
                    },
                }}>
                <View><Text style={styles.snackbarText}>Choose at least one game.</Text></View>
            </Snackbar>
        </View>
    )
}

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423
    return Math.ceil(size * scale)
}

const styles = StyleSheet.create ({
    container: {
        marginVertical: 6,
        width: '95%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 8,
        alignSelf: 'center',
    },
    gameTitle: {
        color: '#333',
        fontSize: resize(16),
    },
    appID: {
        color: '#777',
        fontSize: resize(14),
    },
    containerSelected: {
        borderWidth: 1.0,
        borderColor: '#0f0',
    },
    title: {
        textAlign: 'left',
        fontSize: resize(24),
        marginVertical: resize(8),
        marginLeft: resize(8),
        color: '#12428D'
    },
    buttonProceed: {
        alignSelf: "center",
        backgroundColor: '#12428D',
        width: '80%',
        height: resize(48),
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        marginVertical: 8,
        display: 'flex',
        flexDirection: 'row',
        elevation: 2,
        paddingHorizontal: resize(16),
    },
    buttonMediumText: {
        fontSize: resize(20),
        color: '#F2FAFD',
        marginHorizontal: 8,
    },
    previousGames: {
        width: '65%',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        padding: resize(4),
        elevation: 3,
        marginBottom: resize(8),
    },
    previousGamesSubtitle: {
        width: '90%',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: resize(16),
        marginVertical: resize(8),
    },
    snackbarText: {
        fontSize: resize(13),
        color: '#F4EDEC'
    }

})