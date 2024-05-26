import { Pressable, View } from 'react-native';
import navStyles from 'styles/components/nav';
import { Link, usePathname } from 'expo-router';
import { Icon } from 'react-native-elements';
import { colors, variables } from 'styles/global';
import { helpers } from 'utils/helpers';

const styles = navStyles;

export default function Nav() {
  const routes: { title: string; icon: string; href: string; type?: string; }[] = [
    { title: 'Profiles', icon: 'account-multiple-outline', href: '/' },
    { title: 'Steam Market', icon: 'steam', type: 'font-awesome', href: '/market' },
    { title: 'Music Kits', icon: 'music-box-multiple-outline', href: '/kits' },
    { title: 'Settings', icon: 'cog-outline', href: '/settings' },
  ];

  const path = usePathname();

  const isRouteActive = (href: string) => {
    if (href === '/' && path === '/') {
      return true;
    }
    return path.startsWith(href);
  };

  return (
    <View style={styles.container}>
      {
        routes.map((route, idx) => (
          <Link asChild href={route.href} key={`nav-link-${idx}`}>
            <Pressable style={styles.navButton}>
              <Icon
                name={route.icon}
                type={route.type || 'material-community'}
                size={helpers.resize(variables.iconSize)}
                color={isRouteActive(route.href) ? colors.white : colors.text}
                style={[ styles.navIcon, isRouteActive(route.href) ? styles.activeIcon : null ]}
              />
            </Pressable>
          </Link>
        ))
      }
    </View>
  );
}
