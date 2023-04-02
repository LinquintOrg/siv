import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React, {useState} from "react";
import { useMemo } from "react";
import { useRef } from "react";
import { useCallback } from "react";
import {View, StyleSheet, ScrollView, Dimensions, Pressable} from "react-native";
import {Dropdown} from 'react-native-element-dropdown';
import {Divider, Icon} from "react-native-elements";
import Text from '../text'

const Summary = React.forwardRef((props, ref) => {
    const resize = (size) => {
        return Math.ceil(size * props.scale)
    }

    // Bottom sheet configuration
    const handleSheetChanges = useCallback((index) => {
        console.log("HandleSheetChanges", index);
    })
    const handleSnapPress = useCallback((index) => {
        ref.current?.snapToIndex(index);
    }, []);
    const handleClosePress = useCallback(() => {
        ref.current?.close();
    }, []);
    const renderBackdrop = useCallback(
        props => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={1}
                appearsOnIndex={2}
            />
        ), []
    );

    // Variables
    let curr = props.curr
    let rate = props.rate
    let stats = props.stats

    return (
        <BottomSheet
            ref={ref}
            snapPoints={[resize(64), "50%", "90%"]}
            onChange={handleSheetChanges}
            handleStyle={{borderRadius: 28}}
            handleIndicatorStyle={{height: resize(8), backgroundColor: '#0A5270'}}
            backgroundStyle={{borderTopLeftRadius: 28, borderTopRightRadius: 28}}
        >
            <BottomSheetScrollView contentContainerStyle={styles.scrollStyle}>
                <Text bold style={styles.title}>Inventory summary</Text>

                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Total value</Text>
                    <Text bold style={styles.statsValue}>{curr} {(Math.round(stats['price'] * rate * 100) / 100).toFixed(2)}</Text>
                </View>

                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Items owned</Text>
                    <Text bold style={styles.statsValue}>{ stats['owned'] }</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Of which marketable</Text>
                    <Text bold style={styles.statsValue}>{ stats['ownedTradeable'] }</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Average item price</Text>
                    <Text bold style={styles.statsValue}>{curr} {(Math.round(stats['price'] / stats['ownedTradeable'] * rate * 100) / 100).toFixed(2)} / item</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Missing prices</Text>
                    <Text bold style={styles.statsValue}>{ stats.missingPrices }</Text>
                </View>

                <Divider width={resize(4)} color={'#0A5270'} style={styles.divider} />

                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>24 hour average value</Text>
                    <Text bold style={styles.statsValue}>{curr} {(Math.round(stats['avg24'] * rate * 1000) / 1000).toFixed(2)}</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>7 day average value</Text>
                    <Text bold style={styles.statsValue}>{curr} {(Math.round(stats['avg7'] * rate * 1000) / 1000).toFixed(2)}</Text>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>30 day average value</Text>
                    <Text bold style={styles.statsValue}>{curr} {(Math.round(stats['avg30'] * rate * 1000) / 1000).toFixed(2)}</Text>
                </View>

                <Divider width={resize(4)} color={'#0A5270'} style={styles.divider} />

                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Most expensive item</Text>
                    <View style={[styles.column, {width: '60%'}]}>
                        <Text style={[styles.statsValueSmall, {width: '100%'}]}>{stats['expensive'].name}</Text>
                        <Text bold style={[styles.statsValue, {width: '100%'}]}>{curr} {(Math.round(stats['expensive'].price * rate * 100) / 100).toFixed(2)}</Text>
                    </View>
                </View>
                <View style={styles.dataRow}>
                    <Text style={styles.statsTitle}>Cheapest item</Text>
                    <View style={[styles.column, {width: '60%'}]}>
                        <Text style={[styles.statsValueSmall, {width: '100%'}]}>{stats['cheapest'].name}</Text>
                        <Text bold style={[styles.statsValue, {width: '100%'}]}>{curr} {(Math.round(stats['cheapest'].price * rate * 100) / 100).toFixed(2)}</Text>
                    </View>
                </View>

                <Text bold style={styles.title}>Individual game stats</Text>

                {
                    stats.games.map((data, index) => (
                        <View>
                            <Text bold style={styles.game}>{ data.game }</Text>

                            <View style={styles.dataRow}>
                                <Text style={styles.statsTitle}>Value</Text>
                                <Text bold style={styles.statsValue}>{curr} {(Math.round(data.price * rate * 100) / 100).toFixed(2)}</Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.statsTitle}>Items owned</Text>
                                <Text bold style={styles.statsValue}>{data.owned}</Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.statsTitle}>Of which marketable</Text>
                                <Text bold style={styles.statsValue}>{data.ownedTradeable}</Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.statsTitle}>Average 24 hour</Text>
                                <Text bold style={styles.statsValue}>{curr} {(Math.round(data.avg24 * rate * 1000) / 1000).toFixed(2)}</Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.statsTitle}>Average 7 day</Text>
                                <Text bold style={styles.statsValue}>{curr} {(Math.round(data.avg7 * rate * 1000) / 1000).toFixed(2)}</Text>
                            </View>

                            <View style={styles.dataRow}>
                                <Text style={styles.statsTitle}>Average 30 day</Text>
                                <Text bold style={styles.statsValue}>{curr} {(Math.round(data.avg30 * rate * 1000) / 1000).toFixed(2)}</Text>
                            </View>

                            {
                                (data.appid === 730) ?
                                    <View>
                                        <View style={styles.dataRow}>
                                            <Text style={styles.statsTitle}>Applied stickers value</Text>
                                            <Text bold style={styles.statsValue}>{curr} {(Math.round(data.stickerVal * rate * 100) / 100).toFixed(2)}</Text>
                                        </View>

                                        <View style={styles.dataRow}>
                                            <Text style={styles.statsTitle}>Applied patches value</Text>
                                            <Text bold style={styles.statsValue}>{curr} {(Math.round(data.patchVal * rate * 100) / 100).toFixed(2)}</Text>
                                        </View>
                                    </View> : null
                            }

                            <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8, marginVertical: resize(16),}} />

                            {
                                (stats.games.length - 1 === index) ?
                                    <Text bold style={{textAlign: 'center', color: '#0A5270', fontSize: resize(16), paddingBottom: resize(96),}}>The end of summary</Text> : null
                            }
                        </View>
                    ))
                }
            </BottomSheetScrollView>
        </BottomSheet>
    )
});

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423;
    return Math.ceil(size * scale);
}

const styles = StyleSheet.create({
    title: {
        fontSize: resize(24),
        textAlign: 'center',
        marginBottom: resize(12),
        color: '#12428D',
    },
    scrollStyle: {
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: resize(16),
    },
    dataRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    statsTitle: {
        fontSize: resize(15),
        textAlignVertical: 'center',
    },
    statsValue: {
        fontSize: resize(16),
        color: '#333',
        textAlign: 'right',
    },
    statsValueSmall: {
        fontSize: resize(13),
        textAlign: 'right',
    },
    divider: {
        width: resize(64),
        alignSelf: 'center',
        borderRadius: 8,
        marginVertical: resize(12),
    },
    game: {
        fontSize: resize(20),
        color: '#12428D',
    }
});

export default Summary;

// function Summary(props) {
//     const [scale] = useState(Dimensions.get('window').width / 423);
//     const resize = (size) => {
//         return Math.ceil(size * scale)
//     }

//     const stats = props.stats
//     const curr = props.curr
//     const rate = props.rate

//     return (
//         <Sheet
//             show={props.showSheet}
//             onClose={() => props.setShowSheet(false)}
//             contentContainerStyle={{height: resize(540)}}
//         >
//             <View style={{flex: 1, alignItems: 'center', backgroundColor: '#fff', height: '100%'}}>
//                 <View style={{marginBottom: resize(8), alignItems: 'center', width: '100%',}}>
//                     <Text bold style={[styles.gameTitle, {fontSize: resize(24), color: '#555'}]}>Inventory Details</Text>
//                     <Text style={{color: '#777'}}>SteamID: <Text bold style={{ color: '#444'}}>{props.steam}</Text></Text>
//                     <Text style={{color: '#777'}}>Games loaded (appid): <Text bold style={{ color: '#444'}}>{JSON.stringify(props.games)}</Text></Text>
//                 </View>

//                 <ScrollView>
//                     <View style={{alignItems: 'center'}}>
//                         <View style={[styles.column, {width: '95%'}]}>

//                             <View style={[styles.summarySection]}>
//                                 <View style={styles.dataRow}>
//                                     <Text style={styles.statsTitle}>Total value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['price'] * rate * 100) / 100).toFixed(2)}</Text>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>Items owned</Text>
//                                     <Text bold style={styles.statsDetails}>{ stats['owned'] }</Text>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>Of which marketable</Text>
//                                     <Text bold style={styles.statsDetails}>{ stats['ownedTradeable'] }</Text>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>Average item price</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['price'] / stats['ownedTradeable'] * rate * 100) / 100).toFixed(2)} / item</Text>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>Missing prices</Text>
//                                     <Text bold style={styles.statsDetails}>{ stats.missingPrices }</Text>
//                                 </View>
//                             </View>

//                             <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8,}} />

//                             <View style={styles.summarySection}>
//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>24 hour average value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['avg24'] * rate * 1000) / 1000).toFixed(2)}</Text>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>7 day average value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['avg7'] * rate * 1000) / 1000).toFixed(2)}</Text>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>30 day average value</Text>
//                                     <Text bold style={styles.statsDetails}>{curr} {(Math.round(stats['avg30'] * rate * 1000) / 1000).toFixed(2)}</Text>
//                                 </View>
//                             </View>

//                             <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8,}} />

//                             <View style={styles.summarySection}>
//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>Most expensive item</Text>
//                                     <View style={[styles.column, {width: '55%'}]}>
//                                         <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['expensive'].name}</Text>
//                                         <Text bold style={[styles.statsDetails, {width: '100%'}]}>{curr} {(Math.round(stats['expensive'].price * rate * 100) / 100).toFixed(2)}</Text>
//                                     </View>
//                                 </View>

//                                 <View style={styles.row}>
//                                     <Text style={styles.statsTitle}>Cheapest item</Text>
//                                     <View style={[styles.column, {width: '55%'}]}>
//                                         <Text style={[styles.statsDetailsS, {width: '100%'}]}>{stats['cheapest'].name}</Text>
//                                         <Text bold style={[styles.statsDetails, {width: '100%'}]}>{curr} {(Math.round(stats['cheapest'].price * rate * 100) / 100).toFixed(2)}</Text>
//                                     </View>
//                                 </View>
//                             </View>

//                             <Text bold style={[styles.gameName]}>Game stats</Text>

//                             {
//                                 stats.games.map((data, index) => (
//                                     <View style={[styles.summarySection, {paddingVertical: 0}]}>
//                                         <Text bold style={styles.sumGame}>{ data.game }</Text>

//                                         <View style={styles.row}>
//                                             <Text style={styles.statsTitle}>Value</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.price * rate * 100) / 100).toFixed(2)}</Text>
//                                         </View>

//                                         <View style={styles.row}>
//                                             <Text style={styles.statsTitle}>Items owned</Text>
//                                             <Text bold style={styles.statsDetails}>{data.owned}</Text>
//                                         </View>

//                                         <View style={styles.row}>
//                                             <Text style={styles.statsTitle}>Of which marketable</Text>
//                                             <Text bold style={styles.statsDetails}>{data.ownedTradeable}</Text>
//                                         </View>

//                                         <View style={styles.row}>
//                                             <Text style={styles.statsTitle}>Average 24 hour</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.avg24 * rate * 1000) / 1000).toFixed(2)}</Text>
//                                         </View>

//                                         <View style={styles.row}>
//                                             <Text style={styles.statsTitle}>Average 7 day</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.avg7 * rate * 1000) / 1000).toFixed(2)}</Text>
//                                         </View>

//                                         <View style={styles.row}>
//                                             <Text style={styles.statsTitle}>Average 30 day</Text>
//                                             <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.avg30 * rate * 1000) / 1000).toFixed(2)}</Text>
//                                         </View>

//                                         {
//                                             (data.appid === 730) ?
//                                                 <View>
//                                                     <View style={styles.row}>
//                                                         <Text style={styles.statsTitle}>Applied stickers value</Text>
//                                                         <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.stickerVal * rate * 100) / 100).toFixed(2)}</Text>
//                                                     </View>

//                                                     <View style={styles.row}>
//                                                         <Text style={styles.statsTitle}>Applied patches value</Text>
//                                                         <Text bold style={styles.statsDetails}>{curr} {(Math.round(data.patchVal * rate * 100) / 100).toFixed(2)}</Text>
//                                                     </View>
//                                                 </View> : null
//                                         }

//                                         <Divider width={resize(4)} color={'#0A5270'} style={{width: resize(64), alignSelf: 'center', borderRadius: 8, marginVertical: resize(16),}} />

//                                         {
//                                             (stats.games.length - 1 === index) ?
//                                                 <Text bold style={{textAlign: 'center', color: '#0A5270', fontSize: resize(16), paddingBottom: resize(96),}}>The end of summary</Text> : null
//                                         }
//                                     </View>
//                                 ))
//                             }

//                         </View>
//                     </View>
//                 </ScrollView>
//             </View>

//         </Sheet>
//     )
// }