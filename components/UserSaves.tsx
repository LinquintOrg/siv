import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Icon } from 'react-native-elements';
import Text from './Text';
import { IUserSavesProps } from '../utils/types';
import { usePreloadedState, useProfilesState } from '../utils/store';
import Loader from './Loader';
import { colors, global, styles } from '../styles/global';
import { helpers } from '@utils/helpers';

export default function (props: IUserSavesProps) {
  const { navigation, displayErr, toggleModal } = props;
  const preload = usePreloadedState();
  const profiles = useProfilesState();

  // TODO: Profile name can be single line only. Hide the overflow

  return (
    <ScrollView style={global.fullHeight}>
      <View style={styles.profiles.list}>
        {preload.get() ? profiles.getAll().map((item, index) => (
          <TouchableOpacity key={`usersave-${index}`} style={styles.profiles.profile} onPress={() => {
            if (item.public) {
              navigation.navigate('Games', { steamId: item.id });
            } else {
              displayErr();
            }
          }} onLongPress={() => toggleModal(item)}>
            <Image style={styles.profiles.profileAvatar} source={ { uri: item.url } } />
            <View style={[ global.column ]}>
              <View style={[ global.row ]}>
                { (item.state === 0) && <Icon name={'circle'} type={'font-awesome'} color={'#f00'} size={helpers.resize(12)} /> }
                { (item.state === 1) && <Icon name={'circle'} type={'font-awesome'} color={'#0a0'} size={helpers.resize(12)} /> }
                { (item.state === 2) && <Icon name={'do-not-disturb'} color={'#fa0'} size={helpers.resize(12)} /> }
                { (item.state === 3) && <Icon name={'sleep'} type={'material-community'} color={'#44f'} size={helpers.resize(12)}/>}
                <Text bold style={[ { fontSize: helpers.resize(14), marginLeft: helpers.resize(4), color: (item.public) ? colors.primary : colors.error } ]}>
                  {(!item.public) ? 'Profile is set to PRIVATE' :
                    (item.state === 0) ? 'Offline'
                      : (item.state === 1) ? 'Online'
                        : (item.state === 2) ? 'Busy'
                          : 'Away'}
                </Text>
              </View>
              <Text bold style={styles.profiles.profileName}>{item.name}</Text>
              <Text style={styles.profiles.profileID}>{item.id}</Text>
            </View>
          </TouchableOpacity>
        )) :
          <View style={[ global.center ]}>
            <Loader size='large' />
          </View>
        }
      </View>
    </ScrollView>
  );
}
