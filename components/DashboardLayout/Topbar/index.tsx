'use client';

import { FormEvent, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search } from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const title = pathname.split('/').filter(Boolean).slice(0, 1)[0] || 'dashboard';
  const pageTitle = pathname.startsWith('/customers/')
    ? 'Customer profile'
    : title.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    setMobileSearchOpen(false);
    router.push(value ? `/customers?search=${encodeURIComponent(value)}` : '/customers');
  };

  return (
    <nav
      className="relative flex h-16 items-center justify-between gap-3 border-b border-[var(--color-outline)] bg-white px-3 sm:px-6 lg:ml-60"
      aria-label="Top navigation"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex h-10 w-10 items-center justify-center rounded-[8px] text-[var(--portal-secondary)] hover:bg-[var(--color-faded-gray-10)] lg:hidden"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--color-black)]">{pageTitle}</p>
          <p className="hidden text-xs text-[var(--portal-secondary)] sm:block">
            Ethica mobile banking operations
          </p>
        </div>
      </div>
      <form className="hidden w-full max-w-[390px] md:block" onSubmit={submitSearch} role="search">
        <label className="relative block">
          <span className="sr-only">Search customers</span>
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search customers, phone or ID"
            className="h-10 w-full rounded-[8px] border border-[var(--color-outline)] bg-[var(--color-faded-gray-10)] pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
      </form>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Search customers"
          onClick={() => setMobileSearchOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--portal-secondary)] hover:bg-[var(--color-faded-gray-10)] md:hidden"
        >
          <Search size={18} aria-hidden="true" />
        </button>
      </div>
      {mobileSearchOpen && (
        <form
          className="absolute left-3 right-3 top-[58px] z-50 rounded-[8px] border border-[var(--color-outline)] bg-white p-2 shadow-lg md:hidden"
          onSubmit={submitSearch}
          role="search"
        >
          <label className="relative block">
            <span className="sr-only">Search customers</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)]"
            />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone or customer ID"
              className="h-11 w-full rounded-[8px] border border-[var(--color-outline)] pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </label>
        </form>
      )}
    </nav>
  );
};

export default TopBar;
