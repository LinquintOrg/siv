import { Pressable, View } from 'react-native';
import navStyles from 'styles/components/nav';
import { Link, usePathname } from 'expo-router';
import { Icon } from 'react-native-elements';
import { colors, variables } from 'styles/global';
import { helpers } from 'utils/helpers';
import { navRoutes } from '@utils/objects';

const styles = navStyles;

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
          <Link asChild href={route.href} key={`nav-link-${idx}`}>
            <Pressable style={styles.navButton}>
              <Icon
                name={route.icon}
                type={route.type || 'material-community'}
                size={helpers.resize(variables.iconSize)}
                color={isRouteActive(route.href) ? colors.white : colors.primary}
                style={[ styles.navIcon, isRouteActive(route.href) ? styles.activeIcon : null ]}
              />
            </Pressable>
          </Link>
        ))
      }
    </View>
  );
}
