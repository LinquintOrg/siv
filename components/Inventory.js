import {
    ActivityIndicator,
    Dimensions,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import gamesJson from '../assets/inv-games.json'
import BouncyCheckbox from "react-native-bouncy-checkbox";
import {Divider, Icon} from "react-native-elements";
import BSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import {Dropdown} from "react-native-element-dropdown";
import {Modal, Portal, Provider, Snackbar} from "react-native-paper";
import NetInfo from "@react-native-community/netinfo";
import Text from '../Elements/text'

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function Inventory(props) {
    const [loaded, setLoaded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [inventory, setInventory] = useState([])
    const [fetching, setFetching] = useState(false)
    const [isEmpty, setIsEmpty] = useState(false)
    const [stats] = useState({
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
    const [rate, setRate] = useState(rates[props.rate].exc)
    const [curr, setCurr] = useState(rates[props.rate].abb)
    let tempArray = []
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState(0)
    const [stickerPrices] = useState({})
    // const [invSize, setInvSize] = useState(0)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackError, setSnackError] = useState('')
    const [filterVisible, setFilterVisible] = useState(false)
    const [containsCSGO, setContainsCSGO] = useState(false)

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const sortOptionsData = [
        { label: 'Default', value: 0 },
        { label: 'Price', value: 1 },
        { label: 'Name', value: 2 }
    ]

    const getInventory = async (id, end) => {
        setAlert('Loading data from Steam')
        setLoading(true)
        await fetch('https://steamcommunity.com/inventory/' + props.steam + '/' + id + '/2/?count=1000')
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    setSnackError('Couldn\'t acquire data from Steam.')
                    setSnackbarVisible(true)
                    return null
                }
            })
            .then(async (json) => {
                if (json !== null) {
                    json['appid'] = id
                    json['game'] = gameName(id)
                    if (id === 730) setContainsCSGO(true)
                    tempArray.push(json)

                    if (end) {
                        setLoading(false)
                        await fetchData()
                    }
                } else {
                    setLoading(false)
                    setFetching(false)
                }
            })
    }

    function findStickers(desc) {
        let hasStickers = false;
        let dID;
        for (let i = 0; i < desc.length; i++) {
            if (desc[i].value.includes('sticker_info')) {
                hasStickers = true
                dID = i
                break
            }
        }
        if (!hasStickers) return null

        let html = desc[dID].value
        let count = (html.match(/img/g) || []).length
        let type = (html.match('Sticker')) ? 'sticker' : 'patch'

        for (let j = 0; j < count; j++) {
            html = html.replace('<br><div id="sticker_info" name="sticker_info" title="Sticker" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>', '')
            html = html.replace('<br><div id="sticker_info" name="sticker_info" title="Patch" style="border: 2px solid rgb(102, 102, 102); border-radius: 6px; width=100; margin:4px; padding:8px;"><center>', '')
            html = html.replace('</center></div>', '')
            html = html.replace('<img width=64 height=48 src="', '')
            html = html.replace('<br>Sticker: ', '')
            html = html.replace('<br>Patch: ', '')
            html = html.replace('">', ';')
        }

        let tmpArr = html.split(';')
        let tmpNames = tmpArr[count].split(', ')
        tmpArr = tmpArr.splice(0, count)

        let tmpStickers = []
        for (let j = 0; j < count; j++) {
            let abb = (type === 'sticker') ? 'Sticker | ' : 'Patch | '
            let sticker = { name: tmpNames[j], img: tmpArr[j], long_name: abb + tmpNames[j] }
            tmpStickers.push(sticker)
        }

        return {
            type: type,
            sticker_count: count,
            stickers: tmpStickers
        }
    }

    const getLoadingItemsAmount = () => {
        let tmpLen = 0;
        for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i].total_inventory_count > 0) tmpLen += tempArray[i].assets.length
        }
        return tmpLen
    }

    const fetchData = async () => {
        setFetching(true)
        const itemsAmount = getLoadingItemsAmount()

        if (itemsAmount === 0) {
            setIsEmpty(true)
            return
        } else if (itemsAmount > 700) {
            setAlert('Getting prices... It may take a few minutes to complete...')
        } else if (itemsAmount > 300) {
            setAlert('Getting prices... It may take up to a minute to complete...')
        } else {
            setAlert('Getting prices... This shouldn\'t take long...')
        }
        let queries = []
        let tmpStickers = []

        for (let i = 0; i < tempArray.length; i++) {
            if (tempArray[i].total_inventory_count > 0) {
                let query = {
                    app: tempArray[i].appid,
                    hashes: ''
                }

                let tmpHash = ''

                let assets = tempArray[i].assets
                let items = tempArray[i].descriptions

                for (let j = 0; j < items.length; j++) {
                    let num = 0
                    let id = items[j].classid + items[j].instanceid

                    if (items[j].marketable === 1) {
                        let item_hash = items[j].market_name.replace(',', ';')
                        tmpHash += item_hash + ','
                    }

                    for (let k = 0; k < assets.length; k++) {
                        let aID = assets[k].classid + assets[k].instanceid
                        if (id === aID) num++
                    }

                    // if CSGO, get info about stickers
                    if (tempArray[i].appid === 730) {
                        let tmp = findStickers(tempArray[i].descriptions[j].descriptions)
                        if (tmp !== null) {
                            tempArray[i].descriptions[j]['stickers'] = tmp
                            tempArray[i].descriptions[j]['stickers'].stickers.forEach(sticker => {
                                if (!tmpStickers.includes(sticker.long_name)) {
                                    tmpStickers.push(sticker.long_name)
                                }
                            })
                        }
                    }

                    tempArray[i].descriptions[j]['amount'] = num
                    stats['owned'] += num
                    if (items[j].marketable === 1 && items[j].tradable === 1) {
                        stats['ownedTradeable'] += num
                    }
                }
                query.hashes = tmpHash.substring(0, tmpHash.length - 1)
                queries.push(query)
            }
        }

        for (let i = 0; i < queries.length; i++) {
            const gameStats = { 'name': tempArray[i].game, 'value': 0, 'items': 0, 'avg24': 0, 'avg7': 0, 'avg30': 0, 'stickerVal': 0, 'patchVal': 0 }
            let skipped = 0;

            const post = {
                "appid": queries[i].app,
                "hashes": queries[i].hashes
            }

            let myHeaders = new Headers()
            myHeaders.append('Content-Type', 'application/json')

            const options = {
                method: 'POST',
                body: JSON.stringify(post),
                headers: myHeaders
            }

            await fetch('https://domr.xyz/api/Steam/rq/getPrices.php', options)
                .then(response => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        setFetching(false)
                        setSnackError('Error occured while getting prices')
                        setSnackbarVisible(true)
                        return null
                    }
                })
                .then(async (json) => {
                    if (json === null) return
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
                        await getStickerPrices(tmpStickers).then(() => {
                            setInventory(tempArray)
                            setLoaded(true)
                            setFetching(false)
                        })
                    } else {
                        await sleep(1000)
                    }
                })
        }
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    async function getStickerPrices(stickers) {
        if (stickers.length > 0) {
            let stickersURL = 'https://domr.xyz/api/Steam/rq/stickers.php?hashes=' + stickers.toString()

            await fetch(stickersURL)
                .then(response => {
                    return response.json()
                })
                .then(json => {
                    let stickerTotal = 0.0
                    let patchTotal = 0.0
                    json.forEach((price, index) => {
                        stickerPrices[stickers[index]] = price['Price']
                        if (stickers[index].toLowerCase().includes('sticker')) stickerTotal += parseFloat(price['Price'])
                        else patchTotal += parseFloat(price['Price'])
                    })

                    stats.games.forEach((game, index) => {
                        if (game.name === 'Counter-Strike: Global Offensive') {
                            stats.games[index].stickerVal = stickerTotal
                            stats.games[index].patchVal = patchTotal
                        }
                    })
                })
        }
    }

    useLayoutEffect(() => {
        setRate(rates[props.rate].exc)
        setCurr(rates[props.rate].abb)
    }, [props.rate])

    useEffect(async () => {
        if (!loaded) {
            let internetConnection = await NetInfo.fetch();
            if (!internetConnection.isInternetReachable && !internetConnection.isConnected) {
                setAlert("No internet connection")
                return
            }

            setLoading(true)
            for (let i = 0; i < props.games.length; i++) {
                await getInventory(props.games[i], i === props.games.length - 1).then(null)
                if (i !== props.games.length - 1) await sleep(7000)
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
    const [renderNameTag, setRenderNameTag] = useState(false)
    const [renderAppliedSticker, setRenderAppliedSticker] = useState(false)
    const scrollRef = useRef();

    function displayItem(item) {
        let render = item.tradable === 1 || item.marketable === 1
        let renderSearch = true

        if (search !== '') {
            renderSearch = (item.market_name.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase()))
        }

        if (renderUnsellable) {
            render = true
        }

        if (item.appid === 730) {
            if (renderNameTag) {
                render = item.hasOwnProperty('fraudwarnings') && render
            }

            if (renderAppliedSticker) {
                render = item.hasOwnProperty('stickers') && render
            }
        }
        return (render && renderSearch)
    }

    const _renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    return(
        <View>
            <View style={{height: '100%'}}>
                {
                    (isEmpty) ?
                    <View style={styles.column}>
                        <Text style={{textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 36}}>No items found.</Text>
                        <Text style={{textAlign: 'center'}}>Choose different games and try again</Text>
                    </View> :
                    (loading || fetching) ?
                    <View style={styles.column}>
                        <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
                        <Text style={{textAlign: 'center'}}>{alert}</Text>
                        {(props.games.length > 1) ?
                            <Text style={{textAlign: 'center', alignSelf: 'center', marginVertical: resize(16), width: '70%'}}>You have selected { props.games.length } games, therefore it will take a bit longer to complete</Text>
                            : null
                        }
                    </View> :
                    <View style={[styles.column, {alignItems: 'center', marginVertical: resize(8)}]}>
                        <View style={styles.inputView}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={'Search for items'}
                                onChangeText={text => setSearch(text)}
                            />
                        </View>
                        <View style={styles.fsRow}>
                            <View style={styles.fsCell}>
                                <Dropdown
                                    style={styles.dropdown}
                                    containerStyle={styles.shadow}
                                    data={sortOptionsData}
                                    label="Sort order"
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select sort order"
                                    value={sort}
                                    onChange={item => {
                                        setSort(item.value)
                                    }}
                                    renderItem={item => _renderItem(item)}
                                    maxHeight={resize(160)}
                                    activeColor={'#dde'}
                                />
                            </View>

                            <View style={styles.fsCell}>
                                <Pressable style={styles.filterPressable} onPress={() => setFilterVisible(true)}>
                                    <Icon name={'filter'} type={'feather'} size={resize(20)} color={'#229'} />
                                    <Text style={styles.filterPressableText}>Filter options</Text>
                                </Pressable>
                            </View>
                        </View>

                    </View>
                }
                <ScrollView ref={scrollRef}>
                    {
                        (loaded) ?
                            inventory.map((item) => (
                                <View>
                                    <Text bold style={styles.gameName}>{item.game}</Text>
                                    {
                                        (item.total_inventory_count === 0) ?
                                            <View>
                                                <Text style={{fontSize: resize(18), color: '#444', textAlign: 'center', marginBottom: resize(16)}}>Game inventory is empty.</Text>
                                            </View> :
                                            item.descriptions.map((inv, index) => (
                                                (displayItem(inv)) ?
                                                    <View>
                                                        <Item inv={inv} rate={rate} curr={curr} stPrices={stickerPrices} />

                                                        {(item.descriptions.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center'}} /> : null}
                                                    </View> : null
                                            ))
                                    }
                                </View>
                            ))
                        : null
                    }
                    {
                        loaded ?
                            <TouchableOpacity style={styles.scrollProgress} onPress={() => scrollRef.current?.scrollTo({animated: true, y: 0})}>
                                <Icon name={'angle-double-up'} type={'font-awesome'} size={resize(48)} color={'#555'} />
                                <Text style={{fontSize: resize(14)}}>This is the end of the inventory</Text>
                                <Text style={{fontSize: resize(14)}}>Tap to scroll back to top</Text>
                            </TouchableOpacity> : null
                    }
                </ScrollView>
            </View>

            { (loaded) ? <Summary stats={stats} curr={rates[props.rate].abb} rate={rates[props.rate].exc} steam={props.steam} games={props.games} /> : null}

            <Provider>
                <Portal>
                    <Modal visible={filterVisible} onDismiss={() => setFilterVisible(false)} contentContainerStyle={styles.containerStyle}>
                        <Text bold style={styles.fModalTitle}>Filter</Text>

                        <Text bold style={styles.fModalGameTitle}>All Games</Text>
                        <BouncyCheckbox
                            isChecked={renderUnsellable}
                            onPress={(isChecked) => setRenderUnsellable(isChecked)}
                            text={<Text style={{fontSize:resize(14)}}>Display <Text bold>non-tradable</Text> items</Text>}
                            textStyle={{textDecorationLine: "none"}}
                            fillColor={'#229'}
                            iconStyle={{borderWidth:resize(3)}}
                            style={{marginLeft: resize(16)}}
                            size={resize(22)}
                        />

                        { (containsCSGO) ?
                            <View>
                                <Text bold style={styles.fModalGameTitle}>Counter-Strike: Global Offensive</Text>
                                <BouncyCheckbox
                                    isChecked={renderNameTag}
                                    onPress={(isChecked) => setRenderNameTag(isChecked)}
                                    text={<Text style={{fontSize:resize(14)}}>Display items with <Text bold>Name Tags</Text> only</Text>}
                                    textStyle={{textDecorationLine: "none"}}
                                    fillColor={'#229'}
                                    iconStyle={{borderWidth:resize(3)}}
                                    style={{marginLeft: resize(16), marginVertical: resize(8),}}
                                    size={resize(22)}
                                />

                                <BouncyCheckbox
                                    isChecked={renderAppliedSticker}
                                    onPress={(isChecked) => setRenderAppliedSticker(isChecked)}
                                    text={<Text style={{fontSize:resize(14)}}>Display items with <Text bold>Stickers</Text> only</Text>}
                                    textStyle={{textDecorationLine: "none"}}
                                    fillColor={'#229'}
                                    iconStyle={{borderWidth:resize(3)}}
                                    style={{marginLeft: resize(16), marginVertical: resize(8),}}
                                    size={resize(22)}
                                />
                            </View> : null
                        }
                    </Modal>
                </Portal>
            </Provider>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                style={{backgroundColor: "#193C6E"}}
                action={{
                    label: 'DISMISS',
                    onPress: () => {
                        setSnackbarVisible(false)
                    },
                }}>
                <View><Text style={styles.snackbarText}>{snackError}</Text></View>
            </Snackbar>
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
    const winWidth = Dimensions.get('window').width;

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const getAppliedPrice = (name) => {
        return props.stPrices[name]
    }

    const getTotalAppliedValue = (items) => {
        let baseText = ((items.type === 'sticker') ? 'Applied stickers value ' : 'Applied patches value ')
        let sum = 0.0
        items.stickers.forEach(item => {
            sum += parseFloat(Math.round(props.stPrices[item.long_name] * props.rate * 100) / 100)
        })
        return (
            <Text style={styles.totalAppliedValueText}>{baseText}<Text bold style={styles.totalAppliedValue}>{props.curr} {Math.round(sum * 100) / 100}</Text></Text>
        )
    }

    const getStickerWidth = (count) => {
        let tmpW = Math.floor(winWidth / count * 0.95)
        return (tmpW > 72) ? 72 : tmpW
    }

    const duration = inv.Updated
    let minutes = Math.floor(duration / 60 % 60),
        hours = Math.floor(duration / 60 / 60),
        seconds = Math.floor(duration % 60);

    return (
        <Pressable onPress={() => onPress()}>
            <View style={[styles.container]}>
                <View style={{display: 'flex', flexDirection: 'row',}}>
                    <View style={[styles.flowColumn, {width: '96%'}]}>
                        <Text bold style={styles.itemName}>{inv.market_name}</Text>
                        <Text style={styles.itemType}>{inv.type}</Text>
                    </View>
                </View>
                <View style={[styles.flowRow]}>
                    <Text style={styles.itemPriceTitle}>Owned</Text>
                    <Text style={styles.itemPriceTitle}>Price per item</Text>
                    <Text style={styles.itemPriceTitle}>Total Price</Text>
                </View>
                <View style={styles.flowRow}>
                    <Text bold style={styles.itemPrice}>{inv.amount}</Text>
                    <Text bold style={styles.itemPrice}>{props.curr} {Math.round(inv.Price * props.rate * 100) / 100}</Text>
                    <Text bold style={styles.itemPrice}>{props.curr} {(inv.Price === 'NaN' ? 'NaN' : Math.round(inv.Price * props.rate * 100) / 100 * inv.amount)}</Text>
                </View>
            </View>
            { open &&
                <View style={styles.containerCollapsable}>
                    <View style={styles.row}>
                        <Image style={{width: '22%', aspectRatio: 1.3, marginRight: 4}} source={open ? {uri: img} : {uri: not_found}} />
                        <View style={[styles.column, {width: '73%'}]}>
                            <Text style={styles.detail}>Item is <Text style={styles.detailBold}>{inv.marketable === 1 ? 'marketable' : 'non-marketable'}</Text> and <Text style={styles.detailBold}>{inv.tradable ? 'tradable' : 'non-tradable'}</Text></Text>
                            { (inv.Price === 'NaN' || (inv.Price === 0.03 && inv.Listed === 0)) ?
                                <View>
                                    <Text style={styles.detailBold}>Market details unavailable for this item</Text>
                                </View> :
                                <View>
                                    <Text style={styles.detail}>Price updated <Text bold style={styles.detailBold}>{hours}</Text>h <Text bold style={styles.detailBold}>{minutes}</Text>min <Text bold style={styles.detailBold}>{seconds}</Text>s ago</Text>
                                    <Text style={styles.detail}><Text bold style={styles.detailBold}>{inv.Listed}</Text> listings on Steam Market</Text>
                                </View>
                            }
                            {inv.hasOwnProperty('fraudwarnings') ? <Text style={styles.detail}>Name Tag: <Text bold>{inv.fraudwarnings[0].substring(12, inv.fraudwarnings[0].length - 2)}</Text></Text> : null}
                        </View>
                    </View>
                    {
                        inv.hasOwnProperty('stickers') ?
                            <View style={styles.column}>
                                <Text bold style={styles.stpaType}>Applied { (inv.stickers.type) ? (inv.stickers.sticker_count > 1) ? 'stickers' : 'sticker' : (inv.stickers.sticker_count > 1) ? 'patches' : 'patch' }</Text>
                                <View style={styles.stpaRow}>
                                    {
                                        inv.stickers.stickers.map(sticker => (
                                            <Image style={{ aspectRatio: 1.3, width: resize(getStickerWidth(inv.stickers.sticker_count)) }} source={open ? { uri: sticker.img } : {uri: not_found}} />
                                        ))
                                    }
                                </View>
                                <View style={styles.stpaRow}>
                                    {
                                        inv.stickers.stickers.map(sticker => (
                                            <Text bold style={{ width: resize(getStickerWidth(inv.stickers.sticker_count)), textAlign: 'center', color: '#555', fontSize: resize(14) }}>{Math.round(getAppliedPrice(sticker.long_name) * props.rate * 100) / 100}</Text>
                                        ))
                                    }
                                </View>
                                { getTotalAppliedValue(inv.stickers) }
                            </View> : null
                    }
                    {(inv.Price === 'NaN' || (inv.Price === 0.03 && inv.Listed === 0)) ?
                        null :
                        <View style={{alignSelf: 'center'}}>
                            <View style={styles.flowRow}>
                                <Text style={styles.avgTitle}>24 hour average</Text>
                                <Text style={styles.avgTitle}>7 day average</Text>
                                <Text style={styles.avgTitle}>30 day average</Text>
                            </View>
                            <View style={styles.flowRow}>
                                <Text bold style={styles.avgDetails}>{props.curr} {Math.round(inv.avg24 * props.rate * 1000) / 1000}</Text>
                                <Text bold style={styles.avgDetails}>{props.curr} {Math.round(inv.avg7 * props.rate * 1000) / 1000}</Text>
                                <Text bold style={styles.avgDetails}>{props.curr} {Math.round(inv.avg30 * props.rate * 1000) / 1000}</Text>
                            </View>
                        </View>
                    }
                </View>
            }
        </Pressable>
    )
}

function Summary(props) {
    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const sumRef = useRef();
    const snapPoints = useMemo(() => [resize(70), '60%', '100%'], []);
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
            ref={sumRef}
            overDragResistanceFactor={0}
            handleIndicatorStyle={{backgroundColor: '#333', height: resize(8), width: resize(40)}}
            handleStyle={{ alignSelf: 'center', width: resize(64), backgroundColor: '#bbb', borderTopLeftRadius: 16, borderTopRightRadius: 16}}
            backgroundStyle={{backgroundColor: '#ffffff00'}}>
            <View style={{flex: 1, alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 3, borderTopColor: '#bbb'}}>
                <View style={{marginBottom: resize(8), alignItems: 'center', width: '100%',}}>
                    <Text bold style={[styles.gameTitle, {fontSize: resize(24), color: '#555'}]}>Inventory Details</Text>
                    <Text style={{color: '#777'}}>SteamID: <Text bold style={{ color: '#444'}}>{props.steam}</Text></Text>
                    <Text style={{color: '#777'}}>Games loaded (appid): <Text bold style={{ color: '#444'}}>{JSON.stringify(props.games)}</Text></Text>
                </View>

                <BottomSheetScrollView>
                    <View style={{alignItems: 'center'}}>
                        <View style={[styles.column, {width: '95%'}]}>

                            <View style={styles.summarySection}>
                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>Total value</Text>
                                    <Text bold style={styles.statsDetails}>{curr} {Math.round(stats['price'] * rate * 100) / 100} ({stats['ownedTradeable']} items)</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>Average item price</Text>
                                    <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['price'] / stats['ownedTradeable'] * rate * 100) / 100)} / item</Text>
                                </View>
                            </View>

                            <Divider width={2} style={{width: '95%', alignSelf: 'center'}} />

                            <View style={styles.summarySection}>
                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>24 hour average value</Text>
                                    <Text bold style={styles.statsDetails}>{curr} {Math.round(stats['avg24'] * rate * 1000) / 1000}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>7 day average value</Text>
                                    <Text bold style={styles.statsDetails}>{curr} {Math.round(stats['avg7'] * rate * 1000) / 1000}</Text>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>30 day average value</Text>
                                    <Text bold style={styles.statsDetails}>{curr} {Math.round(stats['avg30'] * rate * 1000) / 1000}</Text>
                                </View>
                            </View>

                            <Divider width={2} style={{width: '95%', alignSelf: 'center'}} />

                            <View style={styles.summarySection}>
                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>Most expensive item</Text>
                                    <View style={[styles.column, {width: '55%'}]}>
                                        <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['expensive'].name}</Text>
                                        <Text bold style={[styles.statsDetails, {width: '100%'}]}>{curr} {Math.round(stats['expensive'].price * rate * 100) / 100}</Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <Text style={styles.statsTitle}>Cheapest item</Text>
                                    <View style={[styles.column, {width: '55%'}]}>
                                        <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['cheapest'].name}</Text>
                                        <Text bold style={[styles.statsDetails, {width: '100%'}]}>{curr} {Math.round(stats['cheapest'].price * rate * 100) / 100}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text bold style={[styles.gameName]}>Game stats</Text>

                            {
                                stats.games.map((data, index) => (
                                    <View style={styles.summarySection}>
                                        <Text bold style={styles.sumGame}>{ data.name }</Text>

                                        <View style={styles.row}>
                                            <Text style={styles.statsTitle}>Value</Text>
                                            <Text bold style={styles.statsDetails}>{curr} {Math.round(data.value * rate * 100) / 100}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.statsTitle}>Items owned</Text>
                                            <Text bold style={styles.statsDetails}>{data.items}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.statsTitle}>Average 24 hour</Text>
                                            <Text bold style={styles.statsDetails}>{curr} {Math.round(data.avg24 * rate * 1000) / 1000}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.statsTitle}>Average 7 day</Text>
                                            <Text bold style={styles.statsDetails}>{curr} {Math.round(data.avg7 * rate * 1000) / 1000}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <Text style={styles.statsTitle}>Average 30 day</Text>
                                            <Text bold style={styles.statsDetails}>{curr} {Math.round(data.avg30 * rate * 1000) / 1000}</Text>
                                        </View>

                                        {
                                            (data.name === 'Counter-Strike: Global Offensive') ?
                                                <View>
                                                    <View style={styles.row}>
                                                        <Text style={styles.statsTitle}>Applied stickers value</Text>
                                                        <Text bold style={styles.statsDetails}>{curr} {Math.round(data.stickerVal * rate * 100) / 100}</Text>
                                                    </View>

                                                    <View style={styles.row}>
                                                        <Text style={styles.statsTitle}>Applied patches value</Text>
                                                        <Text bold style={styles.statsDetails}>{curr} {Math.round(data.patchVal * rate * 100) / 100}</Text>
                                                    </View>
                                                </View> : null
                                        }

                                        {(stats.games.length - 1 !== index) ? <Divider width={2} style={{width: '95%', alignSelf: 'center'}}/> : null}
                                    </View>
                                ))
                            }

                        </View>
                    </View>
                </BottomSheetScrollView>
            </View>

        </BSheet>
    )
}

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423
    return Math.ceil(size * scale)
}

const styles = StyleSheet.create ({
    container: {
        marginTop: 6,
        marginBottom: 6,
        width: '95%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        alignSelf: 'center',
    },
    containerCollapsable: {
        width: '95%',
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 4,
        alignSelf: 'center',
        borderRadius: 8,
        padding: 4,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#00a',
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
    },
    appID: {
        color: '#222'
    },
    containerSelected: {
        borderWidth: 1.0,
        borderColor: '#0f0',
    },
    gameName: {
        fontSize: resize(24),
        marginVertical: 8,
        marginLeft: 8,
        color: '#333',
    },
    itemIcon: {
        width: resize(56),
        height: resize(56),
        alignSelf: 'center',
    },
    itemName: {
        fontSize: resize(16),
        width: '100%',
        color: '#555',
    },
    itemType: {
        fontSize: resize(13),
        color: '#777',
        fontStyle: 'italic',
    },
    itemPriceTitle: {
        width: '33%',
        textAlign: "center",
        color: '#777',
        fontSize: resize(14),
    },
    itemPrice: {
        width: '33%',
        textAlign: "center",
        color: '#333',
        fontSize: resize(16),
    },
    avgTitle: {
        color: '#777',
        width: '32%',
        textAlign: "center",
        fontSize: resize(14),
    },
    avgDetails: {
        fontSize: resize(14),
        color: '#333',
        width: '32%',
        textAlign: "center",
    },
    alert: {
        position: "absolute",
        top: resize(8),
        backgroundColor: '#229',
        width: '90%',
        overflow: "hidden",
        alignSelf: "center",
        borderRadius: 8,
    },
    msg: {
        margin: resize(8),
        color: '#fff',
    },
    detailsPress: {
        width: '67%',
        alignSelf: "center",
        backgroundColor: '#d3d5d8',
        marginVertical: resize(8),
        borderRadius: 8,
    },
    detailsText: {
        fontSize: resize(18),
        fontWeight: "bold",
        textAlign: "center",
        textAlignVertical: "center",
        marginVertical: 8,
        color: '#333',
    },
    statsTitle: {
        fontSize: resize(12),
        textAlignVertical: 'center',
        textAlign: 'left',
        width: '45%',
        color: '#555',
    },
    statsDetails: {
        fontSize: resize(14),
        textAlign: 'right',
        width: '55%',
        color: '#333',
    },
    statsDetailsS: {
        fontSize: resize(12),
        fontWeight: 'normal',
        textAlign: 'right',
        width: '55%',
        color: '#333',
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
        marginBottom: 82,
    },
    summarySection: {
        paddingVertical: resize(8),
        marginBottom: 8,
        alignSelf: 'center',
    },
    inputView: {
        width: '90%',
        backgroundColor: '#fff',
        paddingHorizontal: resize(8),
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
        borderWidth: 2.0,
        borderColor: '#229',
        borderRadius: 8,
        marginTop: resize(4),
    },
    searchInput: {
        fontSize: resize(14),
        width: '100%',
    },
    fsRow: {
        width: '90%',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    fsCell: {
        width: '48%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
    },
    dropdown: {
        backgroundColor: 'white',
        borderColor: '#229',
        borderWidth: 2,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 8,
        borderRadius: 8,
        height: resize(38.5),
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        borderRadius: 8,
    },
    item: {
        paddingVertical: resize(16),
        paddingHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: resize(16),
    },
    filterPressable: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderColor: '#229',
        borderWidth: 2,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        height: resize(38.5),
        justifyContent: 'center',
    },
    filterPressableText: {
        fontSize: resize(18),
        textAlignVertical: 'center',
        height: '100%',
    },
    stpaRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '96%',
        alignSelf: 'center',
    },
    stpaType: {
        fontSize: resize(16),
        width: '100%',
        textAlign: 'center',
    },
    sumGame: {
        fontSize: resize(16),
        textAlign: 'center',
        marginHorizontal: 4,
        color: '#666',
    },
    totalAppliedValueText: {
        fontSize: resize(16),
        marginTop: 4,
        marginBottom: resize(8),
        width: '100%',
        textAlign: 'center',
        color: '#777',
    },
    totalAppliedValue: {
        fontSize: resize(16),
        color: '#333',
    },
    snackbarText: {
        fontSize: resize(12),
        color: '#ddd'
    },
    containerStyle: {
        backgroundColor: 'white',
        padding: resize(20),
        width: '90%',
        alignSelf: 'center',
        borderRadius: 8,
    },
    fModalTitle: {
        textAlign: 'center',
        color: '#555',
        fontSize: resize(28),
    },
    fModalGameTitle: {
        color: '#777',
        fontSize: resize(20),
        marginVertical: resize(8),
    },
    detailBold: {
        fontSize: resize(14),
    },
    detail: {
        fontSize: resize(14),
    },
})