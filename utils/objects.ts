import { ISummaryBase } from 'types';

export const navRoutes: { title: string; icon: string; href: string; type?: string; }[] = [
  { title: 'Profiles', icon: 'account-multiple-outline', href: '/' },
  { title: 'Steam Market', icon: 'steam', type: 'font-awesome', href: '/market' },
  { title: 'Music Kits', icon: 'music-box-multiple-outline', href: '/kits' },
  { title: 'Settings', icon: 'cog-outline', href: '/settings' },
];

export const emptyBaseSummary: ISummaryBase = {
  totalValue: 0,
  itemCount: 0,
  sellableItems: 0,
  avg24: 0,
  avg7: 0,
  avg30: 0,
  p24ago: 0,
  p30ago: 0,
  p90ago: 0,
  yearAgo: 0,
};
