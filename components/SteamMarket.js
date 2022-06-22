import React, {useCallback, useMemo, useRef, useState} from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import BottomSheet from '@gorhom/bottom-sheet'
import {Divider, Icon} from "react-native-elements";
import {Dropdown} from "react-native-element-dropdown";
import Text from '../Elements/text'

export default function (props) {
    const [loading, setLoading] = useState(true)
    const [loadedGames, setLoadedGames] = useState(false)
    const [games] = useState([{ value: 0, label: 'All Games' }])
    const [searchResults, setSearchResults] = useState([])
    const [loadingResults, setLoadingResults] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(false)
    const sortByValues = [
        {label: 'Default - no specific order', value: 0},
        {label: 'Price', value: 1},
        {label: 'Name', value: 2}
    ]

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    if (!loadedGames) {
        fetch('https://domr.xyz/api/Steam/getGames.php')
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
            })
    }

    const filterSheetRef = useRef();

    const snapPoints = useMemo(() => [resize(70), '60%', '100%'], []);
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    // Filter states
    const [filterGame, setFilterGame] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState(0)
    const [sortAsc, setSortAsc] = useState(true)
    const [searchDesc, setSearchDesc] = useState(false)

    function getSortIcon() {
        if (sortBy === 1) {
            if (sortAsc) return ( <Icon name={'sort-amount-asc'} type={'font-awesome'} /> )
            else return ( <Icon name={'sort-amount-desc'} type={'font-awesome'} /> )
        }

        if (sortBy === 2) {
            if (sortAsc) return ( <Icon name={'sort-alpha-asc'} type={'font-awesome'} /> )
            else return ( <Icon name={'sort-alpha-desc'} type={'font-awesome'} /> )
        }

        return ( <Icon name={'align-justify'} type={'font-awesome'} /> )
    }

    async function searchMarket() {
        if (!searchTimeout) {
            setLoadingResults(true)

            const sd = (searchDesc) ? 1 : 0
            const column = (sortBy === 0) ? '' : (sortBy === 1) ? '&sort_column=price' : '&sort_column=name'
            const dir = (sortAsc) ? 'asc' : 'desc'
            const url = 'https://steamcommunity.com/market/search/render/?search_descriptions=' + sd + column + '&sort_dir=' + dir + '&appid=' + filterGame + '&norender=1&count=100&start=0&query=' + searchQuery

            fetch(url)
                .then(response => response.json())
                .then(json => {
                    setLoadingResults(false)
                    setSearchResults(json.results)
                })
        }
    }

    function sleep(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }

    const _renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    const scrollRef = useRef();

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
            <ScrollView ref={scrollRef}>
                {
                    searchResults.map((item, index) => (
                        <View>
                            <View style={styles.listingRow}>
                                <View style={[styles.column, {width: '80%'}]}>
                                    <Text style={styles.listingName}>{item.name}</Text>
                                    <Text bold style={styles.listingGame}>{item.app_name}</Text>
                                </View>
                                <View style={styles.column}>
                                    <Text bold style={styles.listingPrice}>{props.rate} {Math.round(item.sell_price * props.exchange) / 100}</Text>
                                    <Text style={styles.listingAmount}>{item.sell_listings} listed</Text>
                                </View>
                            </View>
                            {(searchResults.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center'}} /> : null}
                        </View>
                    ))
                }
                {
                    (searchResults.length > 4) ?
                        <TouchableOpacity style={styles.scrollProgress} onPress={() => scrollRef.current?.scrollTo({animated: true, y: 0})}>
                            <Icon name={'angle-double-up'} type={'font-awesome'} size={resize(48)} color={'#555'} />
                            <Text style={{fontSize: resize(14)}}>This is the end of the search results</Text>
                            <Text style={{fontSize: resize(14)}}>Tap to scroll back to top</Text>
                        </TouchableOpacity> : null
                }
            </ScrollView>

            <BottomSheet
                ref={filterSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                detached={false}
                handleIndicatorStyle={{backgroundColor: '#333', height: resize(8), width: resize(40)}}
                handleStyle={{ alignSelf: 'center', width: resize(64), backgroundColor: '#bbb', borderTopLeftRadius: 16, borderTopRightRadius: 16}}
                backgroundStyle={{backgroundColor: '#ffffff00'}}>
                <View style={styles.contentContainer}>
                    <Text bold style={styles.sheetTitle}>Search</Text>

                    <Text style={{fontSize: resize(14), textAlign: 'center'}}>Search timeout is <Text bold>{ (searchTimeout) ? 'active' : 'inactive' }</Text></Text>
                    <Text bold style={styles.sheetSubtitle}>Search Query</Text>
                    <View style={styles.inputView}>
                        <Icon name={'search'} type={'font-awesome'} size={resize(24)} />
                        <TextInput
                            style={{marginHorizontal: 4, borderWidth: 1.0, borderRadius: 8, flex: 1, paddingHorizontal: 8, fontSize: resize(14)}}
                            onChangeText={(text => setSearchQuery(text))}
                        />
                    </View>

                    <Text bold style={styles.sheetSubtitle}>Game</Text>
                    <View style={styles.inputView}>
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
                                <Icon name="gamepad" type={'font-awesome'} size={resize(20)} color="#000" style={{marginRight: resize(8)}} />
                            )}
                            inputSearchStyle={styles.dropdownInput}
                            style={styles.dropdown}
                            selectedTextStyle={styles.selectedTextStyle}
                        />
                    </View>

                    <Text bold style={styles.sheetSubtitle}>Sort by</Text>
                    <Text style={{textAlign: 'left', width: '90%', alignSelf: 'center', fontSize: 12}}>Tap on the right icon to change sort order</Text>
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
                                <Icon name="sort" type={'font-awesome'} size={resize(20)} color="#000" style={{marginRight: resize(8)}} />
                            )}
                            inputSearchStyle={styles.dropdownInput}
                            style={styles.dropdown}
                            selectedTextStyle={styles.selectedTextStyle}
                        />
                        <Pressable onPress={() => setSortAsc(!sortAsc)}>{ getSortIcon() }</Pressable>
                    </View>

                    <View style={styles.inputView}>
                        <Text bold style={styles.sheetSubtitle}>Search in description</Text>
                        <Pressable onPress={() => setSearchDesc(!searchDesc)}>
                            <Icon name={searchDesc ? 'check-square-o' : 'square-o' } type={'font-awesome'} />
                        </Pressable>
                    </View>

                    <View style={[styles.inputView, {width: '40%'}]}>
                        <Pressable style={{marginHorizontal: 4, borderWidth: 1.0, borderRadius: 8, flex: 1, padding: 4}} onPress={() => {
                            searchMarket().then(async () => {
                                setSearchTimeout(true)
                                await sleep(15000)
                                setSearchTimeout(false)
                            })
                        }}>
                            <Text bold style={{textAlign: 'center', fontSize: resize(20)}}>SEARCH</Text>
                        </Pressable>
                    </View>
                </View>
            </BottomSheet>
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
        fontSize: resize(24),
        marginVertical: resize(8),
    },
    sheetSubtitle: {
        fontSize: resize(16),
        color: '#555',
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
});