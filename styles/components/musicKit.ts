import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';

const musicKitStyles = StyleSheet.create({
  item: {
    display: 'flex',
    gap: helpers.resize(10),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: helpers.resize(4),
    alignContent: 'center',
  },
  musicKitArtwork: {
    width: helpers.resize(80),
    height: helpers.resize(80),
    objectFit: 'contain',
  },
  artist: {
    fontSize: helpers.resize(15),
    fontWeight: 'bold',
    color: '#666',
    marginBottom: helpers.resize(4),
  },
  album: {
    fontSize: helpers.resize(18),
    fontWeight: 'bold',
    color: '#444',
  },
  price: {
    paddingVertical: helpers.resize(2),
    paddingHorizontal: helpers.resize(8),
    borderRadius: helpers.resize(8),
    fontWeight: 'bold',
    fontSize: helpers.resize(16),
  },
  priceNormal: {
    backgroundColor: '#aaa',
    color: '#222',
  },
  priceStat: {
    backgroundColor: '#fb5',
    color: '#930',
  },
  priceRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: helpers.resize(8),
  },
});

export default musicKitStyles;
