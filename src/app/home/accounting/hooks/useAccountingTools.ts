'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';
import { Calculator } from 'lucide-react';

import type { Tool } from '@/components/tools';

import { QUERY_KEYS, CACHE_CONFIG } from '../config';
import { fetchAccountingTools } from '../services';
import type { AccountingTool } from '../types/accounting';

/**
 * Adapter function to convert AccountingTool to unified Tool
 */
function adaptAccountingToolToTool(accountingTool: AccountingTool): Tool {
  return {
    id: accountingTool.id,
    title: accountingTool.title,
    description: accountingTool.description,
    icon: Calculator, // Default icon for accounting tools
    href: accountingTool.url,
    available: true, // All fetched tools are available
  };
}

/**
 * Interface de retour du hook useAccountingTools
 */
export interface UseAccountingToolsReturn {
  /** Liste des outils comptables au format unifié */
  accountingTools: Tool[];
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
    data: rawAccountingTools = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.ACCOUNTING_TOOLS(),
    queryFn: () =>
      fetchAccountingTools({
        revalidate: CACHE_CONFIG.ACCOUNTING_TOOLS.revalidate,
      }),
    staleTime: CACHE_CONFIG.ACCOUNTING_TOOLS.staleTime,
    gcTime: CACHE_CONFIG.ACCOUNTING_TOOLS.gcTime,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Convert AccountingTool[] to Tool[] for unified interface
  const accountingTools = rawAccountingTools.map(adaptAccountingToolToTool);

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
    queryKey: QUERY_KEYS.ACCOUNTING_TOOLS(),
    queryFn: () =>
      fetchAccountingTools({
        revalidate: CACHE_CONFIG.ACCOUNTING_TOOLS.revalidate,
      }),
    staleTime: CACHE_CONFIG.ACCOUNTING_TOOLS.staleTime,
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
    queryKey: QUERY_KEYS.ACCOUNTING_TOOLS(),
  });
}
