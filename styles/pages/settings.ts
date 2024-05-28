import { helpers } from '@utils/helpers';
import { StyleSheet } from 'react-native';
import { colors } from 'styles/global';

const settingsPageStyles = StyleSheet.create({
  optionTitle: {
    fontSize: helpers.resize(24),
    color: '#333',
  },
  optionWrapper: {
    paddingHorizontal: helpers.resize(12),
    paddingVertical: helpers.resize(16),
    marginVertical: helpers.resize(8),
    borderRadius: helpers.resize(12),
    backgroundColor: colors.secondary,
  },
  optionValue: {
    fontSize: helpers.resize(16),
    color: colors.primary,
  },
});

export default settingsPageStyles;
