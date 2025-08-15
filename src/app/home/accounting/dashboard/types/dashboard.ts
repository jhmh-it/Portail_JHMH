/**
 * Types pour le dashboard accounting
 */

/**
 * État des filtres du dashboard
 */
export interface FilterState {
  /** Date formatée pour l'API */
  date: string;
  /** ID de l'actif sélectionné */
  actif: string;
  /** Date sélectionnée dans le picker */
  selectedDate: Date;
  /** ID de l'actif sélectionné dans le dropdown */
  selectedActif: string;
}

/**
 * Structure des métriques du dashboard
 */
export interface DashboardMetrics {
  /** Métriques de base */
  rental_income: number;
  operating_expenses: number;
  net_income: number;
  occupancy_rate: number;
  revpar: number;
  operating_margin: number;
  roi: number;
  total_units: number;
  occupied_units: number;
  adr: number;
  yoy_growth: number;

  /** Données historiques pour les graphiques */
  historical_data?: Array<{
    date: string;
    value: number;
    metric: string;
  }>;

  /** Prévisions */
  forecasts?: Array<{
    date: string;
    predicted_value: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
  }>;

  /** Statistiques détaillées de la base de données */
  databaseStatistics: {
    currentWeek: {
      weekIdentifier: string;
      accommodationHTExcludingCleaning: number;
      occupancyPercentage: number;
      adrHTIncludingCleaning: number;
    };
    lastWeek: {
      weekIdentifier: string;
      accommodationHT: number;
      occupancyPercentage: number;
      adrHT: number;
      adrHTIncludingCleaning: number;
    };
    nextWeek: {
      weekIdentifier: string;
      accommodationHT: number;
      occupancyPercentage: number;
      adrHT: number;
    };
    todayBusiness: {
      checkInsToday: number;
      checkOutsToday: number;
    };
    thisMonth: {
      occupancyRatePercentage: number;
      accommodationHT: number;
      cancellableAccommodationHT: number;
      cleaningHT: number;
      adrHT: number;
      missedSalesTTC: {
        amount: number;
        count: number;
      };
      opportunityTTC: {
        amount: number;
        count: number;
      };
    };
    sameMonthLastYear: {
      occupancyRatePercentage: number;
      accommodationHT: number;
      cleaningHT: number;
      adrHT: number;
      euroPerSquareMeterHT: number;
    };
    lastMonth: {
      occupancyRatePercentage: number;
      accommodationHT: number;
      cleaningHT: number;
      adrHT: number;
      euroPerSquareMeterHT: number;
    };
    nextMonth: {
      monthIdentifier: string;
      year: number;
      occupancyPercentage: number;
      adrHT: number;
      accommodationHT: number;
      cleaningHT: number;
    };
    databaseInfo: {
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
    };
    revenues: {
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
    };
    euroPerSquareMeterHTLast12MonthAvg: number;
    yoy2025vs2024AsOfJune30: {
      percentage: number;
      value2025: number;
      value2024: number;
    };
    totalRevenues: {
      year: number;
      occupancyPercentage: number;
      adr: number;
      totalAccommodationServicesHT: number;
      totalCleaningHT: number;
    };
    allTimesBookings: {
      adr: number;
      totalAccommodationServicesHTToDate: number;
      totalCleaningHTToDate: number;
    };
  };

  /** Prévisions financières */
  forecast: {
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
  };

  /** Comparaisons mensuelles */
  monthlyComparison: {
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
  };
}

/**
 * Réponse API pour les métriques du dashboard
 */
export interface DashboardMetricsResponse {
  /** Indicateur de succès */
  success: boolean;
  /** Données des métriques */
  data: {
    /** Type de réponse */
    type: 'dashboard_metrics';
    /** ID de la requête */
    id: string;
    /** Attributs contenant les métriques */
    attributes: DashboardMetrics;
  };
  /** Métadonnées de la réponse */
  meta: {
    /** Horodatage de la réponse */
    timestamp: string;
    /** Version de l'API */
    api_version: string;
  };
}

/**
 * Paramètres pour les requêtes API du dashboard
 */
export interface DashboardAPIParams {
  /** Date au format YYYY-MM-DD */
  date: string;
  /** ID de l'actif */
  actif: string;
  /** Indique si la requête doit être exécutée */
  enabled?: boolean;
}

/**
 * Options d'actif pour le dashboard
 */
export interface ActifOption {
  /** ID unique de l'actif */
  id: string;
  /** Libellé affiché */
  label: string;
  /** Type d'actif */
  type: 'property';
}

/**
 * Réponse d'erreur du dashboard
 */
export interface DashboardErrorResponse {
  /** Code d'erreur */
  error: string;
  /** Message d'erreur optionnel */
  message?: string;
  /** Détails supplémentaires */
  details?: unknown;
}

/**
 * Props communes pour les composants tab du dashboard
 */
export interface DashboardTabProps {
  /** Métriques du dashboard */
  metrics: DashboardMetrics;
}
