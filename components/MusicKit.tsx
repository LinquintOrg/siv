import React from 'react';
import { Image, View } from 'react-native';
import Text from '../components/Text';
import { helpers } from '../utils/helpers';
import { IExchangeRate, IMusicKit } from 'types';
import musicKitStyles from 'styles/components/musicKit';

interface IMusicKitWithRate extends IMusicKit {
  rate: IExchangeRate;
}

export default function MusicKit(props: IMusicKitWithRate) {
  const { artist, title, image, price, statPrice, rate } = props;
  const imgNotFound = 'https://inventory.linquint.dev/api/Files/img/no-photo.png';
  const styles = musicKitStyles;

  return (
    <View style={styles.item}>
      <Image style={styles.musicKitArtwork} source={{ uri: `https://community.akamai.steamstatic.com/economy/image/${image}` }} />
      <View style={{ display: 'flex', flexDirection: 'column' }}>
        <Text style={styles.album}>{ title }</Text>
        <Text style={styles.artist}>{ artist }</Text>
        <View style={styles.priceRow}>
          { !!price && <Text style={[ styles.price, styles.priceNormal ]}>{ helpers.price(rate, price) }</Text> }
          { !!statPrice && <Text style={[ styles.price, styles.priceStat ]}>{ helpers.price(rate, statPrice) }</Text> }
        </View>
      </View>
    </View>
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
