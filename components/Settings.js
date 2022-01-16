import React, {useRef} from "react";
import {Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View, StyleSheet, Image} from "react-native";
import BottomSheet from 'react-native-raw-bottom-sheet'

export default function (props) {
    const rates = props.rates
    let rate = props.rate
    const ratesSheetRef = useRef()
    const defNonMarketable = useRef()

    return (
        <View>
            <BottomSheet ref={ratesSheetRef} closeOnDragDown={false} height={Dimensions.get('window').height / 1.667} customStyles={{
                wrapper: {backgroundColor: '#00000089'},
                container: {borderRadius: 8, width: '90%', marginBottom: 24, alignSelf: 'center'},
                draggableIcon: {borderRadius: 24}}}
            >
                <ScrollView>
                    {rates.map((item, index) => (
                        <Pressable style={styles.currencySheetRow} onPress={() => {
                            props.saveSetting('currency', index)
                            props.setRate(index)
                        }}>
                            <Text style={styles.currencyShort}>{item.abb}</Text>
                            <Text style={styles.currencyLong}>{item.full}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </BottomSheet>

            <BottomSheet ref={defNonMarketable} closeOnDragDown={false} height={Dimensions.get('window').height / 4.20} customStyles={{
                wrapper: {backgroundColor: '#00000089'},
                container: {borderRadius: 8, width: '90%', marginBottom: 24, alignSelf: 'center'},
                draggableIcon: {borderRadius: 24}}}>

                <View>
                    <Pressable style={styles.currencySheetRow}>
                        <Text style={styles.singleSelect}>Enabled</Text>
                    </Pressable>
                    <Pressable style={styles.currencySheetRow}>
                        <Text style={styles.singleSelect}>Disabled</Text>
                    </Pressable>
                </View>
            </BottomSheet>

            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity style={styles.optionRow} onPress={() => ratesSheetRef.current.open()}>
                <View style={styles.optionColumn}>
                    <Text style={styles.optionName}>Currency</Text>
                    <Text style={styles.optionDescription}>Choose your preferred currency.</Text>
                </View>
                <Text style={styles.optionChoice}>{ rates[rate].abb }</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => defNonMarketable.current.open()}>
                <View style={styles.optionColumn}>
                    <Text style={styles.optionName}>Display non-tradable items</Text>
                    <Text style={styles.optionDescription}>Display non-tradable items by default.</Text>
                </View>
                <Text style={styles.optionChoice}>Disabled</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Credits</Text>
            <View>
                {/*<div>Icons made by <a href="https://www.flaticon.com/authors/apien" title="apien">apien</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>*/}
                <View style={styles.iconCreditRow}>
                    <Image style={styles.iconCreditSize} source={{uri: 'https://domr.xyz/api/Files/img/no-photo.png'}} />
                    <Text style={styles.iconCreditTitle}>Icon made by <Text style={styles.iconCreditAuthorURL}>apien</Text><Text style={styles.iconCreditSubtitle}> | source <Text style={styles.iconCreditAuthorURL}>www.flaticon.com</Text></Text></Text>
                </View>

                {/*<div>Icons made by <a href="https://www.flaticon.com/authors/pixelmeetup" title="Pixelmeetup">Pixelmeetup</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>*/}
                <View style={styles.iconCreditRow}>
                    <Image style={styles.iconCreditSize} source={{uri: 'https://domr.xyz/api/Files/img/profile.png'}} />
                    <Text style={styles.iconCreditTitle}>Icon made by <Text style={styles.iconCreditAuthorURL}>Pixelmeetup</Text><Text style={styles.iconCreditSubtitle}> | source <Text style={styles.iconCreditAuthorURL}>www.flaticon.com</Text></Text></Text>
                </View>
            </View>
            <Text style={styles.title}>About</Text>
            <Text style={styles.title}>Disclaimers</Text>
            <View style={styles.textColumn}>
                <Text>Steam Inventory Value is not affiliated with Steam or Valve Corp.</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 8,
        marginLeft: 8,
    },
    optionColumn: {
        display: 'flex',
        flexDirection: 'column',
        width: '70%',
        padding: 8,
    },
    optionRow: {
        width: '95%',
        alignSelf: 'center',
        marginVertical: 16,
        backgroundColor: '#0C2925',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 8,
    },
    optionName: {
        color: '#ccc',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionDescription: {
        color: '#999',
        fontSize: 12,
    },
    optionChoice: {
        width: '30%',
        borderRadius: 8,
        backgroundColor: '#00FCA3',
        color: '#222',
        fontSize: 16,
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
    },
    currencySheetRow: {
        display: 'flex',
        flexDirection: 'row',
        padding: 8,
        width: '95%',
        backgroundColor: '#eee',
        borderRadius: 8,
        alignSelf: 'center',
        margin: 8,
    },
    currencyShort: {
        fontSize: 16,
        fontWeight: 'bold',
        width: '20%',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    currencyLong: {
        fontSize: 13,
        width: '80%',
        textAlign: 'right',
        textAlignVertical: 'center',
    },
    textColumn: {
        width: '90%',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    iconCreditRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '90%',
        alignSelf: 'center',
        borderRadius: 8,
        marginVertical: 4,
    },
    iconCreditTitle: {
        fontSize: 17,
        color: '#222',
        width: '80%',
        textAlignVertical: 'center',
    },
    iconCreditAuthorURL: {
        fontWeight: 'bold',
    },
    iconCreditSubtitle: {
        fontSize: 13,
        color: '#777',
    },
    iconCreditSize: {
        width: '15%',
        aspectRatio: 1,
        marginHorizontal: 8,
    },
    singleSelect: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        width: '100%',
    }
})