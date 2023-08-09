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
    borderRadius: resize(16),
    height: resize(48),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  actionButton: {
    bottom: resize(80),
    position: 'absolute',
    backgroundColor: colors.secondary,
    borderRadius: resize(16),
  },
});

export const global = StyleSheet.create({
  rowContainer: {
    ...templates.row,
    marginTop: resize(8),
    marginBottom: resize(8),
    width: resize(400),
    alignItems: 'center',
    borderRadius: resize(12),
    alignSelf: 'center',
    padding: resize(8),
    backgroundColor: colors.secondary,
  },
  column: {
    ...templates.column,
  },
  row: {
    ...templates.row,
  },
  inputView: {
    width: '100%',
    height: resize(44),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: resize(8),
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
    minWidth: resize(144),
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
  smallButtonRow: {
    ...templates.row,
    justifyContent: 'space-evenly',
  },
  header: {
    ...templates.row,
    width: resize(400),
    alignSelf: 'center',
    padding: resize(12),
    backgroundColor: colors.textAccent,
    marginBottom: resize(8),
    alignContent: 'center',
    borderRadius: resize(16),
    gap: resize(8),
  },
  headerTitle: {
    fontSize: resize(20),
    color: colors.white,
  },
  headerImage: {
    width: resize(48),
    aspectRatio: 1,
    borderRadius: resize(10),
  },
  wrapRow: {
    ...templates.row,
    flexWrap: 'wrap',
    gap: resize(8),
  },
  actionButtonLeft: {
    ...templates.actionButton,
    left: resize(12),
  },
  actionButtonRight: {
    ...templates.actionButton,
    right: resize(12),
  },
  modal: {
    ...templates.column,
    borderRadius: resize(16),
    padding: resize(8),
    backgroundColor: colors.background,
    maxHeight: '80%',
    width: resize(400),
    alignSelf: 'center',
  },
  modalButton: {
    ...templates.button,
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: resize(2),
    margin: resize(8),
  },
  modalButtonActive: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    height: templates.button.height,
    fontSize: resize(16),
    color: colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  modalButtonTextActive: {
    color: colors.white,
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
      ...templates.column,
      borderWidth: 0,
      borderRadius: resize(16),
      marginVertical: resize(8),
      padding: resize(8),
      backgroundColor: colors.secondary,
      width: resize(400),
      alignSelf: 'center',
    },
    image: {
      width: resize(64),
      borderRadius: resize(12),
      marginEnd: resize(8),
      aspectRatio: 1.0,
    },
    profileName: {
      fontSize: resize(18),
      color: colors.text,
    },
    profileID: {
      fontSize: resize(16),
      color: colors.textAccent,
    },
    flowDown: {
      ...templates.column,
      width: resize(300),
      justifyContent: 'center',
    },
    flowRow: {
      ...templates.row,
      justifyContent: 'space-evenly',
    },
  }),
  profiles: StyleSheet.create({
    modal: {
      ...templates.column,
      backgroundColor: colors.background,
      borderRadius: resize(20),
      padding: resize(8),
    },
    modalUser: {
      fontSize: resize(16),
      color: colors.textAccent,
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
      color: colors.textAccent,
    },
  }),
  inventory: StyleSheet.create({
    itemContainer: {
      ...templates.row,
      marginVertical: resize(8),
      width: resize(400),
      alignContent: 'center',
      borderRadius: resize(16),
      alignSelf: 'center',
      padding: resize(8),
      backgroundColor: colors.background,
    },
    pill: {
      fontSize: resize(14),
      color: colors.textAccent,
      backgroundColor: colors.white,
      paddingHorizontal: resize(8),
      paddingVertical: resize(4),
      borderRadius: 50,
      textAlign: 'center',
    },
    itemName: {
      fontSize: resize(16),
      color: colors.textAccent,
    },
    priceSingle: {
      fontSize: resize(14),
      color: colors.textAccent,
      textAlign: 'center',
    },
    priceTotal: {
      fontSize: resize(18),
      color: colors.text,
      textAlign: 'center',
    },
  }),
  loader: StyleSheet.create({
    container: {
      ...templates.row,
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
