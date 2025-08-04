'use client';

import { BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import * as React from 'react';

import {
  DashboardFilters,
  OverviewTab,
  ForecastsTab,
  AnalysisTab,
  HistoryTab,
} from '@/components/dashboard/accounting';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActifs } from '@/hooks/useActifs';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useDashboardState } from '@/hooks/useDashboardState';
import type { ActifListing } from '@/types/actifs';
import type { DashboardMetrics } from '@/types/dashboard';

/**
 * Page du dashboard comptable avec analyse des performances
 * Architecture modulaire avec composants réutilisables
 */
export default function AccountingDashboardPage() {
  const {
    filters,
    hasSearched,
    handleFiltersChange,
    handleSearch,
    getAPIParams,
  } = useDashboardState();

  const {
    actifs: actifsData,
    isLoading: isLoadingActifs,
    error: actifsError,
  } = useActifs();

  // Extract actifs from data and convert to dashboard format
  const actifs = React.useMemo(() => {
    if (!actifsData) return [];

    // Convert actifs listings to dashboard actifs format
    return actifsData.map((actif: ActifListing) => ({
      id: actif.code_site,
      label: actif.code_site,
      type: 'property' as const,
    }));
  }, [actifsData]);

  // Pré-sélectionner le premier actif lorsque les actifs sont chargés
  React.useEffect(() => {
    if (actifs && actifs.length > 0 && !filters.selectedActif) {
      handleFiltersChange({ selectedActif: actifs[0].id });
    }
  }, [actifs, filters.selectedActif, handleFiltersChange]);

  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics(getAPIParams());

  const breadcrumbs = [
    { label: 'Accueil', href: '/home' },
    { label: 'Accounting Tool', href: '/home/accounting' },
    { label: 'Dashboard' },
  ];

  const handleSearchWithRefetch = React.useCallback(() => {
    if (hasSearched) {
      refetchMetrics();
    }
    handleSearch();
  }, [hasSearched, handleSearch, refetchMetrics]);

  // États de chargement et d'erreur
  const renderContent = () => {
    if (!hasSearched) {
      return <EmptyState onSearch={handleSearchWithRefetch} />;
    }

    if (isLoadingMetrics) {
      return <LoadingState />;
    }

    if (metricsError) {
      return (
        <ErrorState error={metricsError} onRetry={handleSearchWithRefetch} />
      );
    }

    if (!metricsData?.data?.attributes) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune donnée disponible pour les critères sélectionnés.
          </AlertDescription>
        </Alert>
      );
    }

    return <DashboardTabs metrics={metricsData.data.attributes} />;
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 py-4">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Dashboard Accounting Tool
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances financières de vos actifs immobiliers avec
            des métriques détaillées et des comparaisons temporelles.
          </p>
        </div>

        {/* Filtres */}
        <DashboardFilters
          filters={filters}
          actifs={actifs}
          isLoadingActifs={isLoadingActifs}
          isLoadingMetrics={isLoadingMetrics}
          actifsError={actifsError}
          hasSearched={hasSearched}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearchWithRefetch}
        />

        {/* Contenu principal */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

/**
 * État vide - avant la première recherche
 */
function EmptyState({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-navy mb-2">
          Prêt à analyser vos données
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Sélectionnez un actif et une date de référence, puis cliquez sur
          &quot;Rechercher&quot; pour afficher les métriques comptables
          détaillées.
        </p>
        <Button
          onClick={onSearch}
          className="bg-navy text-white hover:bg-navy/90"
        >
          Commencer l&apos;analyse
        </Button>
      </div>
    </div>
  );
}

/**
 * État de chargement avec skeletons
 */
function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 8 }, (_, i) => `loading-skeleton-${i}`).map(
        skeletonId => (
          <Card key={skeletonId}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

/**
 * État d'erreur avec bouton retry
 */
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Erreur de chargement :</strong> {error.message}
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          <RefreshCw className="mr-2 h-3 w-3" />
          Réessayer
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Onglets du dashboard avec tous les composants
 */
function DashboardTabs({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 gap-3 mb-6 bg-gray-100 p-1">
          <TabsTrigger
            value="overview"
            style={{
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
          >
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            style={{
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
          >
            Analyse
          </TabsTrigger>
          <TabsTrigger
            value="forecasts"
            style={{
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
          >
            Prévisions
          </TabsTrigger>
          <TabsTrigger
            value="history"
            style={{
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
          >
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <AnalysisTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <ForecastsTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryTab metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
