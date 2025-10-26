import React, { useMemo } from 'react';
import { IItemPrice } from 'types';
import { helpers } from '@utils/helpers';
import { BorderRadius, colors, templates } from '@styles/global';
import { Icon } from 'react-native-elements';
import Text from '@/Text';
import { StyleSheet, View } from 'react-native';
import useStore from 'store';

interface IPriceTrendProps {
  price: IItemPrice;
  field: keyof IItemPrice;
  fontSize: number;
}

export const PriceTrend: React.FC<IPriceTrendProps> = ({ price, field, fontSize }) => {
  const $store = useStore();

  const priceDiff = useMemo(() => {
    const currentPrice = price.price;
    const comparedPrice = price[field] as number;
    if (!currentPrice || !comparedPrice) {
      return {
        amount: currentPrice || comparedPrice || 0,
        percent: '',
        icon: !currentPrice && !comparedPrice ? 'trending-flat' : !currentPrice ? 'trending-down' : 'trending-up',
        colors: {
          container: !currentPrice && !comparedPrice ? '#ff7700' : !currentPrice ? helpers.pastelify(colors.error, 100) : colors.success,
          text: !currentPrice && !comparedPrice ? colors.text : !currentPrice ? colors.white : colors.text,
        },
      };
    }

    const percent = (currentPrice - comparedPrice) / comparedPrice * 100;
    const change = currentPrice - comparedPrice;
    return {
      amount: Math.abs(change),
      percent: percent !== 0 ? `${Math.abs(percent).toFixed(1)}%` : '',
      icon: change < 0 ? 'trending-down' : change > 0 ? 'trending-up' : 'trending-flat',
      colors: {
        container: change < 0 ? helpers.pastelify(colors.error, 100) : change > 0 ? colors.success : '#ff7700',
        text: change < 0 ? colors.white : change > 0 ? colors.text : colors.text,
      },
    };
  }, [ price, field ]);

  return (
    <View
      style={[
        styles.priceChangeBadge,
        { backgroundColor: priceDiff.colors.container, minHeight: helpers.resize(fontSize * 1.5) },
      ]}
    >
      <Icon
        name={priceDiff.icon}
        size={helpers.resize(fontSize)}
        color={priceDiff.colors.text}
      />
      {
        priceDiff.amount > 0 && <View style={[ templates.row, { gap: helpers.resize(4) } ]}>
          { priceDiff.percent && <Text bold style={{ color: priceDiff.colors.text, fontSize: helpers.resize(fontSize) }}>{ priceDiff.percent } | </Text> }
          <Text bold style={{ color: priceDiff.colors.text, fontSize: helpers.resize(fontSize) }}>{ helpers.price($store.currency, priceDiff.amount) }</Text>
        </View>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
});
