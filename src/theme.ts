import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from 'expo-router';
import { createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

/**
 * Quiet palette, shared with the linquint.dev web app.
 * Surfaces and lines go from the background outwards, text goes faintest to brightest.
 */
const dark = {
  bg: '#0A0A0B',
  sheet: '#0F0F11',
  raised: '#111113',
  hover: '#141416',
  line: '#161618',
  line2: '#1C1C1F',
  line3: '#2A2A2E',

  faint: '#4A4A4F',
  dim: '#6B6B70',
  muted: '#8A8A8F',
  soft: '#B4B4B9',
  text: '#EDEDED',
  /** Brightest text: white on dark, black on light */
  bright: '#FFFFFF',

  accent: '#6EA8FF',
  danger: '#E5806B',
  gold: '#F3C969',

  /** One-off surfaces and lines */
  divider: '#1A1A1D',
  pressed: '#121214',
  stage: '#17171A',
  toast: '#161618',
  invalid: '#6B3329',
  ripple: '#FFFFFF14',
  backdrop: 'rgba(5,5,6,0.84)',
};

export type Palette = typeof dark;
export type ColorScheme = 'dark' | 'light';
export type ThemePreference = 'system' | ColorScheme;

const light: Palette = {
  bg: '#FAFAFA',
  sheet: '#FFFFFF',
  raised: '#F4F4F5',
  hover: '#EFEFF1',
  line: '#ECECEE',
  line2: '#E4E4E7',
  line3: '#D4D4D8',

  faint: '#A1A1A6',
  dim: '#737379',
  muted: '#5F5F65',
  soft: '#3F3F45',
  text: '#18181B',
  bright: '#000000',

  accent: '#2563EB',
  danger: '#C4553D',
  gold: '#A87A0B',

  divider: '#EEEEF0',
  pressed: '#F1F1F3',
  stage: '#EDEDEF',
  toast: '#FFFFFF',
  invalid: '#D98B79',
  ripple: '#0000000F',
  backdrop: 'rgba(24,24,27,0.36)',
};

export const palettes: Record<ColorScheme, Palette> = { dark, light };

/** Provided in the root layout from the theme setting. */
export const PaletteContext = createContext<Palette>(dark);

/** The palette of the current theme. */
export function useQ(): Palette {
  return useContext(PaletteContext);
}

/**
 * Like StyleSheet.create, but built from the current palette.
 * Returns a hook; each theme's styles are created once and reused.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: (q: Palette) => T & StyleSheet.NamedStyles<any>) {
  const cache = new Map<Palette, T>();
  return function useStyles(): T {
    const q = useQ();
    let styles = cache.get(q);
    if (!styles) {
      styles = StyleSheet.create(factory(q));
      cache.set(q, styles);
    }
    return styles;
  };
}

/** Loaded in the root layout; React Native picks a weight by family name. */
export const fonts = {
  extralight: 'Geist_200ExtraLight',
  light: 'Geist_300Light',
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
} as const;

export type FontWeight = Exclude<keyof typeof fonts, 'mono'>;

/** Screen side padding, matching the web's mobile gutter. */
export const GUTTER = 20;

/** Widest the content column gets on tablets and in landscape, like the web's pages. */
export const MAX_CONTENT_WIDTH = 880;

export interface AppTheme extends MD3Theme {
  colors: MD3Theme['colors'] & {
    positive: string;
    negative: string;
  };
}

// Paper is only used for a few primitives now; map it onto the Quiet palette so they blend in.
function paperTheme(scheme: ColorScheme): AppTheme {
  const q = palettes[scheme];
  const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    roundness: 3,
    colors: {
      ...base.colors,
      primary: q.accent,
      onPrimary: q.bg,
      background: q.bg,
      onBackground: q.text,
      surface: q.bg,
      onSurface: q.text,
      surfaceVariant: q.raised,
      onSurfaceVariant: q.muted,
      outline: q.line3,
      outlineVariant: q.line2,
      error: q.danger,
      positive: q.accent,
      negative: q.danger,
    },
  };
}

function navigationTheme(scheme: ColorScheme) {
  const q = palettes[scheme];
  const base = scheme === 'dark' ? NavDarkTheme : NavLightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: q.accent,
      background: q.bg,
      card: q.bg,
      text: q.text,
      border: q.line,
      notification: q.danger,
    },
  };
}

export const paperThemes: Record<ColorScheme, AppTheme> = { dark: paperTheme('dark'), light: paperTheme('light') };
export const navigationThemes = { dark: navigationTheme('dark'), light: navigationTheme('light') };
