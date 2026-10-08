import { useTheme } from 'react-native-paper';

import type { AppTheme } from '@/theme';

export const useAppTheme = () => useTheme<AppTheme>();
