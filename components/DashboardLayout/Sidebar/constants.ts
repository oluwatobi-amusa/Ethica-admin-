import type { LucideIcon } from 'lucide-react';
import { Activity, Banknote, CircleGauge, Settings2, UsersRound } from 'lucide-react';

export const LINK_ICON_STYLE = { height: '20px', width: '20px' };

export type SideBarLink = {
  icon: LucideIcon;
  name: string;
  url: string;
};

export type SideBarLinks = SideBarLink[];

export const LINKS: SideBarLinks = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: CircleGauge
  },
  {
    name: 'Customers',
    url: '/customers',
    icon: UsersRound
  },
  {
    name: 'Transactions',
    url: '/transactions',
    icon: Banknote
  },
  {
    name: 'Service activity',
    url: '/service-activity',
    icon: Activity
  },
  {
    name: 'Admin settings',
    url: '/admin-settings',
    icon: Settings2
  }
];
