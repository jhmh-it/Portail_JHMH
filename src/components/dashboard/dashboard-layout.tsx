'use client';

import * as React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

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
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
