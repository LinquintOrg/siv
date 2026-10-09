import { DarkTheme as NavDarkTheme } from 'expo-router';
import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

/**
 * Quiet palette, shared with the linquint.dev web app.
 * Surfaces and lines go darkest to lightest, text goes faintest to brightest.
 */
export const q = {
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
  white: '#FFFFFF',

  accent: '#6EA8FF',
  danger: '#E5806B',
  gold: '#F3C969',
  backdrop: 'rgba(5,5,6,0.84)',
} as const;

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

export interface AppTheme extends MD3Theme {
  colors: MD3Theme['colors'] & {
    positive: string;
    negative: string;
  };
}

// Paper is only used for a few primitives now; map it onto the Quiet palette so they blend in.
export const theme: AppTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
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

export const navigationTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: q.accent,
    background: q.bg,
    card: q.bg,
    text: q.text,
    border: q.line,
    notification: q.danger,
  },
};
