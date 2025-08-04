import { NextResponse } from 'next/server';

import type { DashboardErrorResponse } from '@/types/dashboard';

/**
 * Utilitaires pour les API du dashboard
 */

/**
 * Crée une réponse d'erreur standardisée pour les routes dashboard
 */
export function createDashboardErrorResponse(
  error: string,
  message?: string,
  details?: unknown,
  status: number = 400
): NextResponse {
  const errorResponse: DashboardErrorResponse = {
    error,
  };

  if (message) {
    errorResponse.message = message;
  }

  if (details) {
    errorResponse.details = details;
  }

  return NextResponse.json(errorResponse, { status });
}

/**
 * Crée une réponse de succès pour les données dashboard
 */
export function createDashboardSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Headers de cache par défaut pour les réponses dashboard
 */
export const DEFAULT_DASHBOARD_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
} as const;

/**
 * Ajoute les headers de cache aux réponses dashboard
 */
export function withDashboardCacheHeaders(
  response: NextResponse
): NextResponse {
  Object.entries(DEFAULT_DASHBOARD_CACHE_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Crée une réponse dashboard avec cache
 */
export function createCachedDashboardResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response = createDashboardSuccessResponse(data, status);
  return withDashboardCacheHeaders(response);
}

/**
 * Valide le format de date YYYY-MM-DD
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
}

/**
 * Formate la date courante au format YYYY-MM-DD
 */
export function formatCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Parse les paramètres de recherche de manière sécurisée
 */
export function safeParseSearchParams(
  url: string
): Record<string, string | null> {
  try {
    const { searchParams } = new URL(url);
    return Object.fromEntries(searchParams.entries());
  } catch {
    return {};
  }
}

/**
 * Logge les événements dashboard de manière cohérente
 */
export function logDashboardEvent(
  event: 'metrics_request' | 'metrics_success' | 'metrics_error',
  actif?: string,
  date?: string,
  error?: string
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    event,
    actif,
    date,
    error,
  };

  if (event === 'metrics_error') {
    console.error('[Dashboard Event]', logData);
  } else {
    console.warn('[Dashboard Event]', logData);
  }
}

/**
 * Mesure le temps d'exécution d'une fonction
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.warn(`[Dashboard Perf] ${label}: ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `[Dashboard Perf] ${label} FAILED: ${duration.toFixed(2)}ms`,
      error
    );
    throw error;
  }
}

// Fonctions utilitaires pour compatibilité avec les composants existants

/**
 * Formate une valeur monétaire
 * @deprecated Utiliser Intl.NumberFormat directement
 */
export function formatCurrency(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Formate un pourcentage
 * @deprecated Utiliser Intl.NumberFormat directement
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Formate une valeur générique
 * @deprecated Utiliser des formateurs spécifiques
 */
export function formatValue(
  value: number | string,
  type = 'number',
  ..._args: unknown[]
): string {
  if (typeof value === 'string') return value;

  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    default:
      return new Intl.NumberFormat('fr-FR').format(value);
  }
}

/**
 * Récupère une valeur de manière sécurisée
 * @deprecated Utiliser l'opérateur ?? directement
 */
export function getSafeValue(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * Calcule le pourcentage de changement
 * @deprecated Créer des fonctions métier spécifiques
 */
export function calculateChangePercentage(
  current: number,
  previous: number,
  ..._args: unknown[]
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Récupère la classe CSS selon la performance
 * @deprecated Utiliser des composants stylés
 */
export function getPerformanceColorClass(
  value: number,
  ..._args: unknown[]
): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Récupère la classe CSS selon la comparaison
 * @deprecated Utiliser des composants stylés
 */
export function getComparisonColorClass(isPositive: boolean): string {
  return isPositive ? 'text-green-600' : 'text-red-600';
}

/**
 * Récupère l'icône de tendance
 * @deprecated Utiliser des composants d'icônes directement
 */
export function getTrendIcon(
  current: number,
  previous: number,
  ..._args: unknown[]
): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'up' : 'down';
}

/**
 * Calcule le taux de réalisation
 * @deprecated Créer des fonctions métier spécifiques
 */
export function calculateAchievementRate(
  actual: number,
  target: number
): number {
  if (target === 0) return 0;
  return (actual / target) * 100;
}

/**
 * Formate une date pour l'API
 * @deprecated Utiliser Date.toISOString().split('T')[0] directement
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}
