import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { global, styles } from '../styles/global';
import { IMusicKitProps } from '../utils/types';
import Text from '../components/Text';
import MusicKitPrices from './MusicKitPrices';

export default function MusicKit(props: IMusicKitProps) {
  const { item, prices, search, play } = props;
  const imgNotFound = 'https://inventory.linquint.dev/api/Files/img/no-photo.png';

  // TODO: Music kit container does not take up full width as it should, might be rerender related problem

  if (item.artist.toLowerCase().includes(search.toLowerCase()) || item.song.toLowerCase().includes(search.toLowerCase())) {
    return (
      <TouchableOpacity
        style={global.rowContainer}
        onPress={() => void play(item)}>
        <Image style={global.rowImage}
          source={{ uri: (item.img || imgNotFound) }} />
        <View style={[ global.column ]}>
          <Text bold style={styles.musicKits.song}>{item.song}</Text>
          <Text bold style={styles.musicKits.artist}>{item.artist}</Text>
        </View>
        <MusicKitPrices kit={item} prices={prices} />
      </TouchableOpacity>
    );
  } else {
    return null;
  }
}
