import React, {useState} from "react";
import {View, StyleSheet, ScrollView, Dimensions} from "react-native";
import {Dropdown} from 'react-native-element-dropdown';
import {Divider} from "react-native-elements";
import Text from '../Elements/text'

export default function (props) {
    const rates = props.rates
    let rate = props.rate

    const [scale] = useState(Dimensions.get('window').width / 423);
    const resize = (size) => {
        return Math.ceil(size * scale)
    }

    const [valuesInitialized, setValuesInitialized] = useState(false)
    const [ratesData] = useState([])

    if (!valuesInitialized) {
        if (rates.length > 0) {
            setValuesInitialized(true)
            rates.forEach((item, index) => {
                ratesData.push({label: item.abb + ' - ' + item.full, value: index})
            })
        }
    }

    const _renderItem = item => {
        return (
            <View style={styles.item}>
                <Text style={styles.textItem}>{item.label}</Text>
            </View>
        );
    };

    return (
        <ScrollView>
            <Text bold style={styles.title}>Settings</Text>
            <Text style={{fontSize: resize(14), alignSelf: 'center', color: '#777', width: '90%', marginTop: 8,}}>After pressing on dropdown, please wait for it to load</Text>

            <Text bold style={styles.settingTitle}>Currency</Text>
            {
                (valuesInitialized) ?
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
                        }}
                        renderItem={item => _renderItem(item)}
                        inputSearchStyle={styles.dropdownInput}
                        selectedTextStyle={styles.selectedTextStyle}
                    /> :
                    <View>
                        <Text style={{fontSize: resize(14), alignSelf: 'center', color: '#777', width: '90%', marginTop: 8,}}>Couldn't fetch data...</Text>
                    </View>
            }

           {/*<Text style={styles.title}>Credits</Text>
            <View>
                <div>Icons made by <a href="https://www.flaticon.com/authors/apien" title="apien">apien</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                <View style={styles.iconCreditRow}>
                    <Image style={styles.iconCreditSize} source={{uri: 'https://domr.xyz/api/Files/img/no-photo.png'}} />
                    <Text style={styles.iconCreditTitle}>Icon made by <Text style={styles.iconCreditAuthorURL}>apien</Text><Text style={styles.iconCreditSubtitle}> | source <Text style={styles.iconCreditAuthorURL}>www.flaticon.com</Text></Text></Text>
                </View>

                <div>Icons made by <a href="https://www.flaticon.com/authors/pixelmeetup" title="Pixelmeetup">Pixelmeetup</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                <View style={styles.iconCreditRow}>
                    <Image style={styles.iconCreditSize} source={{uri: 'https://domr.xyz/api/Files/img/profile.png'}} />
                    <Text style={styles.iconCreditTitle}>Icon made by <Text style={styles.iconCreditAuthorURL}>Pixelmeetup</Text><Text style={styles.iconCreditSubtitle}> | source <Text style={styles.iconCreditAuthorURL}>www.flaticon.com</Text></Text></Text>
                </View>
            </View>*/}
            <Text bold style={styles.title}>Other</Text>

            <Text bold style={styles.settingTitle}>Links</Text>
            <Text style={{fontSize: resize(14), textAlign: 'center', width: '95%', alignSelf: 'center', marginVertical: 4,}}>You can check API status @ <Text style={{color: '#3342A3'}}>status.domr.xyz</Text></Text>
            <Text style={{fontSize: resize(14), textAlign: 'center', width: '95%', alignSelf: 'center', marginVertical: 4,}}>You can find credits @ <Text style={{color: '#3342A3'}}>domr.xyz/credits</Text></Text>

            <Divider width={4} style={{width: '20%', alignSelf: 'center', marginVertical: resize(16), borderRadius: 8}} color={'#0A5270'} />

            <Text bold style={styles.settingTitle}>Timeouts</Text>
            <Text style={{width: '85%', alignSelf: 'center', fontSize: resize(14)}}>
                Steam Market allows only <Text bold>20</Text> request every <Text bold>5</Text> minutes, therefore you can conduct search across Steam Market once every <Text bold>15</Text> seconds.
            </Text>

            {/*<Text bold style={styles.settingTitle}>Latest updates</Text>
            <View style={styles.updatesCard}>
                <Text bold style={styles.updatesTitle}>Music kits and prices.</Text>
                <Text style={styles.updatesText}>Added missing 'Music Kits' and fixed an issue which left a few games with outdated prices. (Games: Artifact Classic,
                    Killing Floor 2, Path Of Exile, SteamVR, Warframe and Z1 Battle Royale)</Text>
                <Text style={styles.updatesDate}>Published on 2022-06-24</Text>
            </View>*/}

            <Divider width={4} style={{width: '20%', alignSelf: 'center', marginVertical: resize(16), borderRadius: 8}} color={'#0A5270'} />

            <View style={styles.textColumn}>
                <Text style={{fontSize: resize(18), textAlign: 'center', width: '90%', alignSelf: 'center',}}>
                    <Text bold>Steam Inventory Value</Text> is not affiliated with
                    <Text bold> Steam</Text> or <Text bold>Valve Corp</Text>.
                </Text>
            </View>
        </ScrollView>
    )
}

const resize = (size) => {
    const scale = Dimensions.get('window').width / 423
    return Math.ceil(size * scale)
}

const styles = StyleSheet.create({
    title: {
        fontSize: resize(24),
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
        marginVertical: resize(16),
        backgroundColor: '#0C2925',
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 8,
    },
    optionName: {
        color: '#ccc',
        fontSize: resize(16),
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionDescription: {
        color: '#999',
        fontSize: resize(12),
    },
    optionChoice: {
        width: '30%',
        borderRadius: 8,
        backgroundColor: '#00FCA3',
        color: '#222',
        fontSize: resize(16),
        fontWeight: 'bold',
        textAlignVertical: 'center',
        textAlign: 'center',
    },
    textColumn: {
        width: '90%',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    singleSelect: {
        textAlign: 'center',
        fontSize: resize(16),
        fontWeight: 'bold',
        width: '100%',
    },
    dropdown: {
        backgroundColor: 'white',
        borderColor: '#22A',
        borderWidth: 2,
        width: '90%',
        alignSelf: 'center',
        paddingHorizontal: 8,
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
    settingTitle: {
        fontSize: resize(18),
        marginTop: 8,
        marginBottom: 4,
        color: '#333',
        width: '90%',
        alignSelf: 'center',
    },
    dropdownInput: {
        fontSize: resize(14),
        color: '#333',
        borderRadius: 8,
    },
    selectedTextStyle: {
        fontSize: resize(16),
    },
    updatesCard: {
        display: 'flex',
        flexDirection: 'column',
        padding: resize(12),
        backgroundColor: '#fbfbfb',
        borderRadius: 16,
        marginHorizontal: resize(16),
        alignSelf: 'center',
        width: '90%',
        elevation: 4,
    },
    updatesTitle: {
        fontSize: resize(18),
        color: '#555',
    },
    updatesDate: {
        fontSize: resize(14),
        color: '#777',
    },
    updatesText: {
        fontSize: resize(14),
        color: '#333',
        textAlign: 'justify',
    },
})