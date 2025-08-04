/**
 * Types pour les métriques du dashboard
 */

/**
 * Réponse principale de l'API dashboard metrics
 */
export interface DashboardMetricsResponse {
  data: {
    type: 'dashboardMetrics';
    id: string;
    attributes: DashboardMetricsAttributes;
  };
  links: {
    self: string;
  };
  meta: {
    generatedAt: string;
    version: string;
  };
}

/**
 * Attributs principaux des métriques dashboard
 */
export interface DashboardMetricsAttributes {
  date: string;
  actif: string;
  databaseStatistics: DatabaseStatistics;
  forecast: Forecast;
  monthlyComparison: MonthlyComparison;
}

/**
 * Statistiques de la base de données
 */
export interface DatabaseStatistics {
  currentWeek: WeekStats;
  lastWeek: WeekStats;
  nextWeek: WeekStats;
  todayBusiness: TodayBusiness;
  thisMonth: MonthStats;
  sameMonthLastYear: MonthStats;
  lastMonth: MonthStats;
  nextMonth: NextMonthStats;
  databaseInfo: DatabaseInfo;
  revenues: YearRevenues;
  euroPerSquareMeterHTLast12MonthAvg: number;
  yoy2025vs2024AsOfJune30: YoyComparison;
  totalRevenues: TotalRevenues;
  allTimesBookings: AllTimeBookings;
}

/**
 * Statistiques hebdomadaires
 */
export interface WeekStats {
  weekIdentifier: string;
  accommodationHTExcludingCleaning?: number;
  accommodationHT?: number;
  occupancyPercentage: number;
  adrHTIncludingCleaning?: number;
  adrHT?: number;
}

/**
 * Activité du jour
 */
export interface TodayBusiness {
  checkInsToday: number;
  checkOutsToday: number;
}

/**
 * Statistiques mensuelles
 */
export interface MonthStats {
  occupancyRatePercentage: number;
  accommodationHT: number;
  cancellableAccommodationHT?: number;
  cleaningHT: number;
  adrHT: number;
  missedSalesTTC?: MissedSales;
  opportunityTTC?: Opportunity;
  euroPerSquareMeterHT?: number;
}

/**
 * Statistiques du mois prochain
 */
export interface NextMonthStats {
  monthIdentifier: string;
  year: number;
  occupancyPercentage: number;
  adrHT: number;
  accommodationHT: number;
  cleaningHT: number;
}

/**
 * Ventes manquées
 */
export interface MissedSales {
  amount: number;
  count: number;
}

/**
 * Opportunités
 */
export interface Opportunity {
  amount: number;
  count: number;
}

/**
 * Informations de la base de données
 */
export interface DatabaseInfo {
  totalValidBookings: number;
  includingNoShows: number;
  totalActiveCheckedIns: {
    count: number;
    outOf: number;
    percentage: number;
  };
  totalFutureBookings: number;
  totalInvoicedBookings: number;
  lastUpdate: string;
}

/**
 * Revenus annuels
 */
export interface YearRevenues {
  year: number;
  revenues: {
    until: {
      date: string;
      totalAccommodationServicesHT: number;
      totalCleaningHT: number;
      occupancyPercentage: number;
      adrHT: number;
    };
    totalAccommodationServicesHT: number;
    totalCleaningHT: number;
    totalADR: number;
  };
}

/**
 * Comparaison année sur année
 */
export interface YoyComparison {
  percentage: number;
  value2025: number;
  value2024: number;
}

/**
 * Revenus totaux
 */
export interface TotalRevenues {
  year: number;
  occupancyPercentage: number;
  adr: number;
  totalAccommodationServicesHT: number;
  totalCleaningHT: number;
}

/**
 * Réservations historiques
 */
export interface AllTimeBookings {
  adr: number;
  totalAccommodationServicesHTToDate: number;
  totalCleaningHTToDate: number;
}

/**
 * Prévisions
 */
export interface Forecast {
  year: number;
  accommodationHT: number;
  realized2025: number;
  modifiedOpportunity2025: number;
  totalModifiedMaxed2025: number;
  proRataTemporis2025: number;
  extremeMinimum: number;
  mixedModelForecast: {
    occupancyPercentage: number;
    value: number;
  };
  maximums: {
    monthIdentifier: string;
    year: number;
    maxOccupationPercentage: number;
    maxTheoreticalAccommodation: number;
  };
}

/**
 * Comparaison mensuelle
 */
export interface MonthlyComparison {
  year: number;
  monthIdentifier: string;
  revenues: {
    changePercentage: number;
    thisMonthAccommodationHT: number;
    thisMonthCancellableAccommodationHT: number;
    lastYearSameMonthAccommodationHT: number;
    lastMonthAccommodationHT: number;
  };
  cleaning: {
    changePercentage: number;
    thisMonthHT: number;
    lastYearSameMonthHT: number;
    lastMonthHT: number;
  };
  adrHT: {
    changePercentage: number;
    thisMonth: number;
    lastYearSameMonth: number;
    lastMonth: number;
  };
  sqmPriceHT: {
    last12MonthAvgPerShab: number;
    lastMonth: {
      label: string;
      value: number;
    };
    lastYearSameMonth: {
      label: string;
      value: number;
    };
  };
}

/**
 * Paramètres de requête pour les métriques dashboard
 */
export interface DashboardMetricsQuery {
  date: string;
  actif?: string;
}

/**
 * Liste des actifs valides
 */
export const VALID_ACTIFS = ['global', '14M', '17C', '23A', '45B'] as const;

/**
 * Type pour les actifs valides
 */
export type ValidActif = (typeof VALID_ACTIFS)[number];

// Types de compatibilité pour les composants existants
/** @deprecated Utiliser DashboardMetricsAttributes à la place */
export type DashboardMetrics = DashboardMetricsAttributes;

/** @deprecated Utiliser DashboardMetricsAttributes à la place */
export interface Actif {
  id: string;
  label: string;
  type: string;
}

/** @deprecated */
export interface FilterState {
  date: string;
  actif: string;
  selectedDate: Date;
  selectedActif: string;
}

/** @deprecated */
export interface MetricCardProps {
  title: string;
  value: string | number;
  format?: 'number' | 'currency' | 'percentage';
  subtitle?: string;
  icon?: React.ComponentType;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
    type?: 'positive' | 'negative';
  };
  size?: 'sm' | 'md' | 'lg';
}

/** @deprecated */
export interface ComparisonRowData {
  label: string;
  current: number;
  previous: number;
  change: number;
  format?: 'number' | 'currency' | 'percentage';
  changeType?: 'positive' | 'negative' | 'neutral';
}

/**
 * Configuration pour la génération de données mock
 */
export interface MockDataConfig {
  actif: string;
  factor: number;
}

/**
 * Réponse d'erreur de l'API dashboard
 */
export interface DashboardErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}
