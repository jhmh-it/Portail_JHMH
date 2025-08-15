import { NextResponse } from 'next/server';

import type { DashboardErrorResponse } from '../types/dashboard';

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
 * Crée un timer pour mesurer le temps d'exécution
 */
export function createExecutionTimer(): {
  start: () => void;
  end: () => number;
} {
  let startTime: number;

  return {
    start: () => {
      startTime = Date.now();
    },
    end: () => {
      return Date.now() - startTime;
    },
  };
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

/**
 * FONCTIONS UTILITAIRES SIMPLIFIÉES
 * Remplacent les fonctions dépréciées avec une approche plus propre
 */

/**
 * Récupère une valeur de manière sécurisée avec l'opérateur nullish coalescing
 */
export const getSafeValue = (value: unknown, defaultValue = 0): number => {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
};

/**
 * Calcule le pourcentage de changement entre deux valeurs
 */
export const calculateChangePercentage = (
  current: number,
  previous: number
): number => {
  return previous === 0 ? 0 : ((current - previous) / previous) * 100;
};

/**
 * Calcule le taux de réalisation (pourcentage d'atteinte d'un objectif)
 */
export const calculateAchievementRate = (
  actual: number,
  target: number
): number => {
  return target === 0 ? 0 : (actual / target) * 100;
};

/**
 * Retourne la classe CSS pour les couleurs de performance
 */
export const getPerformanceColorClass = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Retourne la classe CSS pour les couleurs de comparaison
 */
export const getComparisonColorClass = (isPositive: boolean): string => {
  return isPositive ? 'text-green-600' : 'text-red-600';
};

/**
 * Détermine la direction de la tendance
 */
export const getTrendIcon = (
  current: number,
  previous: number
): 'up' | 'down' | 'stable' => {
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return 'stable';
  return diff > 0 ? 'up' : 'down';
};

/**
 * Formate une valeur selon son type (utilise les nouvelles fonctions)
 */
export const formatValue = (
  value: number | string,
  type = 'number'
): string => {
  if (typeof value === 'string') return value;

  switch (type) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    default:
      return formatNumberWithSeparators(value);
  }
};

/**
 * FONCTIONS DE FORMATAGE DES NOMBRES
 * Suppriment les décimales inutiles pour un affichage naturel
 */

/**
 * Formate un nombre en supprimant les décimales inutiles
 * - Supprime les .00 (ex: 19.00 → 19)
 * - Supprime les zéros inutiles (ex: 19.10 → 19.1)
 * - Limite à 2 décimales maximum
 *
 * @param value - Le nombre à formater
 * @param maxDecimals - Nombre maximum de décimales (défaut: 2)
 * @returns Le nombre formaté
 */
export function formatNumber(
  value: number | null | undefined,
  maxDecimals: number = 2
): number {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }

  // Arrondir au nombre de décimales souhaité
  const rounded =
    Math.round(value * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);

  // Convertir en string puis en number pour supprimer les zéros inutiles
  return parseFloat(rounded.toString());
}

/**
 * Formate un pourcentage en supprimant les décimales inutiles
 * @param value - Le pourcentage à formater (ex: 87.50)
 * @returns Le pourcentage formaté (ex: 87.5)
 */
export function formatPercentageNumber(
  value: number | null | undefined
): number {
  return formatNumber(value, 1);
}

/**
 * Formate un montant monétaire en supprimant les décimales inutiles
 * @param value - Le montant à formater
 * @returns Le montant formaté
 */
export function formatCurrencyNumber(value: number | null | undefined): number {
  return formatNumber(value, 2);
}

/**
 * Formate un nombre entier (supprime toutes les décimales)
 * @param value - Le nombre à formater
 * @returns Le nombre entier
 */
export function formatInteger(value: number | null | undefined): number {
  return Math.round(value ?? 0);
}

/**
 * FONCTIONS DE FORMATAGE AVEC SEPARATEURS DE MILLIERS
 * Pour l'affichage final dans les composants
 */

/**
 * Formate un montant avec devise et séparateurs de milliers
 * @param value - Le montant à formater
 * @param currency - La devise (défaut: EUR)
 * @returns Le montant formaté avec devise (ex: "1 385 €")
 */
export function formatCurrency(
  value: number | null | undefined,
  currency = 'EUR'
): string {
  const formattedNumber = formatCurrencyNumber(value);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(formattedNumber);
}

/**
 * Formate un pourcentage avec symbole et séparateurs de milliers
 * @param value - Le pourcentage à formater
 * @returns Le pourcentage formaté avec % (ex: "87,5 %")
 */
export function formatPercentage(value: number | null | undefined): string {
  const formattedPercentage = formatPercentageNumber(value);
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(formattedPercentage / 100);
}

/**
 * Formate un nombre avec séparateurs de milliers (espaces en français)
 * @param value - Le nombre à formater
 * @param maxDecimals - Nombre maximum de décimales (défaut: 2)
 * @returns Le nombre formaté avec espaces (ex: "1 385,5")
 */
export function formatNumberWithSeparators(
  value: number | null | undefined,
  maxDecimals: number = 2
): string {
  const formattedNumber = formatNumber(value, maxDecimals);
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(formattedNumber);
}
