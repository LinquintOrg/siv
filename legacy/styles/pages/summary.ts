import { colors, templates } from '@styles/global';
import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  column: {
    ...templates.column,
    gap: helpers.resize(8),
    marginTop: helpers.resize(12),
  },
  summaryTitle: {
    fontSize: helpers.resize(16),
    color: colors.text,
    marginBottom: helpers.resize(2),
  },
  summaryValue: {
    fontSize: helpers.resize(14),
    color: colors.text,
  },
  game: {
    ...templates.row,
    alignItems: 'center',
    gap: helpers.resize(12),
    marginTop: helpers.resize(16),
    backgroundColor: colors.primary,
    padding: helpers.resize(8),
    borderRadius: helpers.resize(6),
  },
  gameIcon: {
    height: helpers.resize(36),
    width: helpers.resize(36),
    borderRadius: helpers.resize(4),
  },
  gameTitle: {
    fontSize: helpers.resize(20),
    color: colors.white,
  },
  itemPriceInfo: {
    fontSize: helpers.resize(12),
    paddingHorizontal: helpers.resize(6),
    paddingVertical: helpers.resize(3),
    borderRadius: helpers.resize(6),
    maxHeight: helpers.resize(26),
  },
  loss: {
    color: '#660014',
    backgroundColor: '#F04C57',
  },
  profit: {
    color: '#246B43',
    backgroundColor: '#66CC92',
  },
  samePrice: {
    color: '#664200',
    backgroundColor: '#FFA90A',
  },
});
