/**
 * Service dashboard refactorisé
 * Utilise le client API centralisé (prêt pour la migration vers l'API réelle)
 */

import { ERROR_MESSAGES } from '@/lib/jhmh-api';

import type { DashboardMetricsResponse } from '../types';

export interface DashboardMetricsParams {
  date: string;
  actif: string;
}

/**
 * Récupère les métriques du dashboard depuis l'API
 * Utilise temporairement des données mock en attendant l'endpoint réel
 */
export async function fetchDashboardMetrics(
  params: DashboardMetricsParams
): Promise<DashboardMetricsResponse> {
  try {
    // TEMPORAIRE: Données mock en attendant l'API réelle
    // TODO: Remplacer par: await apiClient.post('/api/dashboard/metrics', params);
    const mockMetrics = generateMockMetrics(params.actif, params.date);

    // Simulation d'un délai d'API réaliste (conservé mais minimal)
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      success: true,
      data: {
        type: 'dashboard_metrics',
        id: `metrics-${params.date}-${params.actif}`,
        attributes: mockMetrics,
      },
      meta: {
        timestamp: new Date().toISOString(),
        api_version: '1.0.0',
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw new Error(ERROR_MESSAGES.UNKNOWN);
  }
}

/**
 * Génère des données de métriques mock basées sur l'actif et la date
 * Utilise la structure complète attendue par les composants existants
 */
function generateMockMetrics(actif: string, date: string) {
  // Utiliser l'actif et la date pour générer des données cohérentes
  const seed = actif.charCodeAt(0) + new Date(date).getDate();
  const random = (min: number, max: number) => min + (seed % (max - min));

  const baseIncome = random(40000, 220000);
  const expenses = random(8000, 45000);
  const units = random(15, 25);
  const occupiedUnits = random(Math.floor(units * 0.7), units);
  const occupancyRate = Math.round((occupiedUnits / units) * 100);
  const adr = random(300, 450);

  return {
    // Métriques simples pour compatibilité
    rental_income: baseIncome,
    operating_expenses: expenses,
    net_income: baseIncome - expenses,
    occupancy_rate: occupancyRate,
    revpar: Math.round(baseIncome / units),
    operating_margin: Math.round(((baseIncome - expenses) / baseIncome) * 100),
    roi: random(8, 18),
    total_units: units,
    occupied_units: occupiedUnits,
    adr: adr,
    yoy_growth: random(-8, 20),

    // Structure complète pour les composants existants
    databaseStatistics: {
      currentWeek: {
        weekIdentifier: `2025-08 W${Math.ceil(new Date(date).getDate() / 7)}`,
        accommodationHTExcludingCleaning: random(35000, 55000),
        occupancyPercentage: occupancyRate,
        adrHTIncludingCleaning: adr,
      },
      lastWeek: {
        weekIdentifier: `2025-08 W${Math.ceil(new Date(date).getDate() / 7) - 1}`,
        accommodationHT: random(32000, 48000),
        occupancyPercentage: random(65, 85),
        adrHT: random(280, 420),
        adrHTIncludingCleaning: random(290, 430),
      },
      nextWeek: {
        weekIdentifier: `2025-08 W${Math.ceil(new Date(date).getDate() / 7) + 1}`,
        accommodationHT: random(38000, 52000),
        occupancyPercentage: random(85, 99),
        adrHT: random(320, 380),
      },
      todayBusiness: {
        checkInsToday: random(2, 8),
        checkOutsToday: random(1, 6),
      },
      thisMonth: {
        occupancyRatePercentage: occupancyRate,
        accommodationHT: baseIncome,
        cancellableAccommodationHT: 0,
        cleaningHT: random(8000, 12000),
        adrHT: adr,
        missedSalesTTC: {
          amount: random(1000, 3000),
          count: random(3, 8),
        },
        opportunityTTC: {
          amount: random(40000, 60000),
          count: random(80, 120),
        },
      },
      sameMonthLastYear: {
        occupancyRatePercentage: random(70, 85),
        accommodationHT: random(120000, 160000),
        cleaningHT: random(9000, 12000),
        adrHT: random(280, 350),
        euroPerSquareMeterHT: random(2500, 3200),
      },
      lastMonth: {
        occupancyRatePercentage: random(88, 98),
        accommodationHT: random(180000, 240000),
        cleaningHT: random(10000, 13000),
        adrHT: random(380, 450),
        euroPerSquareMeterHT: random(4200, 5200),
      },
      nextMonth: {
        monthIdentifier: String(new Date(date).getMonth() + 2).padStart(2, '0'),
        year: new Date(date).getFullYear(),
        occupancyPercentage: random(40, 70),
        adrHT: random(300, 380),
        accommodationHT: random(80000, 120000),
        cleaningHT: random(5000, 8000),
      },
      databaseInfo: {
        totalValidBookings: random(5000, 8000),
        includingNoShows: random(60, 120),
        totalActiveCheckedIns: {
          count: occupiedUnits,
          outOf: units,
          percentage: occupancyRate,
        },
        totalFutureBookings: random(150, 300),
        totalInvoicedBookings: random(4500, 7500),
        lastUpdate: new Date().toISOString(),
      },
      revenues: {
        year: new Date(date).getFullYear(),
        revenues: {
          until: {
            date: '',
            totalAccommodationServicesHT: random(900000, 1200000),
            totalCleaningHT: random(70000, 90000),
            occupancyPercentage: random(85, 92),
            adrHT: random(300, 350),
          },
          totalAccommodationServicesHT: random(1100000, 1400000),
          totalCleaningHT: random(80000, 100000),
          totalADR: random(320, 380),
        },
      },
      euroPerSquareMeterHTLast12MonthAvg: random(3000, 3800),
      yoy2025vs2024AsOfJune30: {
        percentage: random(15, 35),
        value2025: random(800000, 1000000),
        value2024: random(600000, 800000),
      },
      totalRevenues: {
        year: new Date(date).getFullYear() - 1,
        occupancyPercentage: random(80, 88),
        adr: random(250, 320),
        totalAccommodationServicesHT: random(1300000, 1700000),
        totalCleaningHT: random(100000, 140000),
      },
      allTimesBookings: {
        adr: random(280, 350),
        totalAccommodationServicesHTToDate: random(6000000, 8000000),
        totalCleaningHTToDate: random(400000, 600000),
      },
    },
    forecast: {
      year: new Date(date).getFullYear(),
      accommodationHT: random(1600000, 2000000),
      realized2025: random(1100000, 1400000),
      modifiedOpportunity2025: random(700000, 900000),
      totalModifiedMaxed2025: random(1800000, 2300000),
      proRataTemporis2025: random(600000, 800000),
      extremeMinimum: random(1500000, 1900000),
      mixedModelForecast: {
        occupancyPercentage: random(85, 95),
        value: random(1600000, 2000000),
      },
      maximums: {
        monthIdentifier: '08',
        year: new Date(date).getFullYear(),
        maxOccupationPercentage: random(95, 99),
        maxTheoreticalAccommodation: random(220000, 280000),
      },
    },
    monthlyComparison: {
      year: new Date(date).getFullYear(),
      monthIdentifier: String(new Date(date).getMonth() + 1).padStart(2, '0'),
      revenues: {
        changePercentage: random(25, 45),
        thisMonthAccommodationHT: baseIncome,
        thisMonthCancellableAccommodationHT: 0,
        lastYearSameMonthAccommodationHT: random(120000, 160000),
        lastMonthAccommodationHT: random(180000, 240000),
      },
      cleaning: {
        changePercentage: random(-15, 5),
        thisMonthHT: random(8000, 12000),
        lastYearSameMonthHT: random(9000, 12000),
        lastMonthHT: random(10000, 13000),
      },
      adrHT: {
        changePercentage: random(20, 35),
        thisMonth: adr,
        lastYearSameMonth: random(280, 350),
        lastMonth: random(380, 450),
      },
      sqmPriceHT: {
        last12MonthAvgPerShab: random(3000, 3800),
        lastMonth: {
          label: 'mois dernier',
          value: random(4200, 5200),
        },
        lastYearSameMonth: {
          label: 'même mois année passée',
          value: random(2500, 3200),
        },
      },
    },
  };
}
