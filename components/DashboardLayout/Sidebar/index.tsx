'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { LINKS, LINK_ICON_STYLE } from './constants';
import { cn } from '@/lib/utils';
import { DASHBOARD_ROUTE } from '@/config';
import TopBarDropdownMenu from '../Topbar/DropDown';
import { X } from 'lucide-react';

interface SidebarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const Sidebar: FC<SidebarProps> = ({ isSidebarOpen = true, onToggleSidebar }) => {
  const pathname = usePathname();

  const checkIfLinkIsActive = (link: string) => {
    if (DASHBOARD_ROUTE.includes(link)) {
      return pathname === link;
    }

    return pathname.startsWith(link);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onToggleSidebar} />
      )}

      <div
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-[var(--color-outline)] bg-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header with Logo */}
        <div className="z-50 flex items-center justify-between border-b border-[var(--color-outline)] px-5 py-5">
          <Image
            src="/ethica-logo.png"
            alt="Ethica"
            width={132}
            height={40}
            priority
            className="h-10 w-[132px] object-contain"
          />
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-[8px] hover:bg-[var(--color-faded-gray-10)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {LINKS.map((link) => {
              const SideBarIcon = link.icon;
              const displayName = link.name;
              const isActive = checkIfLinkIsActive(link.url);

              return (
                <Link
                  href={link.url}
                  key={link.name}
                  onClick={() => {
                    // Close sidebar on mobile when link is clicked
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      onToggleSidebar?.();
                    }
                  }}
                >
                  <div
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-[8px] px-3 py-2 text-sm font-semibold text-[var(--portal-secondary)] transition-colors hover:bg-[var(--color-faded-gray-10)]',
                      isActive && 'bg-[var(--color-faded-primary-10)] text-[var(--color-primary)]'
                    )}
                  >
                    <SideBarIcon
                      style={LINK_ICON_STYLE}
                      className={cn('shrink-0', isActive && 'text-[var(--color-primary)]')}
                    />
                    <span className="truncate">{displayName}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-[var(--color-outline)] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-faded-primary-10)] text-xs font-bold text-[var(--color-primary)]">
              AO
            </div>
            <div className="flex-1 min-w-0">
              <TopBarDropdownMenu />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
