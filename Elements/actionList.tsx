import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { Icon } from 'react-native-elements';
import Text from '../components/Text';
import { ActivityIndicator } from 'react-native-paper';
import { IActionListProps } from '../utils/types';

export default function (props: IActionListProps) {
  // TODO: Improve the look of the actions list

  const { steamid, list, act } = props;
  const [ scale ] = useState(Dimensions.get('window').width / 423);
  const resize = (size: number) => {
    return Math.ceil(size * scale);
  };

  const _renderInventory = (game: string, id: number) => (
    <View style={[ styles.container, styles.inventory, id === act ? { backgroundColor: '#12428D' } : null ]}>
      {id === act ? <ActivityIndicator size={'small'} color={'#F2FAFD'} /> :
        id < act ? <Icon name={'check'} type={'entypo'} size={resize(20)} color={'#12428D'} /> :
          <Icon name={'query-builder'} size={resize(20)} color={'#12428D'} /> }
      <Text style={[ styles.text, id === act ? { color: '#F2FAFD' } : { color: '#12428D' } ]}>
        {((id === act) ? 'Loading ' : (id < act) ? 'Loaded ' : 'Load ') + game} inventory
      </Text>
    </View>
  );

  const _renderPause = (timeout: number, id: number) => (
    <View style={[ styles.container, styles.pause, id === act ? { borderColor: '#179D6C', borderWidth: 3 } : null ]}>
      <Text style={[ styles.text, { color: '#179D6C', fontSize: resize(12) } ]}>{timeout} second timeout</Text>
    </View>
  );

  const _renderPrices = (len: number, id: number) => (
    <View style={[ styles.container, styles.prices, id === act ? { backgroundColor: '#CC705B' } : null ]}>
      {id === act ?
        <ActivityIndicator size={'small'} color={'#E8E0C5'} /> : id < act ?
          <Icon name={'check'} type={'entypo'} size={resize(20)} color={'#CC705B'} /> :
          <Icon name={'query-builder'} size={resize(20)} color={'#CC705B'} /> }
      <Text style={[ styles.text, id === act ? { color: '#E8E0C5' } : { color: '#CC705B' } ]}>
        {((id === act) ? 'Loading ' : 'Load ')}{ (len === 1) ? '1 game ' : (len + ' games ')}prices
      </Text>
    </View>
  );

  return (
    <ScrollView>
      <Text style={styles.title}>Loading inventory</Text>
      <View style={styles.profileColumn}>
        <Text>Loading inventory for:</Text>
        <Text bold>{ steamid }</Text>
      </View>

      {list.map((action, index) => (
        <View key={`action-${index}`}>
          {
            action.action === 0 ? _renderInventory(action.extra as string, index)
              : action.action === 1 ? _renderPause(action.extra as number, index)
                : _renderPrices(action.extra as number, index)
          }

          {action.action === 2 ? <Icon name={'check'} type={'entypo'} size={resize(24)} /> :
            <Icon name={'chevron-down'} type={'entypo'} size={resize(24)} /> }
        </View>
      ))}
    </ScrollView>
  );
}

// TODO: Move action list styles to global.ts

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: resize(4),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inventory: {
    borderColor: '#12428D',
    borderRadius: 16,
    padding: resize(8),
  },
  pause: {
    padding: resize(4),
    borderRadius: 16,
  },
  prices: {
    borderColor: '#CC705B',
    borderRadius: 16,
    padding: resize(8),
  },
  text: {
    textAlign: 'center',
    fontSize: resize(14),
    marginLeft: resize(8),
  },
  profileColumn: {
    display: 'flex',
    flexDirection: 'column',
    padding: resize(12),
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    marginVertical: resize(16),
    alignSelf: 'center',
  },
  title: {
    fontSize: resize(24),
    color: '#333',
    textAlign: 'center',
  },
});
