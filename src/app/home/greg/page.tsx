'use client';

import {
  ArrowRight,
  Bell,
  Clock,
  FileText,
  MapPin,
  Shield,
  UserSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { GregStats } from '@/components/greg/GregStats';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGregHealth, useGregStats } from '@/hooks/useGregApi';
import { useLoadingStore } from '@/stores/loading-store';

export default function GregPage() {
  const router = useRouter();
  const { showLoading } = useLoadingStore();

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
  const isLoading = healthLoading ?? statsLoading;
  const hasApiError = healthError ?? statsError;
  const healthIsHealthy =
    healthData?.data?.status &&
    ['healthy', 'ok'].includes(healthData.data.status.toLowerCase());

  // N'afficher les outils que si tout est OK
  const shouldShowTools = !isLoading && !hasApiError && healthIsHealthy;

  const breadcrumbs = [{ label: 'Accueil', href: '/home' }, { label: 'Greg' }];

  const tools = [
    {
      title: 'Espaces',
      description: 'Gérer les espaces de discussion et groupes',
      icon: MapPin,
      href: '/home/greg/spaces',
      gradient: 'from-blue-500 to-blue-600',
      available: true,
    },
    {
      title: 'Documents',
      description: 'Organiser et rechercher les documents',
      icon: FileText,
      href: '/home/greg/documents',
      gradient: 'from-green-500 to-green-600',
      available: true,
    },
    {
      title: 'Gestion des accès',
      description: 'Gérer les accès entre documents et espaces',
      icon: Shield,
      href: '/home/greg/access',
      gradient: 'from-red-500 to-red-600',
      available: true,
    },
    {
      icon: UserSquare,
      title: 'Utilisateurs',
      description: 'Gérez les utilisateurs du système',
      href: '/home/greg/users',
      gradient: 'from-purple-500 to-purple-600',
      available: true,
    },
    {
      icon: Clock,
      title: 'Shifts',
      description: 'Gérez les shifts et plannings de vos équipes',
      href: '/home/greg/shifts',
      gradient: 'from-pink-500 to-pink-600',
      available: true,
    },
    {
      title: 'Rappels',
      description: 'Gérez vos rappels et notifications',
      icon: Bell,
      href: '/home/greg/reminders',
      gradient: 'from-orange-500 to-orange-600',
      available: true,
    },
  ];

  const handleToolClick = (href: string, title: string) => {
    showLoading(
      `Chargement de ${title}...`,
      'Veuillez patienter pendant le chargement des données.'
    );
    router.push(href);
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">Greg</h1>
          <p className="text-muted-foreground">
            Système de gestion d&apos;espaces, de documents et de workflows pour
            la coordination d&apos;équipes.
          </p>
        </div>

        {/* Statistiques */}
        <GregStats />

        {/* Grille des outils - affichée seulement si APIs OK et pas de loading */}
        {shouldShowTools && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.title}
                  className="group hover:shadow-lg transition-all duration-200 hover:border-navy/20 relative cursor-pointer"
                  onClick={
                    tool.available
                      ? () => handleToolClick(tool.href, tool.title)
                      : undefined
                  }
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy/10 rounded-lg group-hover:bg-navy/20 transition-colors">
                        <Icon className="h-6 w-6 text-navy" />
                      </div>
                      <CardTitle className="text-navy group-hover:text-navy/80 transition-colors">
                        {tool.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-navy text-white hover:bg-navy/90 group-hover:bg-navy/80 transition-colors"
                      disabled={!tool.available}
                      variant={tool.available ? 'default' : 'outline'}
                      onClick={
                        tool.available
                          ? e => {
                              e.stopPropagation();
                              handleToolClick(tool.href, tool.title);
                            }
                          : undefined
                      }
                    >
                      {tool.available ? (
                        <div className="flex items-center justify-center gap-2">
                          Accéder
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      ) : (
                        <span>Bientôt disponible</span>
                      )}
                    </Button>
                  </CardContent>
                  {!tool.available && (
                    <div className="absolute inset-0 bg-background/50 rounded-lg cursor-not-allowed" />
                  )}
                </Card>
              );
            })}
          </div>
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
              <p className="text-sm text-muted-foreground">
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
