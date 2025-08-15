/**
 * Greg Page - Using unified tool system
 * Professional dashboard with consistent components
 */

'use client';

import {
  Bell,
  Clock,
  FileText,
  MapPin,
  Shield,
  UserSquare,
} from 'lucide-react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ToolGrid, useToolNavigation, type Tool } from '@/components/tools';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { GregStats } from './components/GregStats';
import { useGregHealth, useGregStats } from './hooks';

export default function GregPage() {
  const { handleToolClick, isToolLoading } = useToolNavigation();

  // Vérifier l'état des APIs
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
  } = useGregHealth();
  const {
    data: _statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGregStats();

  // Les outils ne sont disponibles que si :
  // 1. Pas de loading en cours
  // 2. Pas d'erreur
  // 3. L'API health renvoie un succès (particulièrement important)
  const isLoading = (healthLoading || statsLoading) ?? false;
  const hasApiError = healthError ?? statsError;
  const healthIsHealthy =
    healthData?.status &&
    ['healthy', 'ok'].includes(healthData.status.toLowerCase());

  // N'afficher les outils que si tout est OK
  // En développement, permettre l'affichage même si l'API externe n'est pas disponible
  const shouldShowTools =
    !isLoading &&
    !hasApiError &&
    (healthIsHealthy ?? process.env.NODE_ENV === 'development');

  const breadcrumbs = [{ label: 'Accueil', href: '/home' }, { label: 'Greg' }];

  const tools: Tool[] = [
    {
      id: 'spaces',
      title: 'Espaces',
      description: 'Gérer les espaces de discussion et groupes',
      icon: MapPin,
      href: '/home/greg/spaces',
      available: true,
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'Organiser et rechercher les documents',
      icon: FileText,
      href: '/home/greg/documents',
      available: true,
    },
    {
      id: 'access',
      title: 'Gestion des accès',
      description: 'Gérer les accès entre documents et espaces',
      icon: Shield,
      href: '/home/greg/access',
      available: true,
    },
    {
      id: 'users',
      icon: UserSquare,
      title: 'Utilisateurs',
      description: 'Gérez les utilisateurs du système',
      href: '/home/greg/users',
      available: true,
    },
    {
      id: 'shifts',
      icon: Clock,
      title: 'Shifts',
      description: 'Gérez les shifts et plannings de vos équipes',
      href: '/home/greg/shifts',
      available: true,
    },
    {
      id: 'reminders',
      title: 'Rappels',
      description: 'Gérez vos rappels et notifications',
      icon: Bell,
      href: '/home/greg/reminders',
      available: true,
    },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-navy text-3xl font-bold tracking-tight">Greg</h1>
          <p className="text-muted-foreground">
            Système de gestion d&apos;espaces, de documents et de workflows pour
            la coordination d&apos;équipes.
          </p>
        </div>

        {/* Statistiques */}
        {isLoading ? (
          // Laisser GregStats gérer son propre skeleton pour cohérence visuelle
          <GregStats />
        ) : (
          <GregStats />
        )}

        {/* Grille des outils - Using unified ToolGrid */}
        {shouldShowTools && (
          <ToolGrid
            tools={tools}
            onToolClick={handleToolClick}
            isLoading={false}
            isToolLoading={isToolLoading}
          />
        )}

        {/* Message informatif quand les APIs ne sont pas disponibles */}
        {!shouldShowTools && !isLoading && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Outils temporairement indisponibles</CardTitle>
              <CardDescription>
                Les outils Greg ne sont pas accessibles pour le moment en raison
                d&apos;un problème de connexion aux APIs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Veuillez vérifier la configuration de l&apos;API ou réessayer
                plus tard. Une fois la connexion rétablie, tous les outils
                seront de nouveau disponibles.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
