import { Pressable, StyleSheet, View } from 'react-native';
import { IFilterOptions, ISortOptions } from 'types';
import Text from './Text';
import { colors, templates } from '@styles/global';
import { Checkbox, Modal, Portal } from 'react-native-paper';
import { helpers } from '@utils/helpers';
import { useState } from 'react';
import Button from './Button';
import DialogPicker from './DialogPicker';

interface ISortFilterSheetProps {
  filter: IFilterOptions;
  sort: ISortOptions;
  hasCS: boolean;
  setOptions: (newFilter: IFilterOptions, newSort: ISortOptions) => void;
  close: () => void;
}

const sortOptionsList = [
  'Default',
  'Name: A-Z',
  'Name: Z-A',
  'Price: 0-9',
  'Price: 9-0',
  'Profit first',
  'Loss first',
];

const timePointList = [
  '24-hours ago',
  '30-days ago',
  '90-days ago',
  'Year ago',
];

export default function SortFilterSheet(props: ISortFilterSheetProps) {
  const [ filterOptions, setFilterOptions ] = useState({ ...helpers.clone(props.filter) });
  const [ sortOptions, setSortOptions ] = useState({ ...helpers.clone(props.sort) });
  const [ openSelector, setOpenSelector ] = useState(-1);

  function changeFilterOption(opt: keyof IFilterOptions) {
    setFilterOptions({
      ...filterOptions,
      [opt]: !filterOptions[opt],
    });
  }

  function changeSortOptions(idx: number) {
    switch (idx) {
    case 1: setSortOptions({ ...sortOptions, by: 1, order: 'asc' }); break;
    case 2: setSortOptions({ ...sortOptions, by: 1, order: 'desc' }); break;
    case 3: setSortOptions({ ...sortOptions, by: 2, order: 'asc' }); break;
    case 4: setSortOptions({ ...sortOptions, by: 2, order: 'desc' }); break;
    case 5: setSortOptions({ ...sortOptions, by: 3, order: 'asc' }); break;
    case 6: setSortOptions({ ...sortOptions, by: 3, order: 'desc' }); break;
    default: setSortOptions({ ...sortOptions, by: 0, order: 'asc' });
    }
    setOpenSelector(-1);
  }

  function changeTimepointOption(idx: number) {
    switch (idx) {
    case 1: setSortOptions({ ...sortOptions, period: 'month' }); break;
    case 2: setSortOptions({ ...sortOptions, period: '3months' }); break;
    case 3: setSortOptions({ ...sortOptions, period: 'year' }); break;
    default: setSortOptions({ ...sortOptions, period: 'day' });
    }
    setOpenSelector(-1);
  }

  function applyOptions() {
    setTimeout(() => {
      props.setOptions({ ...filterOptions }, { ...sortOptions });
    }, 25);
  }

  return (
    <Portal>
      <Modal visible={true} onDismiss={() => props.close()}>
        <View style={styles.modal}>
          <Text bold style={styles.modalTitle}>Filters</Text>
          <View style={styles.optionsList}>
            <View style={styles.option}>
              <Text bold style={styles.optionTitle}>Non-marketable items</Text>
              <Checkbox
                status={filterOptions.nonMarketable ? 'checked' : 'unchecked'}
                onPress={() => changeFilterOption('nonMarketable')}
                color={colors.primary}
                uncheckedColor={colors.primary}
              />
            </View>
            <View style={styles.option}>
              <Text bold style={styles.optionTitle}>Non-tradable items</Text>
              <Checkbox
                status={filterOptions.nonTradable ? 'checked' : 'unchecked'}
                onPress={() => changeFilterOption('nonTradable')}
                color={colors.primary}
                uncheckedColor={colors.primary}
              />
            </View>
            {
              props.hasCS && <>
                <View style={styles.option}>
                  <Text bold style={styles.optionTitle}>CS2: Items with stickers</Text>
                  <Checkbox
                    status={filterOptions.nonTradable ? 'checked' : 'unchecked'}
                    onPress={() => changeFilterOption('nonTradable')}
                    color={colors.primary}
                    uncheckedColor={colors.primary}
                  />
                </View>
              </>
            }
          </View>

          <Text bold style={styles.modalTitle}>Sort</Text>
          <View style={styles.optionAsColumn}>
            <Text bold style={styles.optionTitle}>Sort by</Text>
            <Pressable style={styles.optionValueBtn} onPress={() => setOpenSelector(0)}>
              <Text style={styles.optionTitle}>{ sortOptions.by }</Text>
            </Pressable>
            {
              openSelector === 0 &&
                <DialogPicker
                  title='Select sort by'
                  content='Select how the items should be sorted'
                  list={sortOptionsList}
                  close={() => setOpenSelector(-1)}
                  select={(sortListId: number) => changeSortOptions(sortListId)}
                />
            }
          </View>

          {
            sortOptions.by >= 2 &&
              <View style={styles.optionAsColumn}>
                <Text bold style={styles.optionTitle}>Sort by</Text>
                <Pressable style={styles.optionValueBtn} onPress={() => setOpenSelector(1)}>
                  <Text style={styles.optionTitle}>{ sortOptions.period }</Text>
                </Pressable>
                {
                  openSelector === 1 &&
                    <DialogPicker
                      title='Price time point'
                      content='Select the time point for the price'
                      list={timePointList}
                      close={() => setOpenSelector(-1)}
                      select={(timeListId: number) => changeTimepointOption(timeListId)}
                    />
                }
              </View>
          }

          <Button
            text='Apply'
            onPress={() => applyOptions()}
            style={{ marginTop: 'auto' }}
          />
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: '90%',
    height: '80%',
    backgroundColor: colors.background,
    margin: 'auto',
    borderRadius: helpers.resize(24),
    padding: helpers.resize(16),
  },
  modalTitle: {
    fontSize: helpers.resize(28),
  },
  optionsList: {
    ...templates.column,
    gap: helpers.resize(12),
    marginVertical: helpers.resize(16),
  },
  option: {
    ...templates.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: helpers.resize(16),
  },
  optionTitle: {
    fontSize: helpers.resize(18),
    color: colors.textAccent,
  },
  optionAsColumn: {
    ...templates.column,
  },
  optionValueBtn: {
    padding: helpers.resize(8),
    borderRadius: helpers.resize(12),
    backgroundColor: colors.secondary,
  },
});
