import { Building2, ClipboardList, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatCurrency,
  formatPercentage,
  getSafeValue,
} from '@/lib/dashboard-utils';
import { cn } from '@/lib/utils';
import type { DashboardMetrics } from '@/types/dashboard';

import { MetricCard } from '../index';

interface HistoryTabProps {
  metrics: DashboardMetrics;
}

export function HistoryTab({ metrics }: HistoryTabProps) {
  const { databaseStatistics } = metrics;

  // Métriques performance 2024 complète
  const performance2024Metrics = [
    {
      title: 'Revenus totaux 2024',
      value: getSafeValue(
        databaseStatistics.totalRevenues.totalAccommodationServicesHT
      ),
      format: 'currency' as const,
      subtitle: 'Hébergement',
    },
    {
      title: "Taux d'occupation 2024",
      value: getSafeValue(databaseStatistics.totalRevenues.occupancyPercentage),
      format: 'percentage' as const,
      subtitle: 'Performance globale',
    },
    {
      title: 'ADR moyen',
      value: getSafeValue(databaseStatistics.totalRevenues.adr),
      format: 'currency' as const,
      subtitle: '2024',
    },
    {
      title: 'Services nettoyage',
      value: getSafeValue(databaseStatistics.totalRevenues.totalCleaningHT),
      format: 'currency' as const,
      subtitle: '2024',
    },
  ];

  // Métriques historiques complètes
  const historicalMetrics = [
    {
      title: 'Total hébergement',
      value: getSafeValue(
        databaseStatistics.allTimesBookings.totalAccommodationServicesHTToDate
      ),
      format: 'currency' as const,
      subtitle: 'Cumul historique',
    },
    {
      title: 'Total nettoyage',
      value: getSafeValue(
        databaseStatistics.allTimesBookings.totalCleaningHTToDate
      ),
      format: 'currency' as const,
      subtitle: 'Services cumulés',
    },
    {
      title: 'ADR moyen historique',
      value: getSafeValue(databaseStatistics.allTimesBookings.adr),
      format: 'currency' as const,
      subtitle: 'Depuis le début',
    },
  ];

  // Statistiques de réservations
  const bookingStats = [
    {
      title: 'Total réservations valides',
      value: getSafeValue(databaseStatistics.databaseInfo.totalValidBookings),
      format: 'number' as const,
      subtitle: 'Depuis le début',
    },
    {
      title: 'Réservations facturées',
      value: getSafeValue(
        databaseStatistics.databaseInfo.totalInvoicedBookings
      ),
      format: 'number' as const,
      subtitle: 'Réservations traitées',
    },
    {
      title: 'No-shows',
      value: getSafeValue(databaseStatistics.databaseInfo.includingNoShows),
      format: 'number' as const,
      subtitle: 'Réservations non honorées',
    },
  ];

  // Comparaison 2024 → 2025
  const yoyComparison = {
    value2024: getSafeValue(
      databaseStatistics.yoy2025vs2024AsOfJune30.value2024
    ),
    value2025: getSafeValue(
      databaseStatistics.yoy2025vs2024AsOfJune30.value2025
    ),
    percentage: getSafeValue(
      databaseStatistics.yoy2025vs2024AsOfJune30.percentage
    ),
  };

  // Fonction pour déterminer la couleur de la croissance
  const getGrowthColorClass = (percentage: number) => {
    if (percentage > 0) {
      return 'text-green-600';
    } else if (percentage < 0) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  };

  // Fonction pour déterminer le texte de l'évolution
  const getGrowthText = (percentage: number) => {
    if (percentage > 0) {
      return 'croissance';
    } else if (percentage < 0) {
      return 'décroissance';
    } else {
      return 'stabilité';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Données de référence */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          Données de référence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Performance 2024 complète */}
          <Card>
            <CardHeader>
              <CardTitle className="text-navy">
                Performance 2024 (référence)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-navy mb-2">
                    Revenus totaux 2024
                  </h4>
                  <div className="text-2xl font-bold text-navy mb-1">
                    {formatCurrency(performance2024Metrics[0].value)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Hébergement
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-navy mb-2">
                    Taux d&apos;occupation 2024
                  </h4>
                  <div className="text-2xl font-bold text-navy mb-1">
                    {formatPercentage(performance2024Metrics[1].value)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Performance globale
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">
                    ADR moyen
                  </h5>
                  <div className="text-lg font-semibold text-navy">
                    {formatCurrency(performance2024Metrics[2].value)}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">
                    Services nettoyage
                  </h5>
                  <div className="text-lg font-semibold text-navy">
                    {formatCurrency(performance2024Metrics[3].value)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performances historiques complètes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-navy">Historique complet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-navy mb-2">
                    Total hébergement
                  </h4>
                  <div className="text-2xl font-bold text-navy mb-1">
                    {formatCurrency(historicalMetrics[0].value)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cumul historique
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-navy mb-2">
                    Total nettoyage
                  </h4>
                  <div className="text-2xl font-bold text-navy mb-1">
                    {formatCurrency(historicalMetrics[1].value)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Services cumulés
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h5 className="text-xs font-medium text-muted-foreground mb-1">
                  ADR moyen historique
                </h5>
                <div className="text-lg font-semibold text-navy">
                  {formatCurrency(historicalMetrics[2].value)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques de réservations */}
        <div className="mt-4">
          <h3 className="text-lg font-medium text-navy mb-3 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Statistiques de réservations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookingStats.map((metric, index) => (
              <MetricCard
                key={`booking-${index}`}
                title={metric.title}
                value={metric.value}
                format={metric.format}
                subtitle={metric.subtitle}
                size="md"
              />
            ))}
          </div>
        </div>

        {/* Détail comparaison 2025 vs 2024 */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-navy text-base">
                Évolution 2024 → 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {/* 2024 */}
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Revenus hébergement 2024
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Même période (jan-juin)
                  </div>
                  <div className="text-2xl font-bold text-navy">
                    {formatCurrency(yoyComparison.value2024)}
                  </div>
                </div>

                {/* Flèche et croissance */}
                <div className="flex-shrink-0 mx-8 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp
                      className={cn(
                        'h-6 w-6',
                        getGrowthColorClass(yoyComparison.percentage)
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className={cn(
                      'text-2xl font-bold',
                      getGrowthColorClass(yoyComparison.percentage)
                    )}
                  >
                    {yoyComparison.percentage > 0 ? '+' : ''}
                    {formatPercentage(yoyComparison.percentage)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    de {getGrowthText(yoyComparison.percentage)}
                  </div>
                </div>

                {/* 2025 */}
                <div className="flex-1 text-right">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Revenus hébergement 2025
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Réalisé (jan-juin)
                  </div>
                  <div className="text-2xl font-bold text-navy">
                    {formatCurrency(yoyComparison.value2025)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
