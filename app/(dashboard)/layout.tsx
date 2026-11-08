'use client';

import { useState } from 'react';
import SideBar from '@/components/DashboardLayout/Sidebar';
import TopBar from '@/components/DashboardLayout/Topbar';
import HOCLayout from '../provider/hocLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <HOCLayout />
      <div className="h-screen overflow-hidden bg-[var(--color-faded-gray-10)]">
        <div className="fixed right-0 top-0 z-30 w-full max-w-full">
          <TopBar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>

        <div className="flex h-full">
          <div className="lg:w-60 lg:flex-shrink-0">
            <div className="fixed left-0 top-0 z-50 h-full  lg:relative">
              <SideBar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="relative mt-16 min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 xl:p-10">
              <div className="mx-auto w-full max-w-[1200px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
