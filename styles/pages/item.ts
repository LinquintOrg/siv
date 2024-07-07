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
    color: colors.text,
  },
  itemImage: {
    width: helpers.resize(320),
    height: helpers.resize(240),
    objectFit: 'contain',
    backgroundColor: colors.secondary,
    borderRadius: helpers.resize(8),
  },
  itemPill: {
    fontSize: helpers.resize(16),
    color: colors.text,
    backgroundColor: colors.secondary,
    paddingHorizontal: helpers.resize(8),
    paddingVertical: helpers.resize(4),
    borderRadius: helpers.resize(8),
    textAlign: 'center',
    maxHeight: helpers.resize(32),
  },
  itemName: {
    fontSize: helpers.resize(20),
    color: colors.text,
  },
  stickerImage: {
    width: helpers.resize(86),
    height: helpers.resize(64),
    objectFit: 'contain',
  },
  stickerName: {
    fontSize: helpers.resize(16),
    color: colors.textAccent,
  },
  stickerPrice: {
    fontSize: helpers.resize(18),
    color: colors.text,
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

export default itemPageStyles;
