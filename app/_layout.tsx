import Nav from 'components/Nav';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { Dimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { variables } from 'styles/global';
import { helpers } from 'utils/helpers';

export default function Layout() {
  const { bottom } = useSafeAreaInsets();
  const height = Dimensions.get('window').height;

  const viewHeight = useMemo(
    () => Math.floor(height - bottom - helpers.resize(variables.iconSize + 16 * 2 + 8 * 2)),
    [ height, bottom ],
  );

  return (
    <SafeAreaView style={{ height: '100%' }}>
      <StatusBar style='auto' />
      <View style={{ maxHeight: viewHeight, minHeight: viewHeight }}>
        <Slot />
      </View>
      <Nav />
    </SafeAreaView>
  );
}
