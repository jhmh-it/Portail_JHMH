import type { ComparisonRowData } from '@/types/dashboard';

/**
 * Formate un montant en devise française
 */
export function formatCurrency(
  amount: number,
  options: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  } = {}
): string {
  const defaultOptions = {
    style: 'currency' as const,
    currency: 'EUR',
    maximumFractionDigits: 0,
    ...options,
  };

  return new Intl.NumberFormat('fr-FR', defaultOptions).format(amount);
}

/**
 * Formate un pourcentage avec précision
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

/**
 * Calcule le pourcentage de changement entre deux valeurs
 */
export function calculateChangePercentage(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calcule la différence absolue entre deux valeurs
 */
export function calculateAbsoluteDifference(
  current: number,
  previous: number
): number {
  return current - previous;
}

/**
 * Détermine la classe CSS de couleur selon la performance
 */
export function getPerformanceColorClass(
  current: number,
  previous: number,
  type: 'higher_better' | 'lower_better' | 'neutral' = 'higher_better'
): string {
  if (type === 'neutral') return 'text-foreground';

  const isPositive = current > previous;
  const isBetter = type === 'higher_better' ? isPositive : !isPositive;

  return isBetter ? 'text-green-600' : 'text-red-600';
}

/**
 * Détermine la classe CSS de couleur pour trois valeurs (min, max, intermédiaire)
 */
export function getComparisonColorClass(
  value: number,
  values: number[],
  type: 'higher_better' | 'lower_better' = 'higher_better'
): string {
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);

  if (type === 'higher_better') {
    if (value === maxVal) return 'text-green-800 font-bold';
    if (value === minVal) return 'text-red-800 font-bold';
  } else {
    if (value === minVal) return 'text-green-800 font-bold';
    if (value === maxVal) return 'text-red-800 font-bold';
  }

  return 'text-foreground font-bold';
}

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formate une date en français
 */
export function formatDateFR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
}

/**
 * Valide si une valeur est sûre (non null/undefined)
 */
export function isSafeValue(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Récupère une valeur sûre ou une valeur par défaut
 */
export function getSafeValue(
  value: number | null | undefined,
  defaultValue: number = 0
): number {
  return isSafeValue(value) ? value : defaultValue;
}

/**
 * Calcule le taux d'atteinte d'un objectif
 */
export function calculateAchievementRate(
  achieved: number,
  target: number
): number {
  if (target === 0) return 0;
  return (achieved / target) * 100;
}

/**
 * Détermine l'icône de tendance selon la performance
 */
export function getTrendIcon(
  current: number,
  previous: number
): 'up' | 'down' | 'stable' {
  const threshold = 0.1; // 0.1% de seuil pour considérer comme stable
  const change = calculateChangePercentage(current, previous);

  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
}

/**
 * Créé des données de comparaison normalisées
 */
export function createComparisonData(
  label: string,
  current: number,
  previous: number,
  format: 'currency' | 'percentage' | 'number' = 'currency',
  changeType: 'higher_better' | 'lower_better' | 'neutral' = 'higher_better'
): ComparisonRowData {
  return {
    label,
    current: getSafeValue(current),
    previous: getSafeValue(previous),
    format,
    changeType,
  };
}

/**
 * Formate une valeur selon son type
 */
export function formatValue(
  value: number,
  format: 'currency' | 'percentage' | 'number'
): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value);
    case 'number':
      return formatNumber(value);
    default:
      return value.toString();
  }
}

/**
 * Calcule les statistiques d'un tableau de valeurs
 */
export function calculateStats(values: number[]) {
  const safeValues = values.filter(isSafeValue);

  if (safeValues.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0 };
  }

  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const sum = safeValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / safeValues.length;

  return { min, max, avg, sum };
}

/**
 * Détermine si une évolution est favorable
 */
export function isFavorableEvolution(
  current: number,
  previous: number,
  type: 'higher_better' | 'lower_better' = 'higher_better'
): boolean {
  const isIncrease = current > previous;
  return type === 'higher_better' ? isIncrease : !isIncrease;
}

/**
 * Génère un identifiant unique pour les éléments de liste
 */
export function generateListKey(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

/**
 * Constantes pour les seuils de performance
 */
export const PERFORMANCE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  average: 50,
  poor: 30,
} as const;

/**
 * Évalue le niveau de performance
 */
export function getPerformanceLevel(
  achieved: number,
  target: number
): keyof typeof PERFORMANCE_THRESHOLDS | 'critical' {
  const rate = calculateAchievementRate(achieved, target);

  if (rate >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent';
  if (rate >= PERFORMANCE_THRESHOLDS.good) return 'good';
  if (rate >= PERFORMANCE_THRESHOLDS.average) return 'average';
  if (rate >= PERFORMANCE_THRESHOLDS.poor) return 'poor';
  return 'critical';
}
