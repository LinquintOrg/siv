import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from "react-native";
import React, {useState} from "react";
import {Audio} from 'expo-av';
import {AdMobRewarded} from "expo-ads-admob";
import {Divider, Icon} from "react-native-elements";
import {Snackbar} from "react-native-paper";

export default function MusicKits(props) {
    const [loading, setLoading] = useState(true)
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [kits, setKits] = useState({})
    // const [sound, setSound] = useState();
    const [prices, setPrices] = useState([]);
    const imgNotFound = 'https://domr.xyz/api/Files/img/no-photo.png'
    const [numPlays, setNumPlays] = useState(5)                         // Save @numPlays to prevent app relaunch to get more plays
    const [playbackTimeout, setPlaybackTimeout] = useState(false)
    const [search, setSearch] = useState('')
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackError, setSnackError] = useState('')
    const [snackbarRewardAd, setSnackbarRewardAd] = useState(false)

    if (loading) {
        fetch('https://domr.xyz/api/Steam/rq/music_kits.json')
            .then((response) => response.json())
            .then((json) => {
                setKits(json)
                setLoading(false)
                setLoadingPrices(true)
            })
    }

    if (loadingPrices) {
        fetch('https://domr.xyz/api/Steam/rq/music_kit_prices.php')
            .then((response) => response.json())
            .then(json => {
                setPrices(json)
                setLoadingPrices(false)
            })
    }

    async function playSound(dir, artist, song) {
        if (!playbackTimeout) {
            if (numPlays > 0) {
                const newNumPlays = numPlays - 1
                setPlaybackTimeout(true)

                /*
                 *      Should probably try to use a proper object to create Async. If that doesn't work out try to use it with ref as explained
                 *      here: https://stackoverflow.com/questions/67618888/expo-av-playbackobjects-onplaybackstatusupdate-is-called-only-on-play-stop-inst
                 */

                const {sound: playbackObject} = await Audio.Sound.createAsync(
                    {uri: 'https://domr.xyz/api/Files/csgo/musickits/' + dir + '/roundmvpanthem_01.mp3'},
                    {shouldPlay: true}
                )

                setSnackError(<Text>Now Playing <Text style={{fontWeight: 'bold', color: '#6FC8F7'}}>{song}</Text> by <Text style={{color: '#6FC8F7'}}>{artist}</Text></Text>)
                setSnackbarVisible(true)
                await sleep(5000)
                setSnackbarVisible(false)
                await sleep(9000)
                setNumPlays(newNumPlays)
                setPlaybackTimeout(false);

                /*playbackObject.setOnPlaybackStatusUpdate(async status => {
                    if (status.isLoaded) {
                        if (status.isPlaying) {
                            setSnackError(<Text>Now Playing <Text
                                style={{fontWeight: 'bold', color: '#fff'}}>{song}</Text> by <Text
                                style={{color: '#fff'}}>{artist}</Text></Text>)
                            setSnackbarVisible(true)
                        }

                        if (status.didJustFinish) {
                            setSnackbarVisible(false)
                            await sleep(2000)
                            setNumPlays(newNumPlays)
                            setPlaybackTimeout(false);
                        }
                    }
                })*/
            } else {
                setSnackbarRewardAd(true)
            }
        }
    }

    async function playRewardAd() {
        await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917'); // Test ID, Replace with your-admob-unit-id
        AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
            setNumPlays(5)
        });
        await AdMobRewarded.requestAdAsync();
        await AdMobRewarded.showAdAsync()
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    const getMusicKitPrice = (kit) => {
        const title = (kit.artist + ',' + kit.song).toLowerCase()
        const stTitle = 'st ' + title

        let pNormal = null
        let pStat = null

        for (let i = 0; i < prices.length; i++) {
            if (title === prices[i].Hash) {
                pNormal = Math.round(props.exchange * prices[i].Price * 100) / 100
            }
            if (stTitle === prices[i].Hash) {
                pStat = Math.round(props.exchange * prices[i].Price * 100) / 100
            }
            if (pNormal !== null && pStat !== null) break;
        }

        if (pNormal === null && pStat === null) {
            return (
                <View style={styles.containerCol}>
                    <Text style={styles.price}>Cannot be sold</Text>
                </View>
            )
        }
        if (pNormal === null) {
            return (
                <View style={styles.containerCol}>
                    <Text style={styles.price}>NaN</Text>
                    <Text style={[styles.price, {color: '#CF6A32'}]}>{props.rate} {pStat}</Text>
                </View>
            )
        }
        if (pStat === null) {
            return (
                <View style={styles.containerCol}>
                    <Text style={styles.price}>{props.rate} {pNormal}</Text>
                    <Text style={[styles.price, {color: '#CF6A32'}]}>NaN</Text>
                </View>
            )
        }
        return (
            <View style={styles.containerCol}>
                <Text style={styles.price}>{props.rate} {pNormal}</Text>
                <Text style={[styles.price, {color: '#CF6A32'}]}>{props.rate} {pStat}</Text>
            </View>
        )
    }

    return (
        (loading) ?
            <View style={[styles.containerCol, {alignSelf: 'center'}]}>
                <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large"
                                   color='#000'/>
                <Text style={{textAlign: 'center'}}>Loading</Text>
            </View> :
            (loadingPrices) ?
                <View>
                    <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large"
                                       color='#000'/>
                    <Text style={{textAlign: 'center'}}>Downloading music kit prices</Text>
                </View> :
                <View style={{height: '100%'}}>
                    <View style={{marginVertical: 8}}>
                        <Text style={styles.title}>Music Kits</Text>
                        <Text style={styles.subTitle}>Tap to play MVP anthem</Text>
                        <Text style={styles.subTitle}>Available playbacks: <Text
                            style={[numPlays === 0 ? {color: '#a00'} : {color: '#0a0'}, {fontWeight: 'bold'}]}>{numPlays}</Text></Text>
                    </View>

                    <View style={styles.inputView}>
                        <Icon color='#333' name='filter' type='font-awesome' size={20}/>
                        <TextInput
                            style={{marginHorizontal: 8, borderBottomWidth: 1.0, flex: 1}}
                            placeholder='Filter by artist or song name'
                            onChangeText={text => setSearch(text)}
                        />
                    </View>

                    <ScrollView>
                        {
                            kits.musickit.map((item, index) => (
                                (item.song.includes(search) || item.artist.includes(search)) ?
                                    <View>
                                        <TouchableOpacity style={styles.container} onPress={async () => {
                                            await playSound(item.dir, item.artist, item.song)
                                        }}>
                                            <Image style={{width: 48, aspectRatio: 1, marginRight: 8}}
                                                   source={{uri: (item.img || imgNotFound)}}/>
                                            <View style={styles.containerCol}>
                                                <Text style={styles.song}>{item.song}</Text>
                                                <Text style={styles.artist}>{item.artist}</Text>
                                            </View>
                                            {(!loadingPrices) ? getMusicKitPrice(item) : null}
                                        </TouchableOpacity>

                                        { (kits.musickit.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center',}} /> : null }
                                    </View> : null
                            ))
                        }
                    </ScrollView>

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
                                await playRewardAd().then(r => null)
                            },
                        }}>
                        <View><Text style={styles.snackbarText}>Watch an <Text style={{fontWeight: 'bold', color: '#6FC8F7'}}>AD</Text> to get more playbacks</Text></View>
                    </Snackbar>
                </View>
    )
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
        fontSize: 14,
        fontWeight: "bold",
        color: '#666',
    },
    song: {
        fontSize: 17,
        fontWeight: "bold",
        color: '#222',
    },
    price: {
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'center',
        width: '30%',
        textAlign: 'right',
        alignContent: 'space-between'
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    subTitle: {
        textAlign: 'center',
        fontSize: 13,
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
    snackbarText: {
        fontSize: 15,
        color: '#fff'
    }
})