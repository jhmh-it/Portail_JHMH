'use client';

import { Search, Bell } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function Header({ breadcrumbs = [] }: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map(breadcrumb => (
                <React.Fragment key={`breadcrumb-${breadcrumb.label}`}>
                  <BreadcrumbItem className="hidden md:block">
                    {breadcrumb.href ? (
                      <BreadcrumbLink href={breadcrumb.href}>
                        {breadcrumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <Separator orientation="vertical" className="mx-2 h-4" />
        </>
      )}

      {/* Search Bar */}
      <div className="flex flex-1 items-center gap-2 px-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="rounded-lg border p-3 text-sm mb-2">
                <div className="font-medium">Nouvel utilisateur</div>
                <div className="text-muted-foreground">
                  Un nouvel utilisateur s&apos;est inscrit
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Il y a 5 minutes
                </div>
              </div>
              <div className="rounded-lg border p-3 text-sm mb-2">
                <div className="font-medium">Rapport mensuel</div>
                <div className="text-muted-foreground">
                  Le rapport mensuel est disponible
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Il y a 1 heure
                </div>
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium">Maintenance planifiée</div>
                <div className="text-muted-foreground">
                  Maintenance prévue demain à 2h00
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Il y a 2 heures
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
