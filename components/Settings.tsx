import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Dimensions, Pressable} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {Divider, Icon} from 'react-native-elements';
import Text from '../Elements/text';
import * as Clipboard from 'expo-clipboard';
import { ISettingsProps } from '../utils/types';

export default function (props: ISettingsProps) {
  const { rates, rate, saveSetting } = props;

  const [ scale ] = useState(Dimensions.get('window').width / 423);
  const resize = (size: number) => {
    return Math.ceil(size * scale);
  };

  const [ valuesInitialized, setValuesInitialized ] = useState(false);
  const [ ratesData ] = useState<{ label: string; value: number }[]>([]);

  if (!valuesInitialized) {
    if (rates.length > 0) {
      setValuesInitialized(true);
      rates.forEach((item, index) => {
        ratesData.push({label: item.abb + ' - ' + item.full, value: index});
      });
    }
  }

  const _renderItem = (item: { label: string; value: number }) => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
      </View>
    );
  };

  return (
    <ScrollView>
      <Text bold style={styles.title}>Settings</Text>
      <Text style={{fontSize: resize(14), alignSelf: 'center', color: '#777', width: '90%', marginTop: 8}}>
        After pressing on dropdown, please wait for it to load
      </Text>

      <Text bold style={styles.settingTitle}>Currency</Text>
      {
        (valuesInitialized) ?
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.shadow}
            data={ratesData}
            search
            searchPlaceholder={'Search'}
            labelField="label"
            valueField="value"
            placeholder="Select item"
            value={rate}
            onChange={(item: { label: string; value: number }) => {
              saveSetting('currency', item.value);
            }}
            renderItem={(item: { label: string; value: number }) => _renderItem(item)}
            inputSearchStyle={styles.dropdownInput}
            selectedTextStyle={styles.selectedTextStyle}
          /> :
          <View>
            <Text style={{fontSize: resize(14), alignSelf: 'center', color: '#777', width: '90%', marginTop: 8}}>Couldn&apos;t fetch data...</Text>
          </View>
      }

      {/*<Text style={styles.title}>Credits</Text>
            <View>
                <div>Icons made by <a href="https://www.flaticon.com/authors/apien" title="apien">apien</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                <View style={styles.iconCreditRow}>
                    <Image style={styles.iconCreditSize} source={{uri: 'https://inventory.linquint.dev/api/Files/img/no-photo.png'}} />
                    <Text style={styles.iconCreditTitle}>Icon made by <Text style={styles.iconCreditAuthorURL}>apien</Text><Text style={styles.iconCreditSubtitle}> | source <Text style={styles.iconCreditAuthorURL}>www.flaticon.com</Text></Text></Text>
                </View>

                <div>Icons made by <a href="https://www.flaticon.com/authors/pixelmeetup" title="Pixelmeetup">Pixelmeetup</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
                <View style={styles.iconCreditRow}>
                    <Image style={styles.iconCreditSize} source={{uri: 'https://inventory.linquint.dev/api/Files/img/profile.png'}} />
                    <Text style={styles.iconCreditTitle}>Icon made by <Text style={styles.iconCreditAuthorURL}>Pixelmeetup</Text><Text style={styles.iconCreditSubtitle}> | source <Text style={styles.iconCreditAuthorURL}>www.flaticon.com</Text></Text></Text>
                </View>
            </View>*/}
      <Text bold style={styles.title}>Other</Text>

      <Text bold style={styles.settingTitle}>Links</Text>
      <Text style={{fontSize: resize(16), textAlign: 'center', width: '95%', alignSelf: 'center', marginVertical: 4}}>
        Website URL @ <Text bold style={{color: '#3342A3'}}>inventory.linquint.dev</Text>
      </Text>
      <Pressable
        onPress={() => Clipboard.setStringAsync('https://inventory.linquint.dev/') }
        style={({pressed}) => pressed ? [ styles.copyButton, {backgroundColor: '#8f9eff'} ] : styles.copyButton}
      >
        <Icon name="copy" type="feather" size={resize(18)} color='#3342A3' />
        <Text bold style={styles.copyText}>Copy Link</Text>
      </Pressable>

      <Text style={{fontSize: resize(16), textAlign: 'center', width: '95%', alignSelf: 'center', marginVertical: 4}}>
        You can check API status @ <Text bold style={{color: '#3342A3'}}>status.linquint.dev</Text>
      </Text>
      <Pressable
        onPress={() => Clipboard.setStringAsync('https://status.linquint.dev/')}
        style={({pressed}) => pressed ? [ styles.copyButton, {backgroundColor: '#8f9eff'} ] : styles.copyButton}
      >
        <Icon name="copy" type="feather" size={resize(18)} color='#3342A3' />
        <Text bold style={styles.copyText}>Copy Link</Text>
      </Pressable>

      <Text style={{fontSize: resize(16), textAlign: 'center', width: '95%', alignSelf: 'center', marginVertical: 4}}>
        You can find credits @ <Text bold style={{color: '#3342A3'}}>inventory.linquint.dev/credits</Text>
      </Text>
      <Pressable
        onPress={() => Clipboard.setStringAsync('https://inventory.linquint.dev/credits/')}
        style={({pressed}) => pressed ? [ styles.copyButton, {backgroundColor: '#8f9eff'} ] : styles.copyButton}
      >
        <Icon name="copy" type="feather" size={resize(18)} color='#3342A3' />
        <Text bold style={styles.copyText}>Copy Link</Text>
      </Pressable>

      <Text style={{fontSize: resize(16), textAlign: 'center', width: '95%', alignSelf: 'center', marginVertical: 4}}>
        You can find changelogs @ <Text bold style={{color: '#3342A3'}}>inventory.linquint.dev/changelogs</Text>
      </Text>
      <Pressable
        onPress={() => Clipboard.setStringAsync('https://inventory.linquint.dev/changelogs/')}
        style={({pressed}) => pressed ? [ styles.copyButton, {backgroundColor: '#8f9eff'} ] : styles.copyButton}
      >
        <Icon name="copy" type="feather" size={resize(18)} color='#3342A3' />
        <Text bold style={styles.copyText}>Copy Link</Text>
      </Pressable>

      <Divider width={4} style={{width: '20%', alignSelf: 'center', marginVertical: resize(16), borderRadius: 8}} color={'#0A5270'} />

      <Text bold style={styles.settingTitle}>Steam Market search timeout</Text>
      <Text style={{width: '85%', alignSelf: 'center', fontSize: resize(14), textAlign: 'justify'}}>
        Steam Market allows only <Text bold>20</Text> requests every <Text bold>5</Text> minutes.
        For this reason you can search across Steam Market once every <Text bold>15</Text> seconds.
      </Text>

      <Text bold style={styles.settingTitle}>Steam Inventory timeout</Text>
      <Text style={{width: '85%', alignSelf: 'center', fontSize: resize(14), textAlign: 'justify'}}>
        Steam allows only <Text bold>5</Text> requests every <Text bold>minute</Text>. Because of this when you choose
        <Text bold>5 or more games</Text> there&apos;s <Text bold> 12</Text> second timeout, otherwise there&apos;s <Text bold>6</Text> second timeout.
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
        <Text style={{fontSize: resize(18), textAlign: 'center', width: '90%', alignSelf: 'center'}}>
          <Text bold>Steam Inventory Value</Text> is not affiliated with
          <Text bold> Steam</Text> or <Text bold>Valve Corp</Text>.
        </Text>
      </View>
    </ScrollView>
  );
}

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

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
  copyButton: {
    padding: resize(8),
    width: '40%',
    alignSelf: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    borderColor: '#3342A3',
    borderWidth: 3,
    borderRadius: 16,
    marginBottom: resize(8),
    elevation: 3,
    backgroundColor: '#fff',
  },
  copyText: {
    color: '#3342A3',
    fontSize: resize(14),
    marginLeft: resize(8),
  }
});
