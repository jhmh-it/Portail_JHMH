import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  FileText,
  Link,
  MapPin,
  RefreshCw,
  Tag,
  Users,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useGregHealth, useGregStats } from '@/hooks/useGregApi';

// Fonction utilitaire pour formater de manière sûre les timestamps
function formatTimestampSafely(timestamp: string | undefined): string {
  if (!timestamp) {
    return 'Non disponible';
  }

  try {
    const date = new Date(timestamp);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return 'Format invalide';
    }

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr,
    });
  } catch (error) {
    console.warn('Erreur lors du formatage du timestamp:', timestamp, error);
    return 'Format invalide';
  }
}

export function GregStats() {
  const {
    data: healthData,
    isLoading: healthLoading,
    isFetching: healthFetching,
    error: healthError,
    refetch: refetchHealth,
  } = useGregHealth();

  const {
    data: _statsData,
    isLoading: statsLoading,
    isFetching: statsFetching,
    error: statsError,
    refetch: refetchStats,
  } = useGregStats();

  const isLoading = healthLoading ?? statsLoading;
  const isFetching = healthFetching ?? statsFetching;
  const hasError = healthError ?? statsError;

  const getStatusIcon = (status?: string) => {
    if (!status) return <AlertTriangle className="h-4 w-4 text-amber-500" />;

    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'down':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Inconnu</Badge>;

    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            En ligne
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            Dégradé
          </Badge>
        );
      case 'down':
      case 'error':
        return <Badge variant="destructive">Hors ligne</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const statsItems = [
    {
      title: 'Espaces',
      value: _statsData?.data?.total_spaces ?? 0,
      icon: MapPin,
      description: 'Espaces configurés',
      color: 'text-blue-600',
    },
    {
      title: 'Documents',
      value: _statsData?.data?.total_documents ?? 0,
      icon: FileText,
      description: 'Documents gérés',
      color: 'text-green-600',
    },
    {
      title: 'Utilisateurs',
      value: _statsData?.data?.total_users ?? 0,
      icon: Users,
      description: 'Utilisateurs actifs',
      color: 'text-purple-600',
    },
    {
      title: 'Rappels',
      value: _statsData?.data?.total_reminders ?? 0,
      icon: Bell,
      description: 'Rappels configurés',
      color: 'text-orange-600',
    },
    {
      title: 'Équipes',
      value: _statsData?.data?.total_shifts ?? 0,
      icon: Calendar,
      description: 'Shifts planifiés',
      color: 'text-indigo-600',
    },
    {
      title: 'Catégories',
      value: _statsData?.data?.total_categories ?? 0,
      icon: Tag,
      description: 'Catégories définies',
      color: 'text-pink-600',
    },
    {
      title: 'Accès',
      value: _statsData?.data?.total_accesses ?? 0,
      icon: Link,
      description: 'Relations d&apos;accès',
      color: 'text-teal-600',
    },
  ];

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchHealth(), refetchStats()]);
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            État du Système Greg
          </CardTitle>
          <CardDescription>
            Chargement des informations en temps réel...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 rounded-lg border"
              >
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-4 border-t">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            Erreur de Connexion
          </CardTitle>
          <CardDescription>
            Impossible de récupérer les informations du système Greg.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthError && (
              <p className="text-sm text-red-600">
                <strong>Santé :</strong> {healthError.message}
              </p>
            )}
            {statsError && (
              <p className="text-sm text-red-600">
                <strong>Statistiques :</strong> {statsError.message}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              {isFetching ? 'Actualisation...' : 'Réessayer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(healthData?.data?.status)}
            <CardTitle>État du Système Greg</CardTitle>
            {healthData?.data && getStatusBadge(healthData.data.status)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            {isFetching ? 'Actualisation...' : 'Actualiser'}
          </Button>
        </div>
        <CardDescription>
          Vue d&apos;ensemble en temps réel du système de gestion Greg
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Statistiques principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-6">
          {statsItems.map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded ${item.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informations système */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
          {healthData && (
            <>
              <div className="flex items-center gap-1">
                <span>Service :</span>
                <span className="font-medium">{healthData?.data?.service}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Version :</span>
                <span className="font-medium">{healthData?.data?.version}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Dernière vérification :</span>
                <span className="font-medium">
                  {formatTimestampSafely(healthData?.data?.timestamp)}
                </span>
              </div>
            </>
          )}
          {_statsData && (
            <div className="flex items-center gap-1">
              <span>Données mises à jour :</span>
              <span className="font-medium">
                {formatTimestampSafely(_statsData?.data?.timestamp)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
