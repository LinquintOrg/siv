import { colors } from '@styles/global';
import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';

const musicKitStyles = StyleSheet.create({
  item: {
    display: 'flex',
    gap: helpers.resize(10),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: helpers.resize(6),
    alignContent: 'center',
  },
  musicKitArtwork: {
    width: helpers.resize(100),
    height: helpers.resize(80),
    objectFit: 'contain',
  },
  artist: {
    fontSize: helpers.resize(16),
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: helpers.resize(4),
  },
  album: {
    fontSize: helpers.resize(18),
    fontWeight: 'bold',
    color: colors.primary,
  },
  price: {
    paddingVertical: helpers.resize(2),
    paddingHorizontal: helpers.resize(8),
    borderRadius: helpers.resize(8),
    fontWeight: 'bold',
    fontSize: helpers.resize(16),
  },
  priceNormal: {
    backgroundColor: colors.primary,
    color: colors.white,
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
