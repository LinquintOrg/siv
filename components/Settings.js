import React, {useRef, useState} from "react";
import {Text, View, StyleSheet, Image} from "react-native";
import {Dropdown} from 'react-native-element-dropdown';

export default function (props) {
    const rates = props.rates
    let rate = props.rate

    const [valuesInitialized, setValuesInitialized] = useState(false)
    const [ratesData] = useState([])

    if (!valuesInitialized) {
        setValuesInitialized(true)
        rates.forEach((item, index) => {
            ratesData.push({ label: item.abb + ' - ' + item.full, value: index })
        })
    }

    const _renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    return (
        <View>
            <Text style={styles.title}>Settings</Text>

            <Text style={styles.settingTitle}>Currency</Text>
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.shadow}
                data={ratesData}
                search
                label="Currency"
                searchPlaceholder={"Search"}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                value={rate}
                onChange={item => {
                    props.saveSetting('currency', item.value)
                    console.log('selected', item);
                }}
                renderItem={item => _renderItem(item)}
            />

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
    },
    dropdown: {
        backgroundColor: 'white',
        borderColor: '#22A',
        borderWidth: 2,
        width: '96%',
        alignSelf: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
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
    item: {
        paddingVertical: 17,
        paddingHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 16,
    },
    settingTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 16,
        marginTop: 8,
        marginBottom: 4,
        color: '#333',
    }
})