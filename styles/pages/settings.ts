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
    paddingVertical: helpers.resize(12),
    borderBottomColor: `${colors.textAccent}44`,
    borderBottomWidth: 1,
  },
  optionValue: {
    fontSize: helpers.resize(20),
    color: colors.primary,
  },
  optionValueSub: {
    fontSize: helpers.resize(16),
    color: colors.primary,
  },
  activeSelection: {
    backgroundColor: colors.primary,
    borderRadius: helpers.resize(8),
    paddingHorizontal: helpers.resize(12),
    paddingVertical: helpers.resize(12),
  },
});

export default settingsPageStyles;
