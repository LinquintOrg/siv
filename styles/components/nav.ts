import { StyleSheet } from 'react-native';
import { colors, templates } from 'styles/global';
import { helpers } from '@utils/helpers';

const navStyles = StyleSheet.create({
  container: {
    ...templates.row,
    width: '100%',
    backgroundColor: colors.white,
    paddingVertical: helpers.resize(8),
    justifyContent: 'space-evenly',
    shadowColor: '#333',
    gap: helpers.resize(8),
  },
  navButton: {
    ...templates.column,
    gap: helpers.resize(4),
    backgroundColor: '#ffffff00',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: helpers.resize(64),
  },
  navText: {
    textAlign: 'center',
    fontSize: helpers.resize(12),
    fontWeight: 'bold',
    color: colors.primary,
  },
  navIcon: {
    paddingHorizontal: helpers.resize(16),
    paddingVertical: helpers.resize(4),
  },
  navIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navIconBackground: {
    zIndex: 0,
    borderRadius: 50,
    position: 'absolute',
    height: '100%',
  },
});

export default navStyles;
