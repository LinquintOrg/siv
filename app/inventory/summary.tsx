import Profile from '@/Profile';
import Text from '@/Text';
import { global, templates } from '@styles/global';
import { helpers } from '@utils/helpers';
import { useMemo } from 'react';
import { ScrollView, View, Image } from 'react-native';
import useStore from 'store';
import { IItemPrice, ISummary, ISummaryBase } from 'types';
import style from '@styles/pages/summary';

export default function InventorySummaryPage() {
  const $store = useStore();

  const summary = useMemo(() => {
    if (!$store.summary?.games.length) {
      return null;
    }
    return $store.summary;
  }, [ $store ]);

  const summaryKeyTitle: { [key: string]: { type: 'simple' | 'price'; title: string; compare?: boolean } } = {
    totalValue: { type: 'price', title: 'Total value of selected games' },
    itemCount: { type: 'simple', title: 'Owned items' },
    sellableItems: { type: 'simple', title: 'Owned marketable items' },
    avg24: { type: 'price', title: '24 hour average price', compare: true },
    avg7: { type: 'price', title: '7 day average price', compare: true },
    avg30: { type: 'price', title: '30 day average price', compare: true },
    p24ago: { type: 'price', title: 'Price 24 hours ago', compare: true },
    p30ago: { type: 'price', title: 'Price 30 days ago', compare: true },
    p90ago: { type: 'price', title: 'Price 90 days ago', compare: true },
    yearAgo: { type: 'price', title: 'Price a year ago', compare: true },
    withNameTag: { type: 'simple', title: 'Skins with a name tag' },
    withStickers: { type: 'simple', title: 'Skins with at least one sticker' },
    stickerValue: { type: 'price', title: 'Applied stickers value' },
    withPatches: { type: 'simple', title: 'Agent skins with at least one patch' },
    patchValue: { type: 'price', title: 'Applied patches value' },
  };

  function priceDiff(prc: ISummaryBase, key: keyof ISummaryBase) {
    const currentPrice = prc.totalValue;
    const comparedPrice = prc[key] as number;
    const percent = (currentPrice - comparedPrice) / comparedPrice * 100;
    return {
      difference: currentPrice - comparedPrice,
      percent: (percent > 0 ? '+' : '') + percent.toFixed(1) + '%',
      theme: percent < 0 ? style.loss : percent > 0 ? style.profit : style.samePrice,
    };
  }

  return (
    <>
      {
        summary &&
        <ScrollView>
          <Text style={global.title}>Inventory summary</Text>
          <Profile profile={summary.profile} nonClickable />

          <View style={style.column}>
            {
              Object.entries(summary).map(([ key, val ]) => {
                if (key in summaryKeyTitle) {
                  return (
                    <View>
                      <Text style={style.summaryTitle}>{ summaryKeyTitle[key].title }</Text>
                      <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center' } ]}>
                        <Text bold style={style.summaryValue}>
                          {
                            summaryKeyTitle[key].type === 'simple'
                              ? val as number
                              : helpers.price({ code: summary.currency.code, rate: 1 }, val as number)
                          }
                        </Text>
                        {
                          summaryKeyTitle[key].compare &&
                            <Text bold style={[ style.itemPriceInfo, priceDiff(summary, key as keyof ISummaryBase).theme ]}>
                              { helpers.price($store.currency, priceDiff(summary, key as keyof ISummaryBase).difference) }
                              &nbsp;/&nbsp;
                              { priceDiff(summary, key as keyof ISummaryBase).percent }
                            </Text>
                        }
                      </View>
                    </View>
                  );
                }
              })
            }
          </View>

          {
            Object.values(summary.games).map(game => (
              <>
                <View style={style.game}>
                  <Image source={{ uri: game.game.img }} style={style.gameIcon} />
                  <Text style={style.gameTitle}>{ game.game.name }</Text>
                </View>
                <View style={style.column}>
                  {
                    Object.entries(game).map(([ key, val ]) => {
                      if (key in summaryKeyTitle && typeof val !== 'undefined') {
                        return (
                          <View>
                            <Text style={style.summaryTitle}>{ summaryKeyTitle[key].title }</Text>
                            <View style={[ templates.row, { gap: helpers.resize(8), alignItems: 'center' } ]}>
                              <Text bold style={style.summaryValue}>
                                {
                                  summaryKeyTitle[key].type === 'simple'
                                    ? val as number
                                    : helpers.price({ code: summary.currency.code, rate: 1 }, val as number)
                                }
                              </Text>
                              {
                                summaryKeyTitle[key].compare &&
                                <Text bold style={[ style.itemPriceInfo, priceDiff(game, key as keyof ISummaryBase).theme ]}>
                                  { helpers.price($store.currency, priceDiff(game, key as keyof ISummaryBase).difference) }
                                  &nbsp;/&nbsp;
                                  { priceDiff(game, key as keyof ISummaryBase).percent }
                                </Text>
                              }
                            </View>
                          </View>
                        );
                      }
                    })
                  }
                </View>
              </>
            ))
          }
        </ScrollView>
        || <View>
          <Text>Inventory summary unavailable</Text>
        </View>
      }
    </>
  );
}
