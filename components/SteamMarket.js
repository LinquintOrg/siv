import React, {useCallback, useRef, useState} from "react";
import {
    ActivityIndicator,
    Dimensions, FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import {Divider, Icon} from "react-native-elements";
import {Dropdown} from "react-native-element-dropdown";
import Text from '../Elements/text'
import {AnimatedFAB, Snackbar, TextInput} from "react-native-paper";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import NetInfo from '@react-native-community/netinfo';
import Modal from "react-native-modal";

export default function (props) {
    const [loading, setLoading] = useState(true)
    const [loadedGames, setLoadedGames] = useState(false)
    const [games] = useState([{ value: 0, label: 'All Games' }])
    const [searchResults, setSearchResults] = useState([])
    const [loadingResults, setLoadingResults] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(false)
    const [snackError, setSnackError] = useState(false)
    const [snackbarText, setSnackbarText] = useState('')
    const sortByValues = [
        {label: 'Default - no specific order', value: 0},
        {label: 'Price', value: 1},
        {label: 'Name', value: 2}
    ]

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const loadSteamGames = useCallback(async () => {
        let internetConnection = await NetInfo.fetch();
        if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
            setSnackError(true)
            setSnackbarText("No internet connection")
            await sleep(3000).then(() => setSnackError(false))
            return
        }

        let didLoadGames = false
        await fetch('https://inventory.linquint.dev/api/Steam/getGames.php')
            .then((response) => response.json())
            .then((json) => {
                setLoadedGames(true)
                setLoading(false)
                for (const game of json) {
                    games.push({
                        value: game.appid,
                        label: game.name
                    })
                }
                didLoadGames = true
            })
        return didLoadGames
    }, [])

    if (!loadedGames) {
        loadSteamGames().then(r => {
            if (!r) {
                setSnackError(true)
                setSnackbarText('Couldn\'t download the list of games')
            }
        })
    }

    // Filter states
    const [filterGame, setFilterGame] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState(0)
    const [sortAsc, setSortAsc] = useState(true)
    const [searchDesc, setSearchDesc] = useState(false)

    function getSortIcon() {
        if (sortBy === 1) {
            if (sortAsc) return ( <Icon name={'sort-amount-asc'} type={'font-awesome'} color='#1f4690' /> )
            else return ( <Icon name={'sort-amount-desc'} type={'font-awesome'} color='#1f4690' /> )
        }

        if (sortBy === 2) {
            if (sortAsc) return ( <Icon name={'sort-alpha-asc'} type={'font-awesome'} color='#1f4690' /> )
            else return ( <Icon name={'sort-alpha-desc'} type={'font-awesome'} color='#1f4690' /> )
        }

        return ( <Icon name={'align-justify'} type={'font-awesome'} color='#1f4690' /> )
    }

    const search = async (url) => {
        let internetConnection = await NetInfo.fetch();
        if (!(internetConnection.isInternetReachable && internetConnection.isConnected)) {
            setSnackError(true)
            setSnackbarText("No internet connection")
            await sleep(3000).then(() => setSnackError(false))
            return null
        }
        
        let tempResults = []
        await fetch(url)
            .then(response => {
                if (response.ok) return response.json()
                else {
                    setSnackError(true)
                    setSnackbarText("Couldn't initiate the search...")
                    return null
                }
            })
            .then(json => {
                if (json != null) tempResults = json.results
                else {

                }
            })
        return tempResults
    }

    async function searchMarket() {
        if (!searchTimeout) {
            setLoadingResults(true)
            setShowSheet(false)

            const sd = (searchDesc) ? 1 : 0
            const column = (sortBy === 0) ? '' : (sortBy === 1) ? '&sort_column=price' : '&sort_column=name'
            const dir = (sortAsc) ? 'asc' : 'desc'
            const url = 'https://steamcommunity.com/market/search/render/?search_descriptions=' + sd + column + '&sort_dir=' + dir + '&appid=' + filterGame + '&norender=1&count=100&start=0&query=' + searchQuery
            setSearchResults(await search(url).then((r) => {
                setLoadingResults(false)
                return r
            }))
        }
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    const [timeoutLen, setTimeoutLen] = useState(0)
    const timeoutCountdown = async (tLen) => {
        if (tLen > 0) {
            setTimeoutLen(Math.round(tLen / 1000))
            await sleep(1000)
            timeoutCountdown(tLen - 1000)
        } else {
            setTimeoutLen(0)
            setSearchTimeout(false)
        }
    }

    const _renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    const [showSheet, setShowSheet] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const onScroll = ({ nativeEvent }) => {
        const currentScrollPosition =
            Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

        setIsExpanded(currentScrollPosition <= 0);
    };

    const scrollRef = useRef();

    const _renderSteamItem = ({item}) => (
        <View style={styles.listingRow}>
            <View style={[styles.column, {width: '80%'}]}>
                <Text style={styles.listingName}>{item.name}</Text>
                <Text bold style={styles.listingGame}>{item.app_name}</Text>
            </View>
            <View style={styles.column}>
                <Text bold style={styles.listingPrice}>{props.rate} {(Math.round(item.sell_price * props.exchange) / 100).toFixed(2)}</Text>
                <Text style={styles.listingAmount}>{item.sell_listings} listed</Text>
            </View>
        </View>
    )

    return (
        (loading) ?
        <View style={[styles.containerCol, {alignSelf: 'center'}]}>
            <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
            <Text style={{textAlign: 'center', fontSize: resize(14)}}>Downloading games list</Text>
        </View> :
        (loadingResults) ?
        <View style={[styles.containerCol, {alignSelf: 'center'}]}>
            <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
            <Text style={{textAlign: 'center', fontSize: resize(14)}}>Loading market search results</Text>
        </View> :
        <View style={styles.container}>
            <FlatList
                ref={scrollRef}
                renderItem={_renderSteamItem}
                data={searchResults}
                ListFooterComponent={() => (
                    (searchResults.length > 4) ?
                    <TouchableOpacity style={styles.scrollProgress} onPress={() => {
                        scrollRef.current?.scrollToIndex({animated: true, index: 0})
                        console.log(scrollRef.current)
                    }}>
                        <Icon name={'angle-double-up'} type={'font-awesome'} size={resize(48)} color={'#555'} />
                        <Text style={{fontSize: resize(14)}}>This is the end of the search results</Text>
                        <Text style={{fontSize: resize(14)}}>Tap to scroll back to top</Text>
                    </TouchableOpacity> : null
                )}
                ItemSeparatorComponent={() => (
                    <Divider width={1} style={{width: '95%', alignSelf: 'center'}} />
                )}
                onScroll={onScroll}
            />

            <Modal
                isVisible={showSheet}
                onBackdropPress={() => setShowSheet(false)}
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
                animationInTiming={250}
                style={{width: '100%', height: '100%', padding: 0, margin: 0}}
            >
                <View style={styles.searchModal}>
                    <View style={styles.searchTopBar}>
                        <TouchableOpacity onPress={() => setShowSheet(false)}>
                            <Icon name={'cross'} type={'entypo'} size={resize(40)} style={{marginRight: resize(16)}} />
                        </TouchableOpacity>
                        <Text bold style={styles.searchBarTitle}>Search community market</Text>
                    </View>

                    <TextInput
                        style={{fontSize: resize(16), padding: 0, marginHorizontal: resize(16), height: resize(40), backgroundColor: '#fff'}}
                        placeholder='Search query'
                        mode={'outlined'}
                        onChangeText={text => setSearchQuery(text)}
                        label={'Search query'}
                        activeOutlineColor={'#1f4690'}
                        left={
                            <TextInput.Icon
                                icon={() => (<Icon name={'search'} type={'ionicons'} color={'#1f4690'} />)}
                                size={resize(24)}
                                style={{margin: 0, marginTop: resize(8),}}
                                name={'at'}
                                forceTextInputFocus={false}
                            />
                        }
                    />

                    <Text bold style={[styles.sheetSubtitle, {marginTop: resize(12),}]}>Game</Text>
                    <Dropdown
                        data={games}
                        search
                        label={"Game"}
                        searchPlaceholder={"Search for game..."}
                        labelField={'label'}
                        valueField={'value'}
                        placeholder={"Select a game..."}
                        maxHeight={resize(320)}
                        onChange={item => setFilterGame(item.value)}
                        value={filterGame}
                        renderItem={item => _renderItem(item)}
                        renderLeftIcon={() => (
                            <Icon name="gamepad" type={'font-awesome'} size={resize(20)} color="#1f4690" style={{marginRight: resize(8)}} />
                        )}
                        inputSearchStyle={styles.dropdownInput}
                        style={styles.dropdown}
                        selectedTextStyle={styles.selectedTextStyle}
                    />

                    <Text bold style={[styles.sheetSubtitle, {marginTop: resize(12)}]}>Sort by</Text>
                    <Text style={{textAlign: 'left', width: '90%', alignSelf: 'center', fontSize: resize(14), marginTop: 0}}>Tap on the right icon to change sort order</Text>
                    <View style={styles.inputView}>
                        <Dropdown
                            data={sortByValues}
                            label={"Sort by"}
                            labelField={'label'}
                            valueField={'value'}
                            placeholder={"Select a sort option..."}
                            maxHeight={resize(170)}
                            onChange={item => setSortBy(item.value)}
                            value={sortBy}
                            renderItem={item => _renderItem(item)}
                            renderLeftIcon={() => (
                                <Icon name="sort" type={'font-awesome'} size={resize(20)} color="#1f4690" style={{marginRight: resize(8)}} />
                            )}
                            inputSearchStyle={styles.dropdownInput}
                            style={styles.dropdown}
                            selectedTextStyle={styles.selectedTextStyle}
                        />
                        <Pressable onPress={() => setSortAsc(!sortAsc)}>{ getSortIcon() }</Pressable>
                    </View>

                    <BouncyCheckbox
                        isChecked={searchDesc}
                        onPress={(isChecked) => setSearchDesc(isChecked)}
                        text={<Text style={{fontSize:resize(16), color: '#1f4690'}}>Search in <Text bold>item description</Text></Text>}
                        textStyle={{textDecorationLine: "none"}}
                        fillColor={'#1f4690'}
                        iconStyle={{borderWidth:resize(3), borderColor: '#1f4690'}}
                        style={{marginVertical: resize(16), alignSelf: 'center',}}
                        size={resize(26)}
                    />

                    <View style={[styles.inputView, {width: '40%'}]}>
                        <Pressable style={{marginHorizontal: 4, borderWidth: 2.0, borderRadius: resize(32), flex: 1, paddingVertical: resize(8), borderColor: '#1f4690',}}
                            onPress={() => {
                                searchMarket().then(async () => {
                                    setSearchTimeout(true)
                                    timeoutCountdown(15000)
                                })
                            }} disabled={searchTimeout}>
                            <Text bold style={{textAlign: 'center', fontSize: resize(20), color: '#1f4690'}}>SEARCH{(timeoutLen > 0) ? ' (' + timeoutLen + ')' : ''}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* <Sheet
                show={showSheet}
                onClose={() => setShowSheet(false)}
                contentContainerStyle={{height: resize(540)}}
            >
                <Text bold style={styles.sheetTitle}>Search</Text>

                <TextInput
                    style={{fontSize: resize(16), padding: 0, marginHorizontal: resize(16), height: resize(40), backgroundColor: '#fff'}}
                    placeholder='Search query'
                    mode={'outlined'}
                    onChangeText={text => setSearchQuery(text)}
                    label={'Search query'}
                    activeOutlineColor={'#1f4690'}
                    left={
                        <TextInput.Icon
                            icon={() => (<Icon name={'search'} type={'ionicons'} color={'#1f4690'} />)}
                            size={resize(24)}
                            style={{margin: 0, marginTop: resize(8),}}
                            name={'at'}
                            forceTextInputFocus={false}
                        />
                    }
                />

                <Text bold style={[styles.sheetSubtitle, {marginTop: resize(12),}]}>Game</Text>
                <Dropdown
                    data={games}
                    search
                    label={"Game"}
                    searchPlaceholder={"Search for game..."}
                    labelField={'label'}
                    valueField={'value'}
                    placeholder={"Select a game..."}
                    maxHeight={resize(320)}
                    onChange={item => setFilterGame(item.value)}
                    value={filterGame}
                    renderItem={item => _renderItem(item)}
                    renderLeftIcon={() => (
                        <Icon name="gamepad" type={'font-awesome'} size={resize(20)} color="#1f4690" style={{marginRight: resize(8)}} />
                    )}
                    inputSearchStyle={styles.dropdownInput}
                    style={styles.dropdown}
                    selectedTextStyle={styles.selectedTextStyle}
                />

                <Text bold style={[styles.sheetSubtitle, {marginTop: resize(12)}]}>Sort by</Text>
                <Text style={{textAlign: 'left', width: '90%', alignSelf: 'center', fontSize: resize(14), marginTop: 0}}>Tap on the right icon to change sort order</Text>
                <View style={styles.inputView}>
                    <Dropdown
                        data={sortByValues}
                        label={"Sort by"}
                        labelField={'label'}
                        valueField={'value'}
                        placeholder={"Select a sort option..."}
                        maxHeight={resize(170)}
                        onChange={item => setSortBy(item.value)}
                        value={sortBy}
                        renderItem={item => _renderItem(item)}
                        renderLeftIcon={() => (
                            <Icon name="sort" type={'font-awesome'} size={resize(20)} color="#1f4690" style={{marginRight: resize(8)}} />
                        )}
                        inputSearchStyle={styles.dropdownInput}
                        style={styles.dropdown}
                        selectedTextStyle={styles.selectedTextStyle}
                    />
                    <Pressable onPress={() => setSortAsc(!sortAsc)}>{ getSortIcon() }</Pressable>
                </View>

                <BouncyCheckbox
                    isChecked={searchDesc}
                    onPress={(isChecked) => setSearchDesc(isChecked)}
                    text={<Text style={{fontSize:resize(16), color: '#1f4690'}}>Search in <Text bold>item description</Text></Text>}
                    textStyle={{textDecorationLine: "none"}}
                    fillColor={'#1f4690'}
                    iconStyle={{borderWidth:resize(3), borderColor: '#1f4690'}}
                    style={{marginVertical: resize(16), alignSelf: 'center',}}
                    size={resize(26)}
                />

                <View style={[styles.inputView, {width: '40%'}]}>
                    <Pressable style={{marginHorizontal: 4, borderWidth: 2.0, borderRadius: 8, flex: 1, paddingVertical: resize(8), borderColor: '#1f4690',}}
                        onPress={() => {
                            searchMarket().then(async () => {
                                setSearchTimeout(true)
                                timeoutCountdown(15000)
                            })
                        }} disabled={searchTimeout}>
                        <Text bold style={{textAlign: 'center', fontSize: resize(20), color: '#1f4690'}}>SEARCH{(timeoutLen > 0) ? ' (' + timeoutLen + ')' : ''}</Text>
                    </Pressable>
                </View>
            </Sheet> */}

            <AnimatedFAB
                icon={() => (<Icon name={'search'} type={'feather'} size={resize(24)} color={'#12428D'} />)}
                label={'Search'}
                extended={isExpanded}
                onPress={() => {
                    if (loadedGames) setShowSheet(true)
                    else {
                        setSnackError(true)
                        setSnackbarText("Steam market games list couldn't be loaded")
                    }
                }}
                uppercase={false}
                visible={true}
                animateFrom={'right'}
                iconMode={'dynamic'}
                style={[styles.fabStyle]}
                loading={true}
                size={'medium'}
                color={'#12428D'}
            />

            <Snackbar
                visible={snackError}
                onDismiss={() => setSnackError(false)}
                style={{backgroundColor: "#FF3732"}}>
                <View><Text style={[styles.snackbarText, {color: '#F4EDEC'}]}>{ snackbarText }</Text></View>
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
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 3,
        borderTopColor: '#bbb',
    },
    sheetTitle: {
        fontSize: resize(28),
        marginBottom: resize(12),
        textAlign: 'center',
        color: '#1f4690',
    },
    sheetSubtitle: {
        fontSize: resize(20),
        color: '#248',
        textAlign: 'left',
        width: '90%',
        alignSelf: 'center',
        marginVertical: 4,
    },
    inputView: {
        width: '90%',
        height: resize(44),
        borderRadius: 8,
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: "center",
    },
    containerCol: {
        display: 'flex',
        flexDirection: 'column',
        width: '63%',
    },
    optionSelect: {
        fontSize: resize(18),
        color: '#333',
        marginVertical: 8,
        width: '90%',
        borderWidth: 1.0,
        borderRadius: 8,
        alignSelf: 'center',
        padding: 8,
    },
    listingRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '94%',
        alignSelf: 'center',
        padding: resize(8),
        margin: 8,
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
    },
    listingName: {
        fontSize: resize(16),
        color: '#333',
    },
    listingGame: {
        fontSize: resize(14),
        color: '#777',
    },
    listingPrice: {
        fontSize: resize(16),
        color: '#444',
        textAlign: 'center',
    },
    listingAmount: {
        fontSize: resize(12),
        color: '#888',
        textAlign: 'center',
    },
    dropdownInput: {
        fontSize: resize(14),
        color: '#333',
        borderRadius: 8,
    },
    selectedTextStyle: {
        fontSize: resize(16),
    },
    dropdown: {
        backgroundColor: 'white',
        borderColor: '#000',
        borderWidth: 1,
        width: '85%',
        alignSelf: 'center',
        paddingHorizontal: 4,
        borderRadius: 8,
        marginHorizontal: 8,
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
    },
    textItem: {
        flex: 1,
        fontSize: resize(14),
    },
    item: {
        paddingVertical: resize(16),
        paddingHorizontal: 4,
        marginHorizontal: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#777',
    },
    singleSelect: {
        textAlign: 'center',
        fontSize: resize(14),
        fontWeight: 'bold',
        width: '100%',
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
    fabStyle: {
        bottom: 16,
        right: 16,
        position: 'absolute',
        backgroundColor: '#91BCEC',
        borderRadius: 16,
        height: resize(56),
    },
    searchModal: {
        backgroundColor: '#fff',
        padding: resize(12),
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    searchTopBar: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: resize(12),
    },
    searchBarTitle: {
        fontSize: resize(24),
        textAlignVertical: 'center',
    },
});