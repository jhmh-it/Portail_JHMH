/**
 * Home Dashboard Page - Unified tool system
 * Main dashboard with all available tools
 */

'use client';

import { Calculator, Users, BookOpen, Bot } from 'lucide-react';
import * as React from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ToolGrid, useToolNavigation, type Tool } from '@/components/tools';
import { useUser } from '@/hooks/useUser';

export default function DashboardPage() {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { handleToolClick, isToolLoading } = useToolNavigation();

  const breadcrumbs = [{ label: 'Accueil' }];

  const tools: Tool[] = [
    {
      id: 'accounting',
      title: 'Accounting Tool',
      description: 'Outil de gestion comptable et financière',
      icon: Calculator,
      href: '/home/accounting',
      available: true,
    },
    {
      id: 'exploitation',
      title: 'Exploitation',
      description: "Outils d'analyse et de gestion de l'exploitation",
      icon: BookOpen,
      href: '/home/exploitation',
      available: true,
    },
    {
      id: 'greg',
      title: 'Greg',
      description: "Système de gestion d'espaces, documents et workflows",
      icon: Bot,
      href: '/home/greg',
      available: true,
    },
    {
      id: 'rm-tool',
      title: 'RM Tool',
      description: 'Outil de gestion des relations clients',
      icon: Users,
      href: '/home/rm',
      available: false,
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="my-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          {isLoadingUser ? (
            <>
              <div className="mb-2 h-9 w-64 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-96 animate-pulse rounded bg-gray-200" />
            </>
          ) : (
            <>
              <h1 className="text-navy text-3xl font-bold tracking-tight">
                Bonjour, {user?.displayName?.split(' ')[0] ?? 'Utilisateur'} 👋
              </h1>
              <p className="text-muted-foreground">
                Accédez aux outils internes de l&apos;entreprise depuis votre
                portail d&apos;accueil.
              </p>
            </>
          )}
        </div>

        {/* Tools Section - Using unified ToolGrid */}
        <div className="mt-8 mb-6">
          <ToolGrid
            tools={tools}
            onToolClick={handleToolClick}
            isLoading={false}
            isToolLoading={isToolLoading}
            title="Outils disponibles"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
