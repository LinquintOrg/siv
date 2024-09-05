import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Text from '../components/Text';
import { helpers } from '../utils/helpers';
import { IExchangeRate, IMusicKit } from 'types';
import musicKitStyles from 'styles/components/musicKit';

interface IMusicKitProps {
  kit: IMusicKit;
  rate: IExchangeRate;
  onClick: (arg0: IMusicKit) => Promise<void>;
}

export default function MusicKit(props: IMusicKitProps) {
  const { kit: { artist, title, folder, image, price }, rate, onClick } = props;
  const imgNotFound = 'https://inventory.linquint.dev/api/Files/img/no-photo.png';
  const styles = musicKitStyles;

  return (
    <Pressable style={styles.item} onPress={() => onClick(props.kit)}>
      <Image style={styles.musicKitArtwork} source={{ uri: image }} />
      <View style={{ display: 'flex', flexDirection: 'column' }}>
        <Text style={styles.album}>{ title }</Text>
        <Text style={styles.artist}>{ artist }</Text>
        <View style={styles.priceRow}>
          { !!price.normal && <Text style={[ styles.price, styles.priceNormal ]}>{ helpers.price(rate, price.normal) }</Text> }
          { !!price.stattrak && <Text style={[ styles.price, styles.priceStat ]}>{ helpers.price(rate, price.stattrak) }</Text> }
        </View>
      </View>
    </Pressable>
  );
  // if (item.artist.toLowerCase().includes(search.toLowerCase()) || item.song.toLowerCase().includes(search.toLowerCase())) {
  //   return (
  //     <TouchableOpacity
  //       style={global.rowContainer}
  //       onPress={() => void play(item)}>
  //       <Image style={global.rowImage}
  //         source={{ uri: (item.img || imgNotFound) }} />
  //       <View style={[ global.column, { width: helpers.resize(240) } ]}>
  //         <Text bold style={styles.musicKits.song}>{item.song}</Text>
  //         <Text bold style={styles.musicKits.artist}>{item.artist}</Text>
  //       </View>
  //       <MusicKitPrices kit={item} prices={prices} />
  //     </TouchableOpacity>
  //   );
  // } else {
  //   return null;
  // }
}
