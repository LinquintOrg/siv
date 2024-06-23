import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';
import { colors, templates } from 'styles/global';

const inventoryPageStyles = StyleSheet.create({
  game: {
    ...templates.row,
    gap: helpers.resize(10),
    alignItems: 'center',
    marginVertical: helpers.resize(8),
  },
  gameIcon: {
    height: helpers.resize(36),
    width: helpers.resize(36),
    borderRadius: helpers.resize(4),
  },
  gameTitle: {
    fontSize: helpers.resize(24),
  },
  item: {
    ...templates.row,
    gap: helpers.resize(12),
    marginVertical: helpers.resize(12),
    alignItems: 'center',
  },
  itemImage: {
    height: helpers.resize(84),
    width: helpers.resize(84),
    objectFit: 'contain',
    marginVertical: helpers.resize(4),
  },
  itemTitle: {
    fontSize: helpers.resize(16),
  },
  itemPill: {
    fontSize: helpers.resize(12),
    color: colors.textAccent,
    backgroundColor: colors.secondary,
    paddingHorizontal: helpers.resize(6),
    paddingVertical: helpers.resize(2),
    borderRadius: 50,
    textAlign: 'center',
    maxHeight: helpers.resize(20),
  },
  itemPrice: {
    fontSize: helpers.resize(18),
  },
  itemPriceInfo: {
    fontSize: helpers.resize(14),
  },
});

export default inventoryPageStyles;
