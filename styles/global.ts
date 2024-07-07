/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Dimensions, StyleSheet } from 'react-native';

const resize = (size: number) => {
  const scale = Dimensions.get('window').width / 423;
  return Math.ceil(size * scale);
};

const transparentize = (color: string, opacity: number) => {
  const alpha = parseInt(String(opacity * 255), 16);
  return `${color}${alpha}`;
};

export const colors = {
  text: '#FFF',
  textAccent: '#DDD',
  background: '#232C2F',
  primary: '#0193F4',
  secondary: '#66768F',
  accent: '#ee3082',
  success: '#9AD797',
  error: '#eb5855',
  white: '#1A2123',
};

export const variables = {
  iconSize: resize(24),
  iconLarge: resize(36),
  iconXLarge: resize(48),
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
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  fullHeight: {
    height: '100%',
  },
  fullWidth: {
    width: '100%',
  },
});

export const global = StyleSheet.create({
  rowContainer: {
    ...templates.row,
    marginVertical: resize(8),
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
  },
  input: {
    height: resize(50),
    fontSize: resize(14),
    borderRadius: resize(12),
  },
  inputIcon: {
    margin: 0,
    paddingTop: resize(8),
  },
  title: {
    fontSize: resize(32),
    marginVertical: resize(16),
    color: colors.text,
  },
  titleSmall: {
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
    backgroundColor: colors.white,
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
    maxHeight: '85%',
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
  width50: {
    width: '50%',
  },
  width33: {
    width: '33.3%',
  },
  width100: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  pcIncrease: {
    backgroundColor: '#7fff7f',
    color: '#336433',
  },
  pcDecrease: {
    backgroundColor: '#ff7f7f',
    color: '#663333',
  },
  pcUnchanged: {
    backgroundColor: '#ff9f7f',
    color: '#664033',
  },
  dataRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsTitle: {
    fontSize: resize(15),
    textAlignVertical: 'center',
  },
  statsValue: {
    fontSize: resize(16),
    color: colors.textAccent,
    textAlign: 'right',
  },
  divider: {
    width: resize(64),
    alignSelf: 'center',
    borderRadius: 8,
    marginVertical: resize(12),
  },
  scrollEnd: {
    width: resize(256),
    alignSelf: 'center',
    alignItems: 'center',
    padding: resize(8),
    backgroundColor: colors.secondary,
    borderRadius: resize(20),
    marginTop: resize(8),
    marginBottom: resize(96),
  },
  dropdownInput: {
    fontSize: resize(16),
    color: colors.textAccent,
    borderRadius: resize(16),
    borderColor: colors.primary,
  },
  selectedTextStyle: {
    fontSize: resize(18),
  },
  dropdown: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderWidth: resize(2),
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: resize(8),
    borderRadius: resize(16),
    marginHorizontal: resize(8),
    minHeight: resize(48),
  },
  dropdownTitle: {
    fontSize: resize(18),
    textAlign: 'left',
    marginBottom: resize(2),
    marginTop: resize(12),
    color: colors.textAccent,
  },
  dropdownSelect: {
    ...templates.row,
    backgroundColor: transparentize(colors.secondary, 0.1),
    paddingVertical: resize(12),
    marginVertical: resize(4),
    paddingHorizontal: resize(8),
    marginHorizontal: resize(4),
    borderColor: colors.primary,
    borderRadius: resize(12),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelectText: {
    flex: 1,
    fontSize: resize(14),
  },
  center: {
    alignContent: 'center',
    justifyContent: 'center',
  },
});

export const styles = {
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
    profile: {
      ...templates.row,
      width: resize(400),
      borderRadius: resize(16),
      padding: resize(8),
      alignSelf: 'center',
      gap: resize(8),
      backgroundColor: colors.white,
    },
    profileAvatar: {
      width: resize(64),
      height: resize(64),
      borderRadius: resize(12),
    },
    profileName: {
      fontSize: resize(16),
      color: colors.textAccent,
    },
    profileID: {
      fontSize: resize(14),
      color: colors.text,
    },
    list: {
      ...templates.column,
      marginVertical: resize(12),
      gap: resize(12),
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
    itemImage: {
      width: resize(216),
      height: resize(216),
      borderWidth: resize(2),
      borderRadius: resize(12),
      backgroundColor: colors.background,
      marginVertical: resize(8),
      alignSelf: 'center',
    },
    stickerImage: {
      height: variables.iconXLarge,
      width: variables.iconXLarge,
      marginRight: resize(8),
      borderRadius: resize(8),
      backgroundColor: colors.white,
    },
    stickersSection: {
      ...templates.column,
      gap: resize(8),
      padding: resize(8),
      borderRadius: resize(16),
      backgroundColor: transparentize(colors.secondary, 0.25),
    },
    itemModalTitle: {
      textAlign: 'center',
      fontSize: resize(20),
      marginVertical: resize(8),
    },
    dismissHint: {
      marginTop: resize(32),
      backgroundColor: colors.secondary,
      paddingVertical: resize(16),
      paddingHorizontal: resize(8),
      borderRadius: resize(12),
      fontSize: resize(16),
      textAlign: 'center',
    },
  }),
  loader: StyleSheet.create({
    container: {
      ...templates.row,
      justifyContent: 'space-around',
      alignSelf: 'center',
      marginVertical: resize(16),
      alignItems: 'center',
    },
    text: {
      color: colors.text,
      fontSize: resize(20),
      marginLeft: resize(8),
    },
  }),
};
