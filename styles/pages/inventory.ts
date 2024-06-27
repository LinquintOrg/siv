import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';
import { colors, templates } from 'styles/global';

const inventoryPageStyles = StyleSheet.create({
  game: {
    ...templates.row,
    gap: helpers.resize(10),
    alignItems: 'center',
    marginVertical: helpers.resize(12),
  },
  gameIcon: {
    height: helpers.resize(48),
    width: helpers.resize(48),
    borderRadius: helpers.resize(6),
  },
  gameTitle: {
    fontSize: helpers.resize(24),
  },
  item: {
    ...templates.row,
    gap: helpers.resize(12),
    marginVertical: helpers.resize(6),
    alignItems: 'center',
    padding: helpers.resize(8),
    backgroundColor: '#f0f0fa',
    borderRadius: helpers.resize(8),
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
    paddingVertical: helpers.resize(3),
    borderRadius: helpers.resize(6),
    textAlign: 'center',
    maxHeight: helpers.resize(24),
  },
  itemPrice: {
    fontSize: helpers.resize(18),
  },
  itemPriceInfo: {
    fontSize: helpers.resize(14),
    paddingHorizontal: helpers.resize(6),
    paddingVertical: helpers.resize(3),
    borderRadius: helpers.resize(6),
    maxHeight: helpers.resize(26),
  },
  loss: {
    color: '#660014',
    backgroundColor: '#FF0A1B88',
  },
  profit: {
    color: '#246B43',
    backgroundColor: '#66CC92CC',
  },
  samePrice: {
    color: '#664200',
    backgroundColor: '#FFA90A',
  },
});

export default inventoryPageStyles;
