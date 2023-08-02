import { Dimensions, StyleSheet } from 'react-native';

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

export const global = StyleSheet.create({
  rowContainer: {
    marginTop: resize(8),
    marginBottom: resize(8),
    width: resize(400),
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: resize(12),
    alignSelf: 'center',
    padding: resize(8),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export const styles = {
  musicKits: StyleSheet.create({
    image: {
      width: resize(48),
      aspectRatio: 1,
      marginRight: resize(12),
    },
    artist: {
      fontSize: resize(14),
      color: '#666',
    },
    song: {
      fontSize: resize(16),
      color: '#222',
    },
  }),
};
