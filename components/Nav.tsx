import { View } from 'react-native';
import { usePathname } from 'expo-router';
import styles from 'styles/components/nav';
import { navRoutes } from '@utils/objects';
import NavItem from './NavItem';

export default function Nav() {
  const path = usePathname();

  const isRouteActive = (href: string) => {
    if (href === '/') {
      return path === '/';
    }
    return path.startsWith(href);
  };

  return (
    <View style={styles.container}>
      {
        navRoutes.map((route, idx) => (
          <NavItem
            key={`nav-link-${idx}`}
            route={route}
            isActive={isRouteActive(route.href)}
          />
        ))
      }
    </View>
  );
}
