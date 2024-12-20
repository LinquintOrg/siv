import { Image, Pressable, View } from 'react-native';
import { colors, global } from 'styles/global';
import { ISteamProfile } from 'types';
import styles from 'styles/pages/profile';
import Text from './Text';
import { helpers } from '@utils/helpers';
import { useMemo } from 'react';
import { Icon } from 'react-native-elements';
import { router } from 'expo-router';

interface IPropsProfile {
  profile: ISteamProfile;
  removeProfile?: () => void;
  nonClickable?: boolean;
}

export default function Profile(props: IPropsProfile) {
  const { removeProfile } = props;

  const profileState = useMemo(() => {
    switch (props.profile.state) {
    case 0: return { text: 'Offline', icon: { name: 'circle', color: '#f00' } };
    case 1: return { text: 'Online', icon: { name: 'circle', color: '#0a0' } };
    case 2: return { text: 'Busy', icon: { name: 'minus-circle-outline', color: '#fa0' } };
    default: return { text: 'Away', icon: { name: 'sleep', color: '#44f' } };
    }
  }, [ props ]);

  async function navigateToGames() {
    if (props.nonClickable) {
      return;
    }
    if (!props.profile.public) {
      throw new Error('Cannot load inventory of a PRIVATE profile.');
    }
    const { id } = props.profile;
    router.push(`/inventory/games/${id}`);
  }

  return (
    <Pressable style={[ styles.flowRow, { marginBottom: props.nonClickable ? 0 : helpers.resize(12) } ]} onPress={navigateToGames} onLongPress={removeProfile}>
      <Image source={{ uri: props.profile.url }} style={props.nonClickable ? styles.imageSmall : styles.image} />
      <View style={props.nonClickable ? styles.flowDownSmall : styles.flowDown}>
        { !props.nonClickable &&
          <View style={[ global.row, { gap: helpers.resize(2), alignItems: 'center' } ]}>
            <Icon
              name={profileState.icon.name}
              type='material-community'
              color={profileState.icon.color}
              size={helpers.resize(12)}
            />
            <Text bold style={{ color: (props.profile.public) ? colors.primary : colors.error }}>
              { props.profile.public ? profileState.text : 'Profile is set to PRIVATE' }
            </Text>
          </View>
        }
        <Text bold style={styles.profileName}>{ props.profile.name }</Text>
        <Text bold style={styles.profileID}>SteamID: { props.profile.id }</Text>
      </View>
    </Pressable>
  );
}
