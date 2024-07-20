import Profile from '@/Profile';
import Text from '@/Text';
import { global } from '@styles/global';
import { helpers } from '@utils/helpers';
import { useMemo } from 'react';
import { ScrollView, View, Image } from 'react-native';
import useStore from 'store';
import { ISummary } from 'types';
import style from '@styles/pages/summary';

export default function InventorySummaryPage() {
  const $store = useStore();

  const summary = useMemo(() => {
    if (!$store.summary?.games.length) {
      return null;
    }
    return $store.summary;
  }, [ $store ]);

  const summaryKeyTitle: { [key: string]: { type: 'simple' | 'price'; title: string } } = {
    totalValue: { type: 'price', title: 'Total value of selected games' },
    itemCount: { type: 'simple', title: 'Owned items' },
    sellableItems: { type: 'simple', title: 'Owned marketable items' },
    avg24: { type: 'price', title: '24 hour average price' },
    avg7: { type: 'price', title: '7 day average price' },
    avg30: { type: 'price', title: '30 day average price' },
    p24ago: { type: 'price', title: 'Price 24 hours ago' },
    p30ago: { type: 'price', title: 'Price 30 days ago' },
    p90ago: { type: 'price', title: 'Price 90 days ago' },
    yearAgo: { type: 'price', title: 'Price a year ago' },
    withNameTag: { type: 'simple', title: 'Skins with a name tag' },
    withStickers: { type: 'simple', title: 'Skins with at least one sticker' },
    stickerValue: { type: 'price', title: 'Applied stickers value' },
    withPatches: { type: 'simple', title: 'Agent skins with at least one patch' },
    patchValue: { type: 'price', title: 'Applied patches value' },
  };

  return (
    <>
      {
        summary &&
        <ScrollView>
          <Text style={global.title}>Inventory summary</Text>
          <Profile profile={summary.profile} nonClickable />

          <View style={style.column}>
            {
              Object.keys(summary).map(key => {
                if (key in summaryKeyTitle) {
                  return (
                    <View>
                      <Text style={style.summaryTitle}>{ summaryKeyTitle[key].title }</Text>
                      <Text bold style={style.summaryValue}>
                        {
                          summaryKeyTitle[key].type === 'simple'
                            ? summary[key as keyof ISummary] as number
                            : helpers.price({ code: summary.currency.code, rate: 1 }, summary[key as keyof ISummary] as number)
                        }
                      </Text>
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
                      if (key in summaryKeyTitle) {
                        return (
                          <View>
                            <Text style={style.summaryTitle}>{ summaryKeyTitle[key].title }</Text>
                            <Text bold style={style.summaryValue}>
                              {
                                summaryKeyTitle[key].type === 'simple'
                                  ? val as number
                                  : helpers.price({ code: summary.currency.code, rate: 1 }, val as number)
                              }
                            </Text>
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
