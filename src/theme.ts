import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from 'expo-router';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Material 3 tonal-spot schemes generated from the brand seed #091b53
// with @material/material-color-utilities.
const light = {
  primary: '#4e5b92',
  onPrimary: '#ffffff',
  primaryContainer: '#dde1ff',
  onPrimaryContainer: '#364479',
  secondary: '#5a5d72',
  onSecondary: '#ffffff',
  secondaryContainer: '#dee1f9',
  onSecondaryContainer: '#424659',
  tertiary: '#75546f',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffd7f4',
  onTertiaryContainer: '#5c3d56',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#fbf8ff',
  onBackground: '#1a1b21',
  surface: '#fbf8ff',
  onSurface: '#1a1b21',
  surfaceVariant: '#e2e1ec',
  onSurfaceVariant: '#45464f',
  outline: '#767680',
  outlineVariant: '#c6c5d0',
  inverseSurface: '#2f3036',
  inverseOnSurface: '#f2f0f7',
  inversePrimary: '#b7c4ff',
  elevation: {
    level0: 'transparent',
    level1: '#f4f2fa',
    level2: '#efedf4',
    level3: '#e9e7ef',
    level4: '#e6e4ec',
    level5: '#e3e1e9',
  },
};

const dark = {
  primary: '#b7c4ff',
  onPrimary: '#1e2d61',
  primaryContainer: '#364479',
  onPrimaryContainer: '#dde1ff',
  secondary: '#c2c5dd',
  onSecondary: '#2c3042',
  secondaryContainer: '#424659',
  onSecondaryContainer: '#dee1f9',
  tertiary: '#e4bad9',
  onTertiary: '#43273f',
  tertiaryContainer: '#5c3d56',
  onTertiaryContainer: '#ffd7f4',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  background: '#121318',
  onBackground: '#e3e1e9',
  surface: '#121318',
  onSurface: '#e3e1e9',
  surfaceVariant: '#45464f',
  onSurfaceVariant: '#c6c5d0',
  outline: '#90909a',
  outlineVariant: '#45464f',
  inverseSurface: '#e3e1e9',
  inverseOnSurface: '#2f3036',
  inversePrimary: '#4e5b92',
  elevation: {
    level0: 'transparent',
    level1: '#1a1b21',
    level2: '#1f1f25',
    level3: '#292a2f',
    level4: '#2e2f34',
    level5: '#34343a',
  },
};

export interface AppTheme extends MD3Theme {
  colors: MD3Theme['colors'] & {
    positive: string;
    negative: string;
  };
}

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, ...light, positive: '#2e7d32', negative: '#ba1a1a' },
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, ...dark, positive: '#81c784', negative: '#ffb4ab' },
};

export function navigationTheme(theme: AppTheme, isDark: boolean) {
  const base = isDark ? NavDarkTheme : NavLightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outlineVariant,
      notification: theme.colors.error,
    },
  };
}
