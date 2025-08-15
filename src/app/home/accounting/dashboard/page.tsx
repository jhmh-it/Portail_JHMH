/**
 * Page du dashboard comptable refactorisée
 * Architecture feature-based suivant les principes Clean Code, DRY, KISS
 */

'use client';

import { DashboardLayout, PageHeader } from '@/components/dashboard';
import {
  LoadingVariants,
  ErrorVariants,
  NoDataVariants,
} from '@/components/states';

import { PAGE_CONFIGS, BREADCRUMBS } from '../config';

import { DashboardFilters, DashboardTabs } from './components';
import { useDashboardData } from './hooks';

/**
 * Page du dashboard comptable avec analyse des performances
 * Architecture feature-based avec composants standardisés et séparation des concerns
 */
export default function AccountingDashboardPage() {
  const {
    // États des filtres
    filters,
    hasSearched,
    handleFiltersChange,
    handleSearch,

    // Données des actifs
    actifs,
    isLoadingActifs,
    actifsError,

    // Données des métriques
    metricsData,
    isLoadingMetrics,
    metricsError,
  } = useDashboardData();

  /**
   * Rendu conditionnel du contenu principal basé sur l'état
   * Utilise les composants d'état standardisés
   */
  const renderMainContent = () => {
    // État: Pas encore de recherche effectuée
    if (!hasSearched) {
      return (
        <NoDataVariants.SearchEmpty onSearch={handleSearch} className="py-12" />
      );
    }

    // État: Chargement des métriques
    if (isLoadingMetrics) {
      return <LoadingVariants.DashboardSkeleton />;
    }

    // État: Erreur lors du chargement des métriques
    if (metricsError) {
      return (
        <ErrorVariants.Card
          error={metricsError}
          onRetry={handleSearch}
          title="Erreur de chargement des données"
        />
      );
    }

    // État: Pas de données disponibles
    if (!metricsData?.data?.attributes) {
      return <NoDataVariants.Criteria variant="card" />;
    }

    // État: Données disponibles - afficher les onglets
    return <DashboardTabs metrics={metricsData.data.attributes} />;
  };

  return (
    <DashboardLayout breadcrumbs={[...BREADCRUMBS.DASHBOARD]}>
      <div className="flex flex-col gap-6 py-6">
        {/* En-tête standardisé */}
        <PageHeader
          title={PAGE_CONFIGS.DASHBOARD.title}
          description={PAGE_CONFIGS.DASHBOARD.description}
        />

        {/* Section filtres */}
        <section>
          <DashboardFilters
            filters={filters}
            actifs={actifs}
            isLoadingActifs={isLoadingActifs}
            isLoadingMetrics={isLoadingMetrics}
            actifsError={actifsError}
            hasSearched={hasSearched}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
          />
        </section>

        {/* Contenu principal avec gestion d'états centralisée */}
        <main>{renderMainContent()}</main>
      </div>
    </DashboardLayout>
  );
}
