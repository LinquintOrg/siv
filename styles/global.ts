/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Dimensions, StyleSheet } from 'react-native';

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

export const colors = {
  text: '#000',
  textAccent: '#444',
  background: '#fff',
  primary: '#1058a7',
  secondary: '#c4d2f0',
  accent: '#ee3082',
  success: '#9AD797',
  error: '#eb5855',
  white: '#fff',
};

export const variables = {
  iconSize: resize(24),
  iconLarge: resize(36),
};

export const templates = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: resize(12),
    height: resize(48),
  },
});

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
    backgroundColor: colors.secondary,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  inputView: {
    width: '100%',
    height: resize(44),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: resize(8),
  },
  input: {
    width: resize(400),
    height: resize(40),
    margin: resize(12),
    fontSize: resize(14),
    borderRadius: resize(12),
  },
  inputIcon: {
    margin: 0,
    paddingTop: resize(8),
  },
  title: {
    textAlign: 'center',
    fontSize: resize(24),
    marginVertical: resize(8),
  },
  subtitle: {
    textAlign: 'center',
    fontSize: resize(16),
  },
  buttonSmall: {
    ...templates.button,
    width: resize(144),
  },
  buttonLarge: {
    ...templates.button,
    width: resize(360),
    alignSelf: 'center',
    marginVertical: resize(8),
  },
  buttonText: {
    color: colors.white,
    fontSize: resize(20),
    fontWeight: 'bold',
  },
  snackbarText: {
    fontSize: resize(16),
    color: colors.white,
    width: resize(400),
    textAlign: 'left',
  },
  rowImage: {
    width: resize(48),
    aspectRatio: 1,
    marginRight: resize(12),
    borderRadius: resize(8),
  },
});

export const styles = {
  musicKits: StyleSheet.create({
    artist: {
      fontSize: resize(14),
      color: colors.textAccent,
    },
    song: {
      fontSize: resize(16),
      color: colors.text,
    },
  }),
  profileSearch: StyleSheet.create({
    type: {
      fontSize: resize(14),
      width: resize(400),
      textAlign: 'left',
      alignSelf: 'center',
    },
    section: {
      ...global.row,
      borderWidth: 0,
      borderRadius: resize(12),
      marginVertical: resize(8),
      padding: resize(8),
      backgroundColor: colors.secondary,
      width: resize(400),
      alignSelf: 'center',
    },
    image: {
      width: resize(64),
      borderRadius: resize(8),
      marginEnd: resize(8),
      aspectRatio: 1.0,
    },
    profileName: {
      fontSize: resize(14),
      color: colors.text,
    },
    profileID: {
      fontSize: resize(14),
      color: colors.textAccent,
      fontWeight: 'bold',
    },
    flowDown: {
      ...global.column,
      width: resize(300),
    },
    flowRow: {
      ...global.row,
      justifyContent: 'space-evenly',
    },
  }),
  profiles: StyleSheet.create({
    modal: {
      ...global.column,
      backgroundColor: colors.background,
      borderRadius: resize(12),
      padding: resize(8),
    },
    modalUser: {
      fontSize: resize(16),
      color: colors.textAccent,
      fontWeight: 'bold',
      marginBottom: resize(8),
    },
  }),
  games: StyleSheet.create({
    title: {
      fontSize: resize(18),
      color: colors.text,
    },
    appid: {
      fontSize: resize(15),
      fontWeight: 'bold',
      color: colors.textAccent,
    }
  }),
  loader: StyleSheet.create({
    container: {
      ...global.row,
      justifyContent: 'space-around',
      alignSelf: 'center',
      marginVertical: resize(16),
    },
    text: {
      color: colors.text,
      fontSize: resize(20),
      marginLeft: resize(8),
    },
  }),
};
