import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { router, usePathname } from 'expo-router';
import { navRoutes } from '@utils/objects';

export function useBackButtonHandler() {
  const path = usePathname();

  useEffect(() => {
    const backAction = () => {
      if (!path.startsWith('/inventory/item') && !path.startsWith('/inventory/summary') && path.startsWith('/inventory/')) {
        router.replace('/');
        return true;
      } else if (!navRoutes.find(r => r.href === path) && router.canGoBack()) {
        router.back();
        return true;
      } else {
        Alert.alert('Close application', 'Are you sure you want to exit the application?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [ path ]);
}
