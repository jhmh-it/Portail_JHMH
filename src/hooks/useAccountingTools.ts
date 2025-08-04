'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';

import { fetchAccountingTools } from '@/services/accounting.service';
import type { AccountingTool } from '@/types/accounting';

/**
 * Clés de requête pour TanStack Query
 */
export const accountingQueryKeys = {
  /** Clé pour la liste des outils comptables */
  tools: () => ['accounting', 'tools'] as const,
} as const;

/**
 * Interface de retour du hook useAccountingTools
 */
export interface UseAccountingToolsReturn {
  /** Liste des outils comptables */
  accountingTools: AccountingTool[];
  /** Indicateur de chargement */
  isLoading: boolean;
  /** Message d'erreur si présent */
  error: string | null;
  /** Fonction pour rafraîchir les données */
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les outils comptables
 * Utilise TanStack Query pour le cache et la gestion d'état
 */
export function useAccountingTools(): UseAccountingToolsReturn {
  const {
    data: accountingTools = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: accountingQueryKeys.tools(),
    queryFn: () => fetchAccountingTools({ revalidate: 300 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    accountingTools,
    isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    },
  };
}

/**
 * Fonction utilitaire pour précharger les outils comptables
 * À utiliser dans les Server Components ou lors de la navigation
 */
export async function prefetchAccountingTools(
  queryClient: QueryClient
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: accountingQueryKeys.tools(),
    queryFn: () => fetchAccountingTools({ revalidate: 300 }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fonction utilitaire pour invalider le cache des outils comptables
 * À utiliser après des modifications
 */
export async function invalidateAccountingTools(
  queryClient: QueryClient
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: accountingQueryKeys.tools(),
  });
}
