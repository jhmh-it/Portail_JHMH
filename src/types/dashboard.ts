export interface DatabaseStatistics {
  databaseInfo: {
    totalActiveCheckedIns: {
      count: number;
      outOf: number;
      percentage: number;
    };
    totalValidBookings: number;
    totalInvoicedBookings: number;
    totalFutureBookings: number;
    includingNoShows: number;
    lastUpdate: string;
  };
  todayBusiness: {
    checkInsToday: number;
    checkOutsToday: number;
  };
  currentWeek: {
    weekIdentifier: string;
    accommodationHTExcludingCleaning?: number; // Optional pour correspondre à l'API
    occupancyPercentage: number;
    adrHTIncludingCleaning?: number; // Optional pour correspondre à l'API
  };
  lastWeek: {
    weekIdentifier: string;
    accommodationHT?: number; // Optional pour correspondre à l'API
    occupancyPercentage: number;
    adrHT?: number; // Optional pour correspondre à l'API
    adrHTIncludingCleaning?: number; // Optional pour correspondre à l'API
  };
  nextWeek: {
    weekIdentifier: string;
    accommodationHT?: number; // Optional pour correspondre à l'API
    occupancyPercentage: number;
    adrHT?: number; // Optional pour correspondre à l'API
  };
  thisMonth: {
    accommodationHT: number;
    cleaningHT: number;
    occupancyRatePercentage: number;
    adrHT: number;
    missedSalesTTC?: {
      amount: number;
      count: number;
    };
    opportunityTTC?: {
      amount: number;
      count: number;
    };
  };
  lastMonth: {
    accommodationHT: number;
    cleaningHT: number;
    occupancyRatePercentage: number;
    adrHT: number;
    euroPerSquareMeterHT?: number;
  };
  nextMonth: {
    monthIdentifier: string;
    year: number;
    accommodationHT: number;
    cleaningHT: number;
    occupancyPercentage: number;
    adrHT: number;
  };
  sameMonthLastYear: {
    accommodationHT: number;
    cleaningHT: number;
    occupancyRatePercentage: number;
    adrHT: number;
    euroPerSquareMeterHT?: number;
  };
  totalRevenues: {
    totalAccommodationServicesHT: number;
    totalCleaningHT: number;
    occupancyPercentage: number;
    adr: number;
  };
  allTimesBookings: {
    totalAccommodationServicesHTToDate: number;
    totalCleaningHTToDate: number;
    adr: number;
  };
  revenues: {
    revenues: {
      until: {
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
  yoy2025vs2024AsOfJune30: {
    value2024: number;
    value2025: number;
    percentage: number;
  };
  euroPerSquareMeterHTLast12MonthAvg: number;
}

export interface MonthlyComparison {
  monthIdentifier: string;
  year: number;
  revenues: {
    thisMonthAccommodationHT: number;
    thisMonthCancellableAccommodationHT: number;
    lastYearSameMonthAccommodationHT: number;
    lastMonthAccommodationHT: number;
    changePercentage: number;
  };
  cleaning: {
    thisMonthHT: number;
    lastYearSameMonthHT: number;
    lastMonthHT: number;
    changePercentage: number;
  };
  adrHT: {
    thisMonth: number;
    lastYearSameMonth: number;
    lastMonth: number;
    changePercentage: number;
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

export interface ForecastData {
  accommodationHT: number;
  realized2025: number;
  modifiedOpportunity2025: number;
  totalModifiedMaxed2025: number;
  proRataTemporis2025: number;
  maximums: {
    monthIdentifier: string;
    year: number;
    maxTheoreticalAccommodation: number;
    maxOccupationPercentage: number;
  };
  mixedModelForecast: {
    occupancyPercentage: number;
  };
}

export interface DashboardMetrics {
  databaseStatistics: DatabaseStatistics;
  monthlyComparison: MonthlyComparison;
  forecast: ForecastData;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  format?: 'currency' | 'percentage' | 'number';
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  trend?: {
    value: number;
    label: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ComparisonRowData {
  label: string;
  current: number;
  previous: number;
  format: 'currency' | 'percentage' | 'number';
  changeType?: 'higher_better' | 'lower_better' | 'neutral';
}

export interface FilterState {
  selectedDate: Date;
  selectedActif: string;
}

// Actif type pour correspondre à l'API existante
export interface Actif {
  id: string;
  label: string;
  type: 'global' | 'property' | 'zone'; // Correspondre aux types de l'API
}

export interface DashboardApiResponse {
  success: boolean;
  data: {
    attributes: DashboardMetrics;
  };
  timestamp: string;
}
