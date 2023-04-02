import {
    ActivityIndicator,
    Dimensions, FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import React, {useCallback, useState} from "react";
import {Audio} from 'expo-av';
import {Divider, Icon} from "react-native-elements";
import {Snackbar} from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import Text from '../Elements/text'
import {TextInput} from 'react-native-paper'
import MusicKitPrices from "../Elements/MusicKitPrices";

export default function MusicKits(props) {
    const [loading, setLoading] = useState(true)
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [kits, setKits] = useState({})
    const [prices, setPrices] = useState([]);
    const imgNotFound = 'https://inventory.linquint.dev/api/Files/img/no-photo.png'
    // const [numPlays, setNumPlays] = useState((__DEV__) ? 1 : 5)                         // Save @numPlays to prevent app relaunch to get more plays
    const [playbackTimeout, setPlaybackTimeout] = useState(false)
    const [search, setSearch] = useState('')
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackError, setSnackError] = useState('')
    const [snackbarRewardAd, setSnackbarRewardAd] = useState(false)

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    
        // mobileAds().initialize().then(adapterStatuses => {
        //     // Initialization complete!
        // });

        // const adUnitID = __DEV__ ? TestIds.REWARDED : "ca-app-pub-3223910346366351/1125060976";

        // const rewarded = RewardedAd.createForAdRequest(adUnitID, {
        //     requestNonPersonalizedAdsOnly: true
        // })

        // const loadRewardAd = () => {
        //     const unsubLoaded = rewarded.addAdEventsListener(RewardedAdEventType.LOADED, () => {
                
        //     })

        //     const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
        //         setNumPlays(5)
        //     })

        //     rewarded.load()

        //     return () => {
        //         unsubLoaded()
        //         unsubEarned()
        //     }
        // }

        // useEffect(() => {
        //     const unsubEvents = loadRewardAd()

        //     return () => {
        //         unsubEvents();
        //     }
        // }, [])


    const getMusicKits = useCallback(async () => {
        let internetConnection = await NetInfo.fetch();
        if (internetConnection.isInternetReachable && internetConnection.isConnected) {
            await fetch('https://inventory.linquint.dev/api/Steam/rq/music_kits.json')
                .then((response) => response.json())
                .then((json) => {
                    setKits(json.musickit)
                    setLoading(false)
                    setLoadingPrices(true)
                })
            return true
        }
        return false
    }, [])

    const getMusicKitPrices = useCallback(async () => {
        let didLoadPrices = false
        await fetch('https://inventory.linquint.dev/api/Steam/v3/music_kit_prices.php')
            .then((response) => response.json())
            .then(json => {
                setPrices(json)
                setLoadingPrices(false)
                didLoadPrices = true
            })
        return didLoadPrices
    }, [])

    if (loading) {
        getMusicKits().then(r => {
            if (!r) {
                setSnackbarVisible(true)
                setSnackError('No internet connection')
            } else {
                getMusicKitPrices()
            }
        })
    }

    const whatIsPlaying = async (song, artist, musicLen) => {
        setSnackError(<Text style={{fontSize: resize(14)}}>
                Now playing <Text bold style={{color: '#6FC8F7'}}>{song}</Text> by <Text style={{color: '#6FC8F7'}}>{artist}</Text>{"\n"}
                Length: <Text bold style={{color: '#6FC8F7'}}>{Math.ceil(musicLen / 1000)}</Text> seconds
            </Text>)
        setSnackbarVisible(true)
        await sleep(5000)
        setSnackbarVisible(false)
    }

    async function playSound(dir, artist, song) {
        if (!playbackTimeout) {
            setPlaybackTimeout(true)
            const {sound: playbackObject} = await Audio.Sound.createAsync(
                {uri: 'https://inventory.linquint.dev/api/Files/csgo/musickits/' + dir + '/roundmvpanthem_01.mp3'},
                {shouldPlay: false}
            )

            let soundLen = 15000
            await playbackObject.getStatusAsync().then((status) => {
                soundLen = status.durationMillis
            })

            whatIsPlaying(song, artist, soundLen)
            await playbackObject.playAsync()
            await sleep(soundLen + 2000)
            setPlaybackTimeout(false)
        }
    }
    // async function playSound(dir, artist, song) {
    //     if (!playbackTimeout) {
    //         if (numPlays > 0) {
    //             const newNumPlays = numPlays - 1
    //             setPlaybackTimeout(true)

    //             const {sound: playbackObject} = await Audio.Sound.createAsync(
    //                 {uri: 'https://inventory.linquint.dev/api/Files/csgo/musickits/' + dir + '/roundmvpanthem_01.mp3'},
    //                 {shouldPlay: false}
    //             )
                
    //             let soundLen = 15000
    //             await playbackObject.getStatusAsync().then((status) => {
    //                 soundLen = status.durationMillis
    //             })

    //             whatIsPlaying(song, artist, soundLen)
    //             await playbackObject.playAsync()
    //             await sleep(soundLen + 2000)
    //             setNumPlays(newNumPlays)
    //             setPlaybackTimeout(false)
    //         } else {
    //             setSnackbarRewardAd(true)
    //         }
    //     }
    // }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    const _renderMusicKit = ({item, index}) => (
        (item.song.includes(search) || item.artist.includes(search)) ?
            <View>
                <TouchableOpacity style={styles.container} onPress={async () => {
                    await playSound(item.dir, item.artist, item.song)
                }}>
                    <Image style={{width: resize(48), aspectRatio: 1, marginRight: 8}}
                           source={{uri: (item.img || imgNotFound)}}/>
                    <View style={[styles.containerCol]}>
                        <Text bold style={styles.song}>{item.song}</Text>
                        <Text bold style={styles.artist}>{item.artist}</Text>
                    </View>
                    {(!loadingPrices) ? <MusicKitPrices kit={item} prices={prices} scale={scale} rate={props.rate} exchange={props.exchange} /> : null}
                </TouchableOpacity>
                {(kits.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center',}} /> : null}
            </View> : null
    )

    return (
        (loading) ?
            <View style={[styles.containerCol, {alignSelf: 'center'}]}>
                <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large"
                                   color='#000'/>
                <Text style={{textAlign: 'center'}}>Downloading list of music kits...</Text>
            </View> :
            (loadingPrices) ?
                <View>
                    <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large"
                                       color='#000'/>
                    <Text style={{textAlign: 'center'}}>Downloading music kit prices...</Text>
                </View> :
                <View style={{height: '100%'}}>
                    <View style={{marginVertical: resize(8)}}>
                        <Text style={styles.title}>Tap to play <Text bold>MVP anthem</Text></Text>
                        {/* <Text style={styles.subTitle}>Available playbacks: <Text bold style={[numPlays === 0 ? {color: '#a00'} : {color: '#0a0'}]}>{numPlays}</Text></Text> */}
                    </View>

                    <View style={styles.inputView}>
                        <TextInput
                            style={{marginHorizontal: resize(8), flex: 1, height: resize(40), fontSize: resize(16), padding: 0, marginBottom: resize(8)}}
                            placeholder='Start typing artist or song name'
                            mode={'outlined'}
                            onChangeText={text => setSearch(text)}
                            label={'Music kit search'}
                            activeOutlineColor={'#1f4690'}
                            left={
                                <TextInput.Icon
                                    icon={() => (<Icon name={'filter'} type={'feather'} color={'#1f4690'} />)}

                                    size={resize(24)}
                                    style={{margin: 0, paddingTop: resize(8)}}
                                    name={'at'}
                                    forceTextInputFocus={false}
                                />
                            }
                        />
                    </View>

                    <FlatList
                        data={kits}
                        renderItem={_renderMusicKit}
                        keyExtractor={item => item.dir}
                    />

                    <Snackbar
                        visible={snackbarVisible}
                        style={{backgroundColor: "#193C6E"}}>
                        <View><Text style={styles.snackbarText}>{snackError}</Text></View>
                    </Snackbar>

                    <Snackbar
                        visible={snackbarRewardAd}
                        style={{backgroundColor: "#193C6E"}}
                        onDismiss={() => setSnackbarRewardAd(false)}
                        action={{
                            label: 'WATCH',
                            onPress: async () => {
                                setSnackbarRewardAd(false)
                                rewarded.show()
                            },
                        }}>
                        <View><Text style={styles.snackbarText}>Watch an <Text bold style={{color: '#6FC8F7'}}>AD</Text> to get more playbacks</Text></View>
                    </Snackbar>
                </View>
    )
}

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423
    return Math.ceil(size * scale)
}

const styles = StyleSheet.create({
    container: {
        marginTop: 6,
        marginBottom: 6,
        width: '95%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 8,
        alignSelf: 'center',
        padding: 8,
    },
    containerCol: {
        display: 'flex',
        flexDirection: 'column',
        width: '63%',
    },
    artist: {
        fontSize: resize(14),
        color: '#666',
    },
    song: {
        fontSize: resize(16),
        color: '#222',
    },
    title: {
        textAlign: 'center',
        fontSize: resize(20),
    },
    subTitle: {
        textAlign: 'center',
        fontSize: resize(14),
    },
    inputView: {
        width: '90%',
        height: resize(44),
        borderRadius: 8,
        paddingHorizontal: resize(10),
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
    },
    snackbarText: {
        fontSize: resize(13),
        color: '#fff'
    },
})