'use client';

import * as React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useLoadingStore } from '@/stores/loading-store';

import { AppSidebar } from './app-sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function DashboardLayout({
  children,
  breadcrumbs,
}: DashboardLayoutProps) {
  // Assure la fermeture du loader global à chaque (re)montage d'une page sous le layout
  const { hideLoading } = useLoadingStore();
  React.useEffect(() => {
    hideLoading();
  }, [hideLoading]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
