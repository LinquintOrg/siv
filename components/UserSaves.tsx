import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Divider, Icon } from 'react-native-elements';
import Text from '../Elements/text';
import { IUserSavesProps } from '../utils/types';
import { usePreloadedState, useProfilesState } from '../utils/store';
import Loader from './Loader';

export default function (props: IUserSavesProps) {
  const { navigation, displayErr, toggleModal } = props;
  const [ scale ] = useState(Dimensions.get('window').width / 423);
  const resize = (size: number) => {
    return Math.ceil(size * scale);
  };

  const preload = usePreloadedState();
  const profiles = useProfilesState();

  // TODO: Remove divider and use the secondary color for the user container background

  return (
    <ScrollView style={{ height: '100%' }}>
      <View>
        {preload.get() ? profiles.getAll().map((item, index) => (
          <View key={`usersave-${index}`}>
            <TouchableOpacity style={styles.profileSection} onPress={() => {
              if (item.public) {
                navigation.navigate('Games', { steamId: item.id });
              } else {
                displayErr();
              }
            }} onLongPress={() => toggleModal(item)}>
              <Image style={styles.profilePicture} source={ { uri: item.url } } />
              <View style={[ styles.column ]}>
                <View style={styles.row}>
                  {
                    (item.state === 0) ? <Icon name={'circle'} type={'font-awesome'} color={'#f00'} size={resize(12)} />
                      : (item.state === 1) ? <Icon name={'circle'} type={'font-awesome'} color={'#0a0'} size={resize(12)} />
                        : (item.state === 2) ? <Icon name={'do-not-disturb'} color={'#fa0'} size={resize(12)} />
                          : <Icon name={'sleep'} type={'material-community'} color={'#44f'} size={resize(12)} />
                  }
                  <Text bold style={[ { fontSize: resize(14), marginLeft: resize(4), color: (item.public) ? '#337' : '#f00' } ]}>
                    {(!item.public) ? 'Profile is set to PRIVATE' :
                      (item.state === 0) ? 'Offline'
                        : (item.state === 1) ? 'Online'
                          : (item.state === 2) ? 'Busy'
                            : 'Away'}
                  </Text>
                </View>
                <Text bold style={styles.profileName}>{item.name}</Text>
                <Text style={styles.profileID}>{item.id}</Text>
              </View>
            </TouchableOpacity>
            { (profiles.getAll().length - 1 !== index) ? <Divider width={1} style={{ width: '95%', alignSelf: 'center' }} /> : null }
          </View>
        )) : <Loader />}
      </View>
    </ScrollView>
  );
}

// TODO: Move user saves component styles to global.ts

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const styles = StyleSheet.create({
  column: {
    display: 'flex',
    flexDirection: 'column',
    width: '65%',
  },
  profileSection: {
    borderRadius: 8,
    marginVertical: resize(12),
    display: 'flex',
    flexDirection: 'row',
    width: '92%',
    alignSelf: 'center',
  },
  profilePicture: {
    width:  resize(52),
    height: resize(52),
    borderRadius: 8,
    marginEnd: resize(8),
  },
  profileName: {
    fontSize: resize(16),
    color: '#666',
  },
  profileID: {
    fontSize: resize(13),
    color: '#444',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
});
