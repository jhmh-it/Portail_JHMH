import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

// Schema de validation pour les paramètres de requête
const querySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  actif: z.string().optional().default('global'),
});

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

export interface DashboardMetricsAttributes {
  date: string;
  actif: string;
  databaseStatistics: {
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
  };
  forecast: Forecast;
  monthlyComparison: MonthlyComparison;
}

interface WeekStats {
  weekIdentifier: string;
  accommodationHTExcludingCleaning?: number;
  accommodationHT?: number;
  occupancyPercentage: number;
  adrHTIncludingCleaning?: number;
  adrHT?: number;
}

interface TodayBusiness {
  checkInsToday: number;
  checkOutsToday: number;
}

interface MonthStats {
  occupancyRatePercentage: number;
  accommodationHT: number;
  cancellableAccommodationHT?: number;
  cleaningHT: number;
  adrHT: number;
  missedSalesTTC?: MissedSales;
  opportunityTTC?: Opportunity;
  euroPerSquareMeterHT?: number;
}

interface NextMonthStats {
  monthIdentifier: string;
  year: number;
  occupancyPercentage: number;
  adrHT: number;
  accommodationHT: number;
  cleaningHT: number;
}

interface MissedSales {
  amount: number;
  count: number;
}

interface Opportunity {
  amount: number;
  count: number;
}

interface DatabaseInfo {
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

interface YearRevenues {
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

interface YoyComparison {
  percentage: number;
  value2025: number;
  value2024: number;
}

interface TotalRevenues {
  year: number;
  occupancyPercentage: number;
  adr: number;
  totalAccommodationServicesHT: number;
  totalCleaningHT: number;
}

interface AllTimeBookings {
  adr: number;
  totalAccommodationServicesHTToDate: number;
  totalCleaningHTToDate: number;
}

interface Forecast {
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

interface MonthlyComparison {
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

// Mock data - données réalistes pour le développement
const generateMockData = (
  date: string,
  actif: string
): DashboardMetricsResponse => {
  const baseData: DashboardMetricsResponse = {
    data: {
      type: 'dashboardMetrics',
      id: `${actif}_${date}`,
      attributes: {
        date,
        actif,
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
                date,
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
      },
    },
    links: {
      self: `/api/dashboard/metrics?actif=${actif}&date=${date}`,
    },
    meta: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
    },
  };

  // Variation des données selon l'actif sélectionné
  if (actif !== 'global') {
    // Multiplier par un facteur aléatoire pour simuler des données différentes par actif
    let factor = 1.0;
    if (actif === '14M') {
      factor = 0.7;
    } else if (actif === '17C') {
      factor = 1.3;
    }

    baseData.data.attributes.databaseStatistics.thisMonth.accommodationHT *=
      factor;
    baseData.data.attributes.databaseStatistics.thisMonth.occupancyRatePercentage *=
      factor;
    baseData.data.attributes.forecast.accommodationHT *= factor;
  }

  return baseData;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validation des paramètres
    const params = querySchema.safeParse({
      date: searchParams.get('date'),
      actif: searchParams.get('actif'),
    });

    if (!params.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: params.error.errors,
        },
        { status: 400 }
      );
    }

    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérification de l'actif (simuler une vérification d'existence)
    const validActifs = ['global', '14M', '17C', '23A', '45B'];
    if (!validActifs.includes(params.data.actif)) {
      return NextResponse.json(
        {
          error: 'Asset not found',
          message: `L'actif "${params.data.actif}" n'existe pas`,
        },
        { status: 404 }
      );
    }

    // Génération des données mock
    const mockData = generateMockData(params.data.date, params.data.actif);

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error in dashboard metrics API:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur inattendue est survenue',
      },
      { status: 500 }
    );
  }
}
