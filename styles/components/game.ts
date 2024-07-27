import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';
import { colors, templates } from 'styles/global';

const gameStyles = StyleSheet.create({
  wrapper: {
    ...templates.row,
    padding: helpers.resize(8),
    marginVertical: helpers.resize(4),
    gap: helpers.resize(16),
    alignItems: 'center',
    borderRadius: helpers.resize(12),
  },
  image: {
    width: helpers.resize(48),
    height: helpers.resize(48),
    borderRadius: helpers.resize(8),
  },
  gameTitle: {
    fontSize: helpers.resize(18),
    color: colors.primary,
  },
  gameId: {
    fontSize: helpers.resize(14),
    color: colors.accent,
    fontWeight: 'bold',
  },
  active: {
    backgroundColor: `${colors.secondary}77`,
  },
});

export default gameStyles;
