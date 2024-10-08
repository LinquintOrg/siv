import { colors, variables } from '@styles/global';
import { Link } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from 'react-native-elements';
import styles from 'styles/components/nav';
import Text from './Text';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { helpers } from '@utils/helpers';

interface NavItemProps {
  route: {
    title: string;
    icon: string;
    href: string;
    type?: string;
  };
  isActive: boolean;
}

export default function NavItem({ route, isActive }: NavItemProps) {
  const scale = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    scale.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [ isActive, scale ]);

  const bgWidth = useMemo(
    () => helpers.resize(isActive ? 64 : 0),
    [ isActive ],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(bgWidth, { duration: 250 }),
      backgroundColor: withTiming(isActive ? `${colors.primary}44` : '#fff0'),
    };
  });

  return (
    <Link asChild href={route.href}>
      <Pressable style={styles.navButton}>
        <View style={styles.navIconContainer}>
          <Animated.View style={[ styles.navIconBackground, animatedStyle ]} />

          <View style={styles.navIcon}>
            <Icon
              name={route.icon}
              type={route.type || 'material-community'}
              size={variables.iconSize}
              color={colors.primary}
            />
          </View>
        </View>
        <Text style={styles.navText}>{route.title}</Text>
      </Pressable>
    </Link>
  );
}
