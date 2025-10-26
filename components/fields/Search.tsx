import React from 'react';
import { Pressable, StyleSheet, View, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';
import { BorderRadius, colors, FontSizes, Spacing } from '@styles/global';
import { helpers } from '@utils/helpers';

interface IFieldsSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFilter?: () => void;
  placeholder?: string;
}

export const FieldsSearch: React.FC<IFieldsSearchProps> = ({ value, onChange, onFilter, placeholder }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.primary}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChange('')} style={styles.clearButton}>
            <Icon name="clear" size={18} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {onFilter && (
        <Pressable
          style={styles.filterButton}
          onPress={onFilter}
          android_ripple={{ color: colors.secondary }}
        >
          <Icon name="options" size={22} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: helpers.resize(56),
    borderColor: colors.primary,
    borderStyle: 'solid',
    borderWidth: helpers.resize(1),
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.base,
    color: colors.text,
    padding: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  filterButton: {
    width: helpers.resize(56),
    height: helpers.resize(56),
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
