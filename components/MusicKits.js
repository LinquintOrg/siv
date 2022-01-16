import {ActivityIndicator, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {useState} from "react";
import {Audio} from 'expo-av';
import {AdMobRewarded} from "expo-ads-admob";

export default function MusicKits(props) {
    const [loading, setLoading] = useState(true)
    const [loadingPrices, setLoadingPrices] = useState(false);
    const [kits, setKits] = useState({})
    const [sound, setSound] = useState();
    const [prices, setPrices] = useState([]);
    const imgNotFound = 'https://domr.xyz/api/Files/img/no-photo.png'
    const [numPlays, setNumPlays] = useState(5)
    const [playbackTimeout, setPlaybackTimeout] = useState(false)

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

    async function playSound(dir) {
        if (!playbackTimeout) {
            if (numPlays > 0) {
                const newNumPlays = numPlays - 1
                setPlaybackTimeout(true)
                const {sound: playbackObject} = await Audio.Sound.createAsync(
                    {uri: 'https://domr.xyz/api/Files/csgo/musickits/' + dir + '/roundmvpanthem_01.mp3'},
                    {shouldPlay: true}
                );
                await sleep(15000)
                setNumPlays(newNumPlays)
                setPlaybackTimeout(false)
            } else {
                playRewardAd().then(setNumPlays(5))
            }
        }
    }

    async function playRewardAd() {
        await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917'); // Test ID, Replace with your-admob-unit-id
        await AdMobRewarded.requestAdAsync();
        await AdMobRewarded.showAdAsync();
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    function getMusicKitPrice(kit) {
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
                    <Text style={[styles.price, {color: '#CF6A32'}]}>{props.rate} { pStat }</Text>
                </View>
            )
        }
        if (pStat === null) {
            return (
                <View style={styles.containerCol}>
                    <Text style={styles.price}>{props.rate} { pNormal }</Text>
                    <Text style={[styles.price, {color: '#CF6A32'}]}>NaN</Text>
                </View>
            )
        }
        return (
            <View style={styles.containerCol}>
                <Text style={styles.price}>{props.rate} { pNormal }</Text>
                <Text style={[styles.price, {color: '#CF6A32'}]}>{props.rate} { pStat }</Text>
            </View>
        )
    }

    return (
        <View>
            <View style={{marginVertical: 8}}>
                <Text style={styles.title}>Music Kits</Text>
                <Text style={styles.subTitle}>Tap to play MVP anthem</Text>
                <Text style={styles.subTitle}>Available playbacks: <Text style={[numPlays === 0 ? {color: '#a00'} : {color: '#0a0'}, {fontWeight: 'bold'}]}>{ numPlays }</Text></Text>
            </View>
            <ScrollView>
                {
                    (loading) ?
                        <View style={[styles.containerCol, {alignSelf: 'center'}]}>
                            <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
                            <Text style={{textAlign: 'center'}}>Loading</Text>
                        </View> :
                        (loadingPrices) ?
                            <View>
                                <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
                                <Text style={{textAlign: 'center'}}>Downloading music kit prices</Text>
                            </View> :
                            kits.musickit.map((item) => (
                                <Pressable style={styles.container} onPress={() => playSound(item.dir)}>
                                    <Image style={{width: 48, aspectRatio: 1, marginRight: 8}} source={{uri: (item.img || imgNotFound)}} />
                                    <View style={styles.containerCol}>
                                        <Text style={styles.song}>{item.song}</Text>
                                        <Text style={styles.artist}>{item.artist}</Text>
                                    </View>
                                    { getMusicKitPrice(item) }
                                </Pressable>
                            ))
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 6,
        marginBottom: 6,
        width: '95%',
        backgroundColor: '#ddd',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 8,
        alignSelf: 'center',
        padding: 8,
        elevation: 3,
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
})