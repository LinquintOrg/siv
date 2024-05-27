import { Image, Pressable, View } from 'react-native';
import { colors, global, templates } from 'styles/global';
import { ISteamProfile } from 'types';
import styles from 'styles/pages/profile';
import Text from './Text';
import { helpers } from '@utils/helpers';
import { useMemo } from 'react';
import { Icon } from 'react-native-elements';

interface IPropsProfile {
  profile: ISteamProfile;
}

// { (item.state === 0) && <Icon name={'circle'} type={'font-awesome'} color={'#f00'} size={helpers.resize(12)} /> }
//                 { (item.state === 1) && <Icon name={'circle'} type={'font-awesome'} color={'#0a0'} size={helpers.resize(12)} /> }
//                 { (item.state === 2) && <Icon name={'do-not-disturb'} color={'#fa0'} size={helpers.resize(12)} /> }
//                 { (item.state === 3) && <Icon name={'sleep'} type={'material-community'} color={'#44f'} size={helpers.resize(12)}/>}

export default function Profile(props: IPropsProfile) {
  const profileState = useMemo(() => {
    switch (props.profile.state) {
    case 0: return { text: 'Offline', icon: { name: 'circle', color: '#f00' } };
    case 1: return { text: 'Online', icon: { name: 'circle', color: '#0a0' } };
    case 2: return { text: 'Busy', icon: { name: 'minus-circle-outline', color: '#fa0' } };
    default: return { text: 'Away', icon: { name: 'sleep', color: '#44f' } };
    }
  }, [ props ]);

  return (
    <Pressable style={[ styles.flowRow, { marginBottom: helpers.resize(12) } ]}>
      <Image source={{ uri: props.profile.url }} style={styles.image} />
      <View style={styles.flowDown}>
        <View style={[ global.row, { gap: helpers.resize(2), alignItems: 'center' } ]}>
          <Icon name={profileState.icon.name} type='material-community' color={profileState.icon.color} size={helpers.resize(12)} />
          <Text bold style={{ color: (props.profile.public) ? colors.primary : colors.error }}>
            { props.profile.public ? profileState.text : 'Profile is set to PRIVATE' }
          </Text>
        </View>
        <Text bold style={styles.profileName}>{ props.profile.name }</Text>
        <Text style={styles.profileID}>{ props.profile.id }</Text>
      </View>
    </Pressable>
  );
}
