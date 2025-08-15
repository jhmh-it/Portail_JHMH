/**
 * Configuration centralisée pour la feature accounting
 * Évite la duplication et centralise les paramètres
 */

/**
 * Configuration des pages
 */
export const PAGE_CONFIGS = {
  ACCOUNTING: {
    title: 'Accounting Tools',
    description:
      'Outils de gestion comptable et financière pour optimiser vos processus métier.',
    errorDescription: 'Outils de gestion comptable et financière.',
  },
  DASHBOARD: {
    title: 'Dashboard Accounting',
    description:
      'Analysez les performances financières de vos actifs immobiliers avec des métriques détaillées et des comparaisons temporelles.',
  },
} as const;

/**
 * Configuration des breadcrumbs
 */
export const BREADCRUMBS = {
  ACCOUNTING: [
    { label: 'Accueil', href: '/home' },
    { label: 'Accounting Tools' },
  ],
  DASHBOARD: [
    { label: 'Accueil', href: '/home' },
    { label: 'Accounting Tools', href: '/home/accounting' },
    { label: 'Dashboard' },
  ],
} as const;

/**
 * Configuration des API
 */
export const API_ENDPOINTS = {
  ACCOUNTING_TOOLS: '/api/accounting-tools',
  DASHBOARD_METRICS: '/api/dashboard/metrics', // TODO: À créer
} as const;

/**
 * Configuration du cache
 */
export const CACHE_CONFIG = {
  ACCOUNTING_TOOLS: {
    revalidate: 300, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  DASHBOARD_METRICS: {
    revalidate: 60, // 1 minute
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
} as const;

/**
 * Configuration des Query Keys pour TanStack Query
 */
export const QUERY_KEYS = {
  ACCOUNTING_TOOLS: () => ['accounting', 'tools'] as const,
  DASHBOARD_METRICS: (params: { date: string; actif: string }) =>
    ['accounting', 'dashboard', 'metrics', params] as const,
} as const;
