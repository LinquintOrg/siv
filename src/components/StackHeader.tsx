import type { NativeStackHeaderProps } from 'expo-router';
import { Appbar } from 'react-native-paper';

export function StackHeader({ navigation, back, options, route }: NativeStackHeaderProps) {
  const title = typeof options.headerTitle === 'string' ? options.headerTitle : options.title ?? route.name;
  const right = options.headerRight?.({ canGoBack: !!back, tintColor: undefined });

  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} />
      {right}
    </Appbar.Header>
  );
}
