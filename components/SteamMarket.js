import React, {useCallback, useMemo, useRef, useState} from "react";
import {Pressable, Text, View, StyleSheet, TextInput, Dimensions, ScrollView, ActivityIndicator} from "react-native";
import BottomSheet from '@gorhom/bottom-sheet'
import {Icon} from "react-native-elements";
import FilterSheet from 'react-native-raw-bottom-sheet'

export default function (props) {
    const [loading, setLoading] = useState(true)
    const [loadedGames, setLoadedGames] = useState(false)
    const [games, setGames] = useState([{ appid: 0, name: 'All Games' }])
    const [searchResults, setSearchResults] = useState([])
    const [loadingResults, setLoadingResults] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState(false)
    const sortByValues = ['Default - no specific order', 'Price', 'Name']

    if (!loadedGames) {
        fetch('https://domr.xyz/api/Steam/getGames.php')
            .then((response) => response.json())
            .then((json) => {
                setLoadedGames(true)
                setLoading(false)
                setGames(games.concat(json))
            })
    }

    const filterSheetRef = useRef();
    const fSelectRef = useRef();
    const sortSelectRef = useRef();

    const snapPoints = useMemo(() => [70, 420], []);
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
            const appid = games[filterGame].appid
            const url = 'https://steamcommunity.com/market/search/render/?search_descriptions=' + sd + column + '&sort_dir=' + dir + '&appid=' + appid + '&norender=1&count=100&start=0&query=' + searchQuery

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

    return (
        (loading) ?
        <View style={[styles.containerCol, {alignSelf: 'center'}]}>
            <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
            <Text style={{textAlign: 'center'}}>Downloading games list</Text>
        </View> :
        (loadingResults) ?
        <View style={[styles.containerCol, {alignSelf: 'center'}]}>
            <ActivityIndicator style={{marginTop: Dimensions.get('window').height / 2 - 36}} size="large" color='#000' />
            <Text style={{textAlign: 'center'}}>Loading market search results</Text>
        </View> :
        <View style={styles.container}>
            <ScrollView style={{marginBottom: 46}}>
                {
                    searchResults.map(item => (
                        <View style={styles.listingRow}>
                            <View style={[styles.column, {width: '80%'}]}>
                                <Text style={styles.listingName}>{item.name}</Text>
                                <Text style={styles.listingGame}>{item.app_name}</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.listingPrice}>{props.rate} {Math.round(item.sell_price * props.exchange) / 100}</Text>
                                <Text style={styles.listingAmount}>{item.sell_listings} listed</Text>
                            </View>
                        </View>
                    ))
                }
            </ScrollView>

            <FilterSheet ref={fSelectRef} closeOnDragDown={false} height={Dimensions.get('window').height / 1.667} customStyles={{
                wrapper: {backgroundColor: '#00000089'},
                container: {borderRadius: 4, width: '90%', marginBottom: 24, alignSelf: 'center'},
                draggableIcon: {borderRadius: 24}}}
            >
                <ScrollView>
                    {
                        games.map((game, index) => (
                            <Pressable onPress={() => setFilterGame(index) & fSelectRef.current?.close() }>
                                <Text style={styles.optionSelect}>{ game.name }</Text>
                            </Pressable>
                        ))
                    }
                </ScrollView>
            </FilterSheet>

            <FilterSheet ref={sortSelectRef} closeOnDragDown={false} height={Dimensions.get('window').height / 1.667} customStyles={{
                wrapper: {backgroundColor: '#00000089'},
                container: {borderRadius: 8, width: '90%', marginBottom: 24, alignSelf: 'center'},
                draggableIcon: {borderRadius: 24}}}
            >
                <ScrollView>
                    {
                        sortByValues.map((sort, index) => (
                            <Pressable onPress={() => setSortBy(index) & sortSelectRef.current?.close() }>
                                <Text style={styles.optionSelect}>{ sort }</Text>
                            </Pressable>
                        ))
                    }
                </ScrollView>
            </FilterSheet>

            <BottomSheet
                ref={filterSheetRef}
                index={0}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                detached={false}
                handleIndicatorStyle={{backgroundColor: '#555', elevation: 8, height: 10, width: 48}}>
                <View style={styles.contentContainer}>
                    <Text style={styles.sheetTitle}>Search</Text>

                    <Text style={{fontSize: 14, textAlign: 'center'}}>Search timeout is <Text style={{fontWeight: 'bold'}}>{ (searchTimeout) ? 'active' : 'inactive' }</Text></Text>
                    <Text style={styles.sheetSubtitle}>Search Query</Text>
                    <View style={styles.inputView}>
                        <Icon name={'search'} type={'font-awesome'} />
                        <TextInput
                            style={{marginHorizontal: 4, borderWidth: 1.0, borderRadius: 8, flex: 1, padding: 4}}
                            onChangeText={(text => setSearchQuery(text))}
                        />
                    </View>

                    <Text style={styles.sheetSubtitle}>Game</Text>
                    <View style={styles.inputView}>
                        <Icon name={'gamepad'} type={'font-awesome'} />
                        <Pressable onPress={() => fSelectRef.current?.open()} style={{marginHorizontal: 4, borderWidth: 1.0, borderRadius: 8, flex: 1, padding: 4}}>
                            <Text>{ games[filterGame].name }</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.sheetSubtitle}>Sort by</Text>
                    <Text style={{textAlign: 'left', width: '90%', alignSelf: 'center', fontSize: 12}}>Tap on the right icon to change sort order</Text>
                    <View style={styles.inputView}>
                        <Icon name={'navicon'} type={'font-awesome'} />
                        <Pressable onPress={() => sortSelectRef.current?.open()} style={{marginHorizontal: 4, borderWidth: 1.0, borderRadius: 8, flex: 1, padding: 4}}>
                            <Text>{ sortByValues[sortBy] }</Text>
                        </Pressable>
                        <Pressable onPress={() => setSortAsc(!sortAsc)}>{ getSortIcon() }</Pressable>
                    </View>

                    <View style={styles.inputView}>
                        <Text style={styles.sheetSubtitle}>Search in description</Text>
                        <Pressable onPress={() => setSearchDesc(!searchDesc)}>
                            <Icon name={searchDesc ? 'check-square-o' : 'square-o' } type={'font-awesome'} />
                        </Pressable>
                    </View>

                    <View style={[styles.inputView, {width: '40%'}]}>
                        <Pressable style={{marginHorizontal: 4, borderWidth: 1.0, borderRadius: 8, flex: 1, padding: 4}} onPress={() => {
                            searchMarket().then(async () => {
                                setSearchTimeout(true)
                                await sleep(12000)
                                setSearchTimeout(false)
                            })
                        }}>
                            <Text style={{textAlign: 'center', fontSize: 20, fontWeight: 'bold'}}>SEARCH</Text>
                        </Pressable>
                    </View>
                </View>
            </BottomSheet>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 24,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        elevation: 5,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    sheetSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'left',
        width: '90%',
        alignSelf: 'center',
        marginVertical: 4,
    },
    inputView: {
        width: '90%',
        height: 44,
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
        fontSize: 18,
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
        padding: 8,
        backgroundColor: '#ddd',
        borderRadius: 8,
        margin: 8,
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
    },
    listingName: {
        fontSize: 14,
        color: '#333',
    },
    listingGame: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#777',
    },
    listingPrice: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
    },
    listingAmount: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});