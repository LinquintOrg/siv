import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';
import { templates, colors } from 'styles/global';

const profilePageStyles = StyleSheet.create({
  type: {
    fontSize: helpers.resize(14),
    width: helpers.resize(400),
    textAlign: 'left',
    alignSelf: 'center',
  },
  section: {
    ...templates.column,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: helpers.resize(16),
    marginVertical: helpers.resize(12),
    padding: helpers.resize(8),
    width: helpers.resize(400),
    alignSelf: 'center',
  },
  image: {
    width: helpers.resize(80),
    borderRadius: helpers.resize(12),
    marginEnd: helpers.resize(8),
    aspectRatio: 1.0,
  },
  imageSmall: {
    width: helpers.resize(60),
    borderRadius: helpers.resize(8),
    marginEnd: helpers.resize(8),
    aspectRatio: 1.0,
  },
  profileName: {
    fontSize: helpers.resize(18),
    color: colors.primary,
  },
  profileID: {
    fontSize: helpers.resize(14),
    color: colors.text,
  },
  flowDown: {
    ...templates.column,
    width: helpers.resize(284),
    justifyContent: 'center',
  },
  flowDownSmall: {
    ...templates.column,
    width: helpers.resize(304),
    justifyContent: 'center',
  },
  flowRow: {
    ...templates.row,
    justifyContent: 'space-evenly',
  },
  inventoryLoadingWrapper: {
    ...templates.column,
    backgroundColor: colors.secondary,
    borderRadius: helpers.resize(12),
    padding: helpers.resize(8),
  },
  gameWrapper: {
    ...templates.row,
    alignItems: 'center',
    gap: helpers.resize(4),
    marginTop: helpers.resize(4),
  },
  gameIcon: {
    height: helpers.resize(24),
    width: helpers.resize(24),
    borderRadius: helpers.resize(4),
  },
  gameName: {
    color: colors.text,
    fontSize: helpers.resize(14),
  },
});

export default profilePageStyles;
