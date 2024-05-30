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
    borderWidth: 0,
    borderRadius: helpers.resize(16),
    marginVertical: helpers.resize(12),
    padding: helpers.resize(8),
    backgroundColor: colors.secondary,
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
    color: colors.text,
  },
  profileID: {
    fontSize: helpers.resize(16),
    color: colors.textAccent,
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
});

export default profilePageStyles;
