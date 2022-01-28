import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    LayoutAnimation,
    Pressable, Platform, UIManager, Image, Dimensions
} from "react-native";
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {useState} from "react";
import gamesJson from '../assets/inv-games.json'
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {Icon} from "react-native-elements";
import BSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet'

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function Inventory(props) {
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [inventory, setInventory] = useState([])
    const [fetching, setFetching] = useState(false)
    const [stats, setStats] = useState({
        'price': 0,
        'owned': 0,
        'ownedTradeable': 0,
        'avg24': 0,
        'avg7': 0,
        'avg30': 0,
        'cheapest': {
            'name': '',
            'price': 0
        },
        'expensive': {
            'name': '',
            'price': 0
        },
        'games': []
    })
    const games = gamesJson.games
    const rates = props.rates
    let rate = rates[props.rate].exc
    let curr = rates[props.rate].abb
    let tempArray = []

    const getInventory = async (id, end) => {
        setAlert('Loading data from Steam')
        fetch('https://steamcommunity.com/inventory/' + props.steam + '/' + id + '/2')
            .then((response) => {
                console.log("Steam response: " + JSON.stringify(response))
                return response.json()
            })
            .then((json) => {

                console.log("JSON response: " + JSON.stringify(json))

                json['appid'] = id
                json['game'] = gameName(id)
                tempArray.push(json)
                if (end) {
                    setLoading(false)
                    fetchData()
                }
            })
    }

    const fetchData = async () => {
        setFetching(true)
        setAlert('Getting prices')
        let queries = []
        for (let i = 0; i < tempArray.length; i++) {
            let query = 'https://domr.xyz/api/Steam/rq/prices.php?appid=' + tempArray[i].appid + '&hashes='

            let assets = tempArray[i].assets
            let items = tempArray[i].descriptions

            for (let j = 0; j < items.length; j++) {
                let num = 0
                let id = items[j].classid + items[j].instanceid

                if (items[j].marketable === 1) {
                    let item_hash = items[j].market_name.replace(',', ';')
                    query += item_hash + ','
                }

                for (let k = 0; k < assets.length; k++) {
                    let aID = assets[k].classid + assets[k].instanceid
                    if (id === aID) num++
                }
                tempArray[i].descriptions[j]['amount'] = num
                stats['owned'] += num
                if (items[j].marketable === 1 && items[j].tradable === 1) {
                    stats['ownedTradeable'] += num
                }
            }
            query = query.substring(0, query.length - 1)
            queries.push(query)
        }

        for (let i = 0; i < queries.length; i++) {
            const gameStats = { 'name': tempArray[i].game, 'value': 0, 'items': 0, 'avg24': 0, 'avg7': 0, 'avg30': 0 }
            let skipped = 0;
            fetch(queries[i])
                .then((response) => {
                    console.log("DOMR response: " + JSON.stringify(response))
                    return response.json()
                })
                .then(async (json) => {
                    for (let j = 0; j < json.length; j++) {
                        if (tempArray[i].descriptions[j + skipped].marketable === 1) {
                            let p = json[j]
                            tempArray[i].descriptions[j + skipped]['Price'] = p.Price
                            tempArray[i].descriptions[j + skipped]['Listed'] = p.Listed
                            tempArray[i].descriptions[j + skipped]['Updated'] = p.Updated
                            tempArray[i].descriptions[j + skipped]['avg24'] = p.avg24
                            tempArray[i].descriptions[j + skipped]['avg7'] = p.avg7
                            tempArray[i].descriptions[j + skipped]['avg30'] = p.avg30
                            stats['price'] += tempArray[i].descriptions[j + skipped]['amount'] * p.Price
                            gameStats['value'] += tempArray[i].descriptions[j + skipped]['amount'] * p.Price
                            stats['avg24'] += tempArray[i].descriptions[j + skipped]['amount'] * p.avg24
                            gameStats['avg24'] += tempArray[i].descriptions[j + skipped]['amount'] * p.avg24
                            stats['avg7'] += tempArray[i].descriptions[j + skipped]['amount'] * p.avg7
                            gameStats['avg7'] += tempArray[i].descriptions[j + skipped]['amount'] * p.avg7
                            stats['avg30'] += tempArray[i].descriptions[j + skipped]['amount'] * p.avg30
                            gameStats['avg30'] += tempArray[i].descriptions[j + skipped]['amount'] * p.avg30
                            gameStats['items'] += tempArray[i].descriptions[j + skipped]['amount']

                            if (stats['cheapest'].price === 0) {
                                stats['cheapest'].price = p.Price
                                stats['cheapest'].name = tempArray[i].descriptions[j + skipped]['market_name']
                            }

                            if (stats['cheapest'].price > p.Price) {
                                stats['cheapest'].price = p.Price
                                stats['cheapest'].name = tempArray[i].descriptions[j + skipped]['market_name']
                            }

                            if (stats['expensive'].price * 100 < tempArray[i].descriptions[j + skipped]['Price'] * 100) {
                                stats['expensive'].price = tempArray[i].descriptions[j + skipped]['Price']
                                stats['expensive'].name = tempArray[i].descriptions[j + skipped]['market_name']
                            }
                        } else {
                            tempArray[i].descriptions[j + skipped]['Price']     = 'NaN'
                            tempArray[i].descriptions[j + skipped]['Listed']    = 'NaN'
                            tempArray[i].descriptions[j + skipped]['Updated']   = 'NaN'
                            tempArray[i].descriptions[j + skipped]['avg24']     = 'NaN'
                            tempArray[i].descriptions[j + skipped]['avg7']      = 'NaN'
                            tempArray[i].descriptions[j + skipped]['avg30']     = 'NaN'
                            skipped++
                            j--
                        }
                    }

                    stats.games.push(gameStats)

                    if (i === queries.length - 1) {
                        setInventory(tempArray)
                        setLoaded(true)
                        setFetching(false)
                    } else {
                        await sleep(8000)
                    }
                })
        }
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    useEffect(async () => {
        if (!loaded) {
            setLoading(true)
            for (let i = 0; i < props.games.length; i++) {
                getInventory(props.games[i], i === props.games.length - 1).then(null)
            }
        }
    }, [])

    const gameName = (id) => {
        for (let i = 0; i < games.length; i++) {
            if (id === games[i].appid) {
                return games[i].name
            }
        }
    }

    const [alert, setAlert] = useState('')
    const [renderUnsellable, setRenderUnsellable] = useState(false)
    const scrollRef = useRef();

    return(
        <View style={{paddingBottom: 24}}>
            <View style={{height: '100%'}}>
                {
                    (loading || fetching) ?
                    <View style={styles.column}>
                        <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
                        <Text style={{textAlign: 'center'}}>{alert}</Text>
                        {(props.games.length > 1) ?
                            <Text style={{textAlign: 'center', alignSelf: 'center', marginVertical: 16, width: '70%'}}>You have selected { props.games.length } games, therefore it will take a bit longer to complete</Text>
                            : null
                        }
                    </View> :
                    <View style={[styles.column, {alignItems: 'center', marginVertical: 8}]}>
                        <BouncyCheckbox
                            isChecked={renderUnsellable}
                            onPress={(isChecked) => setRenderUnsellable(isChecked)}
                            text = 'Display non-tradable items'
                            textStyle={{textDecorationLine: "none"}}
                            fillColor={'#229'}
                            iconStyle={{borderWidth:2}}
                        />
                    </View>
                }
                <ScrollView ref={scrollRef} style={{marginBottom: 46}}>
                    {
                        (loaded) ?
                            inventory.map((item) => (
                                <View>
                                    <Text style={styles.gameName}>{item.game}</Text>
                                    {
                                        item.descriptions.map((inv) => (
                                            (renderUnsellable) ? <Item inv={inv} rate={rate} curr={curr} /> : (inv.tradable === 1 || inv.marketable === 1) ? <Item inv={inv} rate={rate} curr={curr} /> : null
                                        ))
                                    }
                                </View>
                            ))
                        : null
                    }
                    {
                        loaded ?
                            <TouchableOpacity style={styles.scrollProgress} onPress={() => scrollRef.current?.scrollTo({animated: true, y: 0})}>
                                <Icon name={'angle-double-up'} type={'font-awesome'} size={48} color={'#555'} />
                                <Text>This is the end of the inventory</Text>
                                <Text>Tap to scroll back to top</Text>
                            </TouchableOpacity> : null
                    }
                </ScrollView>
            </View>

            { (loaded) ? <Summary stats={stats} curr={rates[props.rate].abb} rate={rates[props.rate].exc} steam={props.steam} games={props.games} /> : null}
        </View>
    )
}

function Item(props) {
    const [open, setOpen] = useState(false)
    const onPress = () => {
        LayoutAnimation.easeInEaseOut();
        setOpen(!open)
    }
    const inv = props.inv
    const img = 'https://community.cloudflare.steamstatic.com/economy/image/' + inv.icon_url
    const not_found = 'https://icon-library.com/images/development_not_found-512.png'

    const duration = inv.Updated
    let minutes = Math.floor(duration / 60 % 60),
        hours = Math.floor(duration / 60 / 60),
        seconds = Math.floor(duration % 60);

    return (
        <Pressable onPress={() => onPress()}>
            <View style={[styles.container, open ? { borderWidth: 1 } : null]}>
                <View style={{display: 'flex', flexDirection: 'row',}}>
                    <View style={[styles.flowColumn, {width: '96%'}]}>
                        <Text style={styles.itemName}>{inv.market_name}</Text>
                        <Text>{inv.type}</Text>
                    </View>
                </View>
                <View style={[styles.flowRow]}>
                    <Text style={styles.itemPriceTitle}>Owned</Text>
                    <Text style={styles.itemPriceTitle}>Price per item</Text>
                    <Text style={styles.itemPriceTitle}>Total Price</Text>
                </View>
                <View style={styles.flowRow}>
                    <Text style={styles.itemPrice}>{inv.amount}</Text>
                    <Text style={styles.itemPrice}>{props.curr} {Math.round(inv.Price * props.rate * 100) / 100}</Text>
                    <Text style={styles.itemPrice}>{props.curr} {(inv.Price === 'NaN' ? 'NaN' : Math.round(inv.Price * props.rate * 100) / 100 * inv.amount)}</Text>
                </View>
            </View>
            { open &&
                <View style={styles.containerCollapsable}>
                    <View style={styles.row}>
                        <Image style={{width: '22%', aspectRatio: 1.3, marginRight: 4}} source={open ? {uri: img} : {uri: not_found}} />
                        <View style={[styles.column, {width: '73%'}]}>
                            <Text>Item is <Text style={{fontWeight: 'bold'}}>{inv.marketable === 1 ? 'marketable' : 'non-marketable'}</Text> and <Text style={{fontWeight: 'bold'}}>{inv.tradable ? 'tradable' : 'non-tradable'}</Text></Text>
                            { (inv.Price === 'NaN' || (inv.Price === 0.03 && inv.Listed === 0)) ?
                                <View>
                                    <Text style={{fontWeight: 'bold'}}>Market details unavailable for this item</Text>
                                </View> :
                                <View>
                                    <Text>Price updated <Text style={{fontWeight: 'bold'}}>{hours}</Text>h <Text style={{fontWeight: 'bold'}}>{minutes}</Text>min <Text style={{fontWeight: 'bold'}}>{seconds}</Text>s ago</Text>
                                    <Text><Text style={{fontWeight: 'bold'}}>{inv.Listed}</Text> listings on Steam Market</Text>
                                </View>
                            }
                            {inv.hasOwnProperty('fraudwarnings') ? <Text>Name Tag: <Text style={{fontWeight: 'bold'}}>{inv.fraudwarnings[0].substring(12, inv.fraudwarnings[0].length - 2)}</Text></Text> : null}
                        </View>
                    </View>
                    {(inv.Price === 'NaN' || (inv.Price === 0.03 && inv.Listed === 0)) ?
                        null :
                        <View style={{alignSelf: 'center'}}>
                            <View style={styles.flowRow}>
                                <Text style={styles.avgTitle}>24 hour average</Text>
                                <Text style={styles.avgTitle}>7 day average</Text>
                                <Text style={styles.avgTitle}>30 day average</Text>
                            </View>
                            <View style={styles.flowRow}>
                                <Text style={styles.avgDetails}>{props.curr} {Math.round(inv.avg24 * props.rate * 1000) / 1000}</Text>
                                <Text style={styles.avgDetails}>{props.curr} {Math.round(inv.avg7 * props.rate * 1000) / 1000}</Text>
                                <Text style={styles.avgDetails}>{props.curr} {Math.round(inv.avg30 * props.rate * 1000) / 1000}</Text>
                            </View>
                        </View>
                    }
                </View>
            }
        </Pressable>
    )
}

function Summary(props) {
    const sumRef = useRef();
    const snapPoints = useMemo(() => [70, 400], []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const stats = props.stats
    const curr = props.curr
    const rate = props.rate

    return (
        <BSheet
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            detached={false}
            ref={sumRef}>
            <BottomSheetScrollView style={{width: '100%', height: '100%', backgroundColor: '#fff', paddingVertical: 8}}>
                <View style={{alignItems: 'center'}}>
                    <Text style={[styles.gameTitle, {fontSize: 20, marginBottom: 8}]}>Inventory Details</Text>
                    <Text>SteamID: <Text style={{fontWeight: 'bold'}}>{props.steam}</Text></Text>
                    <Text>Games loaded (appid): <Text style={{fontWeight: 'bold'}}>{JSON.stringify(props.games)}</Text></Text>

                    <View style={[styles.column, {width: '95%'}]}>

                        <View style={styles.summarySection}>
                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>Total value</Text>
                                <Text style={styles.statsDetails}>{curr} {Math.round(stats['price'] * rate * 100) / 100} ({stats['ownedTradeable']} items)</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>Average item price</Text>
                                <Text style={styles.statsDetails}>{curr} {(Math.round(stats['price'] / stats['ownedTradeable'] * rate * 100) / 100)} / item</Text>
                            </View>
                        </View>

                        <View style={styles.summarySection}>
                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>24 hour average value</Text>
                                <Text style={styles.statsDetails}>{curr} {Math.round(stats['avg24'] * rate * 1000) / 1000}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>7 day average value</Text>
                                <Text style={styles.statsDetails}>{curr} {Math.round(stats['avg7'] * rate * 1000) / 1000}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>30 day average value</Text>
                                <Text style={styles.statsDetails}>{curr} {Math.round(stats['avg30'] * rate * 1000) / 1000}</Text>
                            </View>
                        </View>

                        <View style={styles.summarySection}>
                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>Most expensive item</Text>
                                <View style={[styles.column, {width: '55%'}]}>
                                    <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['expensive'].name}</Text>
                                    <Text style={[styles.statsDetails, {width: '100%'}]}>{curr} {Math.round(stats['expensive'].price * rate * 100) / 100}</Text>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.statsTitle}>Cheapest item</Text>
                                <View style={[styles.column, {width: '55%'}]}>
                                    <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['cheapest'].name}</Text>
                                    <Text style={[styles.statsDetails, {width: '100%'}]}>{curr} {Math.round(stats['cheapest'].price * rate * 100) / 100}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.gameName}>Game stats</Text>

                        {
                            stats.games.map((data) => (
                                <View style={styles.summarySection}>
                                    <Text>{ data.name }</Text>

                                    <View style={styles.row}>
                                        <Text style={styles.statsTitle}>Value</Text>
                                        <Text style={styles.statsDetails}>{curr} {Math.round(data.value * rate * 100) / 100}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.statsTitle}>Items owned</Text>
                                        <Text style={styles.statsDetails}>{data.items}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.statsTitle}>Average 24 hour</Text>
                                        <Text style={styles.statsDetails}>{curr} {Math.round(data.avg24 * rate * 1000) / 1000}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.statsTitle}>Average 7 day</Text>
                                        <Text style={styles.statsDetails}>{curr} {Math.round(data.avg7 * rate * 1000) / 1000}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <Text style={styles.statsTitle}>Average 30 day</Text>
                                        <Text style={styles.statsDetails}>{curr} {Math.round(data.avg30 * rate * 1000) / 1000}</Text>
                                    </View>
                                </View>
                            ))
                        }

                    </View>
                </View>
            </BottomSheetScrollView>
        </BSheet>
    )
}

const styles = StyleSheet.create ({
    container: {
        marginTop: 6,
        marginBottom: 6,
        width: '95%',
        backgroundColor: '#ccc',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        alignSelf: 'center',
        elevation: 3,
    },
    containerCollapsable: {
        width: '95%',
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 4,
        alignSelf: 'center',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
    },
    flowRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    flowColumn: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    gameTitle: {
        color: '#222',
        fontWeight: "bold",
    },
    appID: {
        color: '#222'
    },
    containerSelected: {
        borderWidth: 1.0,
        borderColor: '#0f0',
    },
    gameName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
        marginLeft: 8,
    },
    itemIcon: {
        width: 56,
        height: 56,
        alignSelf: 'center',
    },
    itemName: {
        fontSize: 15,
        fontWeight: "bold",
        width: '100%',
    },
    itemPriceTitle: {
        width: '33%',
        textAlign: "center",
        fontWeight: 'bold',
    },
    itemPrice: {
        width: '33%',
        textAlign: "center",
    },
    avgTitle: {
        fontWeight: "bold",
        color: '#666',
        width: '32%',
        textAlign: "center",
    },
    avgDetails: {
        fontSize: 15,
        fontWeight: "bold",
        color: '#333',
        width: '32%',
        textAlign: "center",
    },
    alert: {
        position: "absolute",
        top: 8,
        backgroundColor: '#1221ff',
        width: '90%',
        overflow: "hidden",
        alignSelf: "center",
        borderRadius: 8,
    },
    msg: {
        margin: 8,
        color: '#fff',
    },
    detailsPress: {
        width: '67%',
        alignSelf: "center",
        backgroundColor: '#d3d5d8',
        marginVertical: 8,
        borderRadius: 8,
    },
    detailsText: {
        fontSize: 19,
        fontWeight: "bold",
        textAlign: "center",
        textAlignVertical: "center",
        marginVertical: 8,
    },
    statsTitle: {
        fontSize: 13,
        textAlignVertical: 'center',
        textAlign: 'left',
        width: '45%',
    },
    statsDetails: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'right',
        width: '55%',
    },
    statsDetailsS: {
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'right',
        width: '55%',
    },
    scrollProgress: {
        width: '65%',
        alignSelf: 'center',
        alignItems: 'center',
        padding: 8,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 5,
    },
    summarySection: {
        borderWidth: 1.0,
        borderRadius: 8,
        padding: 4,
        marginVertical: 6,
        alignSelf: 'center',
    }
})