/**
 * Hook principal pour gérer toutes les données du dashboard
 * Combine la logique métier et les états
 */

import { useCallback, useEffect, useMemo } from 'react';

import { useSimpleActifs } from '@/app/home/exploitation/actifs/hooks/useActifs';

import {
  transformActifsToOptions,
  getFirstValidActif,
} from '../lib/actifs-utils';

import { useDashboardMetrics } from './useDashboardMetrics';
import { useDashboardState } from './useDashboardState';

/**
 * Interface de retour du hook useDashboardData
 */
export interface UseDashboardDataReturn {
  // États des filtres
  filters: ReturnType<typeof useDashboardState>['filters'];
  hasSearched: boolean;
  handleFiltersChange: ReturnType<
    typeof useDashboardState
  >['handleFiltersChange'];
  handleSearch: () => void;

  // Données des actifs
  actifs: ReturnType<typeof transformActifsToOptions>;
  isLoadingActifs: boolean;
  actifsError: Error | null;

  // Données des métriques
  metricsData: ReturnType<typeof useDashboardMetrics>['data'];
  isLoadingMetrics: boolean;
  metricsError: Error | null;
  refetchMetrics: () => void;
}

/**
 * Hook principal pour le dashboard - encapsule toute la logique métier
 */
export function useDashboardData(): UseDashboardDataReturn {
  const {
    filters,
    hasSearched,
    handleFiltersChange,
    handleSearch: originalHandleSearch,
    getAPIParams,
  } = useDashboardState();

  const {
    actifs: actifsData,
    isLoading: isLoadingActifs,
    error: actifsError,
  } = useSimpleActifs();

  // Transformer les données d'actifs en options pour le dashboard
  const actifs = useMemo(() => {
    return transformActifsToOptions(actifsData || []);
  }, [actifsData]);

  // Auto-sélectionner le premier actif disponible
  useEffect(() => {
    const firstActif = getFirstValidActif(actifs);
    if (firstActif && !filters.selectedActif) {
      handleFiltersChange({ selectedActif: firstActif.id });
    }
  }, [actifs, filters.selectedActif, handleFiltersChange]);

  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics(getAPIParams());

  // Gérer la recherche avec refetch si nécessaire
  const handleSearch = useCallback(() => {
    if (hasSearched) {
      refetchMetrics();
    }
    originalHandleSearch();
  }, [hasSearched, originalHandleSearch, refetchMetrics]);

  return {
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
    refetchMetrics,
  };
}
