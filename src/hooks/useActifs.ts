'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';

import { fetchActifsListings } from '@/services/actifs.service';
import type { ActifListing, ActifsListingsFilters } from '@/types/actifs';

/**
 * Clés de requête pour TanStack Query
 */
export const actifsQueryKeys = {
  /** Clé pour la liste des actifs avec filtres */
  listings: (filters?: ActifsListingsFilters) =>
    ['actifs', 'listings', filters] as const,
  /** Clé pour tous les actifs */
  all: () => ['actifs'] as const,
} as const;

/**
 * Interface de retour du hook useActifs
 */
export interface UseActifsReturn {
  /** Liste des actifs */
  actifs: ActifListing[];
  /** Indicateur de chargement */
  isLoading: boolean;
  /** Message d'erreur si présent */
  error: Error | null;
  /** Fonction pour rafraîchir les données */
  refetch: () => Promise<void>;
  /** Indicateur de succès */
  isSuccess: boolean;
  /** Indicateur d'erreur */
  isError: boolean;
}

/**
 * Hook pour récupérer les actifs listings
 * Utilise TanStack Query pour le cache et la gestion d'état
 */
export function useActifs(filters?: ActifsListingsFilters): UseActifsReturn {
  const {
    data: actifs = [],
    isLoading,
    error,
    refetch,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: actifsQueryKeys.listings(filters),
    queryFn: () => fetchActifsListings(filters, { revalidate: 900 }),
    staleTime: 15 * 60 * 1000, // 15 minutes (les actifs changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    actifs,
    isLoading,
    error,
    refetch: async () => {
      await refetch();
    },
    isSuccess,
    isError,
  };
}

/**
 * Fonction utilitaire pour précharger les actifs
 * À utiliser dans les Server Components ou lors de la navigation
 */
export async function prefetchActifs(
  queryClient: QueryClient,
  filters?: ActifsListingsFilters
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: actifsQueryKeys.listings(filters),
    queryFn: () => fetchActifsListings(filters, { revalidate: 900 }),
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Fonction utilitaire pour invalider le cache des actifs
 * À utiliser après des modifications
 */
export async function invalidateActifs(
  queryClient: QueryClient
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: actifsQueryKeys.all(),
  });
}

// Types historiques pour compatibilité (DEPRECATED)
/** @deprecated Utiliser ActifListing à la place */
export type JhmhActif = ActifListing;
