import { StyleSheet } from 'react-native';
import { colors, variables } from 'styles/global';
import { helpers } from 'utils/helpers';

const navStyles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    paddingVertical: helpers.resize(16),
    paddingHorizontal: helpers.resize(32),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#333',
  },
  navButton: {
    borderRadius: helpers.resize(10),
    backgroundColor: '#ffffff00',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: helpers.resize(2),
    maxWidth: helpers.resize(variables.iconXLarge),
  },
  navText: {
    textAlign: 'center',
    fontSize: helpers.resize(14),
    fontWeight: 'bold',
  },
  navIcon: {
    padding: helpers.resize(8),
  },
  activeIcon: {
    backgroundColor: colors.primary,
    borderRadius: helpers.resize(12),
  },
});

export default navStyles;
