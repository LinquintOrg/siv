import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, {useState} from 'react';
import {Divider, Icon} from 'react-native-elements';
import Text from '../Elements/text';
import { IUserSavesProps } from '../types';

export default function (props: IUserSavesProps) {
  const { users, loadInv, nav, displayErr, toggleModal } = props;
  const [ scale ] = useState(Dimensions.get('window').width / 423);
  const resize = (size: number) => {
    return Math.ceil(size * scale);
  };

  return (
    <ScrollView>
      <View>
        {users.map((item, index) => (
          <View key={`usersave-${index}`}>
            <TouchableOpacity style={styles.profileSection} onPress={() => {
              if (item.public) {
                loadInv(nav, item.id);
              } else {
                displayErr();
              }
            }} onLongPress={() => toggleModal(item)}>
              <Image style={styles.profilePicture} source={ { uri: item.url } } />
              <View style={[ styles.column ]}>
                <View style={styles.row}>
                  {
                    (item.state === 0) ? <Icon name={'circle'} type={'font-awesome'} color={'#f00'} size={resize(12)} tvParallaxProperties={undefined} />
                      : (item.state === 1) ? <Icon name={'circle'} type={'font-awesome'} color={'#0a0'} size={resize(12)} tvParallaxProperties={undefined} />
                        : (item.state === 2) ? <Icon name={'do-not-disturb'} color={'#fa0'} size={resize(12)} tvParallaxProperties={undefined} />
                          : <Icon name={'sleep'} type={'material-community'} color={'#44f'} size={resize(12)} tvParallaxProperties={undefined} />
                  }
                  <Text bold style={[ {fontSize: resize(14), marginLeft: resize(4), color: (item.public) ? '#337' : '#f00'} ]}>
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
            { (users.length - 1 !== index) ? <Divider width={1} style={{width: '95%', alignSelf: 'center'}} /> : null }
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const styles = StyleSheet.create({
  column: {
    display: 'flex',
    flexDirection: 'column',
    width: '65%'
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
    marginEnd: resize(8)
  },
  profileName: {
    fontSize: resize(16),
    color: '#666'
  },
  profileID: {
    fontSize: resize(13),
    color: '#444'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%'
  }
});
