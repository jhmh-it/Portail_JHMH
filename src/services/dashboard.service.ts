import {
  VALID_ACTIFS,
  type DashboardMetricsResponse,
  type DashboardMetricsAttributes,
  type ValidActif,
  type DashboardErrorResponse,
} from '@/types/dashboard';

/**
 * Service pour la génération et gestion des données mock du dashboard
 */

/**
 * Configuration des facteurs de multiplication par actif
 */
const ACTIF_FACTORS: Record<string, number> = {
  global: 1.0,
  '14M': 0.7,
  '17C': 1.3,
  '23A': 0.9,
  '45B': 1.1,
};

/**
 * Données de base pour la génération mock
 */
const BASE_MOCK_ATTRIBUTES: Omit<DashboardMetricsAttributes, 'date' | 'actif'> =
  {
    databaseStatistics: {
      currentWeek: {
        weekIdentifier: '2025-07 W28',
        accommodationHTExcludingCleaning: 44748.5,
        occupancyPercentage: 88.72,
        adrHTIncludingCleaning: 392.73,
      },
      lastWeek: {
        weekIdentifier: '2025-06 W27',
        accommodationHT: 43617.75,
        occupancyPercentage: 74.44,
        adrHT: 440.26,
        adrHTIncludingCleaning: 440.26,
      },
      nextWeek: {
        weekIdentifier: '2025-07 W29',
        accommodationHT: 41326.57,
        occupancyPercentage: 99.25,
        adrHT: 334.02,
      },
      todayBusiness: {
        checkInsToday: 5,
        checkOutsToday: 3,
      },
      thisMonth: {
        occupancyRatePercentage: 83.87,
        accommodationHT: 194040.22,
        cancellableAccommodationHT: 0.0,
        cleaningHT: 9328.64,
        adrHT: 403.33,
        missedSalesTTC: {
          amount: 1705.0,
          count: 5,
        },
        opportunityTTC: {
          amount: 48782.2,
          count: 101,
        },
      },
      sameMonthLastYear: {
        occupancyRatePercentage: 80.1,
        accommodationHT: 139932.66,
        cleaningHT: 10405.16,
        adrHT: 312.83,
        euroPerSquareMeterHT: 2866.45,
      },
      lastMonth: {
        occupancyRatePercentage: 96.4,
        accommodationHT: 218282.01,
        cleaningHT: 11945.94,
        adrHT: 422.58,
        euroPerSquareMeterHT: 4997.21,
      },
      nextMonth: {
        monthIdentifier: '08',
        year: 2025,
        occupancyPercentage: 45.98,
        adrHT: 331.21,
        accommodationHT: 89034.13,
        cleaningHT: 5321.43,
      },
      databaseInfo: {
        totalValidBookings: 6296,
        includingNoShows: 82,
        totalActiveCheckedIns: {
          count: 17,
          outOf: 19,
          percentage: 89.47,
        },
        totalFutureBookings: 214,
        totalInvoicedBookings: 6064,
        lastUpdate: new Date().toISOString(),
      },
      revenues: {
        year: 2025,
        revenues: {
          until: {
            date: '',
            totalAccommodationServicesHT: 1075903.31,
            totalCleaningHT: 78243.31,
            occupancyPercentage: 87.85,
            adrHT: 322.73,
          },
          totalAccommodationServicesHT: 1283745.09,
          totalCleaningHT: 90110.87,
          totalADR: 341.91,
        },
      },
      euroPerSquareMeterHTLast12MonthAvg: 3276.72,
      yoy2025vs2024AsOfJune30: {
        percentage: 25.75,
        value2025: 881672.17,
        value2024: 701120.68,
      },
      totalRevenues: {
        year: 2024,
        occupancyPercentage: 84.72,
        adr: 285.64,
        totalAccommodationServicesHT: 1540476.22,
        totalCleaningHT: 122873.32,
      },
      allTimesBookings: {
        adr: 311.0,
        totalAccommodationServicesHTToDate: 6937673.3,
        totalCleaningHTToDate: 468855.86,
      },
    },
    forecast: {
      year: 2025,
      accommodationHT: 1783872.69,
      realized2025: 1283745.09,
      modifiedOpportunity2025: 833546.0,
      totalModifiedMaxed2025: 2117291.09,
      proRataTemporis2025: 679419.91,
      extremeMinimum: 1783872.69,
      mixedModelForecast: {
        occupancyPercentage: 89.06,
        value: 1783872.69,
      },
      maximums: {
        monthIdentifier: '08',
        year: 2025,
        maxOccupationPercentage: 99.15,
        maxTheoreticalAccommodation: 242822.0,
      },
    },
    monthlyComparison: {
      year: 2025,
      monthIdentifier: '07',
      revenues: {
        changePercentage: 38.67,
        thisMonthAccommodationHT: 194040.22,
        thisMonthCancellableAccommodationHT: 0.0,
        lastYearSameMonthAccommodationHT: 139932.66,
        lastMonthAccommodationHT: 218282.01,
      },
      cleaning: {
        changePercentage: -10.35,
        thisMonthHT: 9328.64,
        lastYearSameMonthHT: 10405.16,
        lastMonthHT: 11945.94,
      },
      adrHT: {
        changePercentage: 28.93,
        thisMonth: 403.33,
        lastYearSameMonth: 312.83,
        lastMonth: 422.58,
      },
      sqmPriceHT: {
        last12MonthAvgPerShab: 3276.72,
        lastMonth: {
          label: 'juin 2025',
          value: 4997.21,
        },
        lastYearSameMonth: {
          label: 'juin 2024',
          value: 2866.45,
        },
      },
    },
  };

/**
 * Applique un facteur de multiplication aux données monétaires
 */
function applyActifFactor(
  attributes: DashboardMetricsAttributes,
  factor: number
): DashboardMetricsAttributes {
  if (factor === 1.0) {
    return attributes;
  }

  // Créer une copie profonde pour éviter les mutations
  const modifiedAttributes = JSON.parse(
    JSON.stringify(attributes)
  ) as DashboardMetricsAttributes;

  // Appliquer le facteur aux métriques principales
  modifiedAttributes.databaseStatistics.thisMonth.accommodationHT *= factor;
  modifiedAttributes.databaseStatistics.thisMonth.occupancyRatePercentage =
    Math.min(
      modifiedAttributes.databaseStatistics.thisMonth.occupancyRatePercentage *
        factor,
      100
    );
  modifiedAttributes.forecast.accommodationHT *= factor;

  return modifiedAttributes;
}

/**
 * Génère les données mock pour les métriques dashboard
 */
export function generateDashboardMockData(
  date: string,
  actif: string
): DashboardMetricsResponse {
  // Préparer les attributs de base avec la date
  const attributes: DashboardMetricsAttributes = {
    ...BASE_MOCK_ATTRIBUTES,
    date,
    actif,
    databaseStatistics: {
      ...BASE_MOCK_ATTRIBUTES.databaseStatistics,
      revenues: {
        ...BASE_MOCK_ATTRIBUTES.databaseStatistics.revenues,
        revenues: {
          ...BASE_MOCK_ATTRIBUTES.databaseStatistics.revenues.revenues,
          until: {
            ...BASE_MOCK_ATTRIBUTES.databaseStatistics.revenues.revenues.until,
            date,
          },
        },
      },
      databaseInfo: {
        ...BASE_MOCK_ATTRIBUTES.databaseStatistics.databaseInfo,
        lastUpdate: new Date().toISOString(),
      },
    },
  };

  // Appliquer le facteur d'actif
  const factor = ACTIF_FACTORS[actif] ?? 1.0;
  const finalAttributes = applyActifFactor(attributes, factor);

  return {
    data: {
      type: 'dashboardMetrics',
      id: `${actif}_${date}`,
      attributes: finalAttributes,
    },
    links: {
      self: `/api/dashboard/metrics?actif=${actif}&date=${date}`,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
    },
  };
}

/**
 * Vérifie si un actif est valide
 */
export function isValidActif(actif: string): actif is ValidActif {
  return VALID_ACTIFS.includes(actif as ValidActif);
}

/**
 * Récupère la liste des actifs valides
 */
export function getValidActifs(): readonly ValidActif[] {
  return VALID_ACTIFS;
}

/**
 * Simule un délai réseau pour le développement
 */
export async function simulateNetworkDelay(
  delayMs: number = 500
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

/**
 * Crée une réponse d'erreur standardisée pour le dashboard
 */
export function createDashboardErrorResponse(
  error: string,
  message?: string,
  details?: unknown
): DashboardErrorResponse {
  const response: DashboardErrorResponse = { error };

  if (message) {
    response.message = message;
  }

  if (details) {
    response.details = details;
  }

  return response;
}

/**
 * Service principal pour récupérer les métriques dashboard
 */
export async function fetchDashboardMetrics(
  date: string,
  actif: string = 'global'
): Promise<
  | { success: true; data: DashboardMetricsResponse }
  | { success: false; error: DashboardErrorResponse }
> {
  try {
    // Vérifier la validité de l'actif
    if (!isValidActif(actif)) {
      return {
        success: false,
        error: createDashboardErrorResponse(
          'Asset not found',
          `L'actif "${actif}" n'existe pas`
        ),
      };
    }

    // Simuler un délai réseau
    await simulateNetworkDelay();

    // Générer les données mock
    const mockData = generateDashboardMockData(date, actif);

    return {
      success: true,
      data: mockData,
    };
  } catch (error) {
    console.error('Error generating dashboard mock data:', error);

    return {
      success: false,
      error: createDashboardErrorResponse(
        'Internal server error',
        'Une erreur inattendue est survenue',
        error instanceof Error ? error.message : 'Unknown error'
      ),
    };
  }
}
