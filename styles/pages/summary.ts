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
    fontSize: helpers.resize(15),
    color: colors.text,
  },
  summaryValue: {
    fontSize: helpers.resize(16),
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
    color: colors.text,
  },
});
