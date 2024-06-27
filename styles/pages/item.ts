import { colors, templates } from '@styles/global';
import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';

const itemPageStyles = StyleSheet.create({
  game: {
    ...templates.row,
    alignItems: 'center',
    gap: helpers.resize(8),
    marginVertical: helpers.resize(16),
  },
  gameIcon: {
    height: helpers.resize(32),
    width: helpers.resize(32),
    borderRadius: helpers.resize(4),
  },
  gameTitle: {
    fontSize: helpers.resize(20),
  },
  itemImage: {
    width: helpers.resize(320),
    height: helpers.resize(240),
    objectFit: 'contain',
  },
  itemPill: {
    fontSize: helpers.resize(16),
    color: colors.textAccent,
    backgroundColor: colors.secondary,
    paddingHorizontal: helpers.resize(8),
    paddingVertical: helpers.resize(4),
    borderRadius: helpers.resize(8),
    textAlign: 'center',
    maxHeight: helpers.resize(32),
  },
  itemName: {
    fontSize: helpers.resize(20),
  },
});

export default itemPageStyles;
