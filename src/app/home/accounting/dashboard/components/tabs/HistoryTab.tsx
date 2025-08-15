import { Building2, ClipboardList, TrendingUp } from 'lucide-react';

import { MetricCard } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { formatCurrency, formatPercentage, getSafeValue } from '../../lib';
import type { DashboardMetrics } from '../../types/dashboard';

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
        <h2 className="text-navy mb-3 flex items-center gap-2 text-xl font-semibold">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          Données de référence
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Performance 2024 complète */}
          <Card>
            <CardHeader>
              <CardTitle className="text-navy">
                Performance 2024 (référence)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-navy mb-2 text-sm font-semibold">
                    Revenus totaux 2024
                  </h4>
                  <div className="text-navy mb-1 text-2xl font-bold">
                    {formatCurrency(performance2024Metrics[0].value)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Hébergement
                  </div>
                </div>

                <div>
                  <h4 className="text-navy mb-2 text-sm font-semibold">
                    Taux d&apos;occupation 2024
                  </h4>
                  <div className="text-navy mb-1 text-2xl font-bold">
                    {formatPercentage(performance2024Metrics[1].value)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Performance globale
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
                <div>
                  <h5 className="text-muted-foreground mb-1 text-xs font-medium">
                    ADR moyen
                  </h5>
                  <div className="text-navy text-lg font-semibold">
                    {formatCurrency(performance2024Metrics[2].value)}
                  </div>
                </div>

                <div>
                  <h5 className="text-muted-foreground mb-1 text-xs font-medium">
                    Services nettoyage
                  </h5>
                  <div className="text-navy text-lg font-semibold">
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
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-navy mb-2 text-sm font-semibold">
                    Total hébergement
                  </h4>
                  <div className="text-navy mb-1 text-2xl font-bold">
                    {formatCurrency(historicalMetrics[0].value)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Cumul historique
                  </div>
                </div>

                <div>
                  <h4 className="text-navy mb-2 text-sm font-semibold">
                    Total nettoyage
                  </h4>
                  <div className="text-navy mb-1 text-2xl font-bold">
                    {formatCurrency(historicalMetrics[1].value)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Services cumulés
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="text-muted-foreground mb-1 text-xs font-medium">
                  ADR moyen historique
                </h5>
                <div className="text-navy text-lg font-semibold">
                  {formatCurrency(historicalMetrics[2].value)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques de réservations */}
        <div className="mt-4">
          <h3 className="text-navy mb-3 flex items-center gap-2 text-lg font-medium">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Statistiques de réservations
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <div className="text-muted-foreground mb-1 text-xs font-medium">
                    Revenus hébergement 2024
                  </div>
                  <div className="text-muted-foreground mb-2 text-sm">
                    Même période (jan-juin)
                  </div>
                  <div className="text-navy text-2xl font-bold">
                    {formatCurrency(yoyComparison.value2024)}
                  </div>
                </div>

                {/* Flèche et croissance */}
                <div className="mx-8 flex-shrink-0 text-center">
                  <div className="mb-2 flex items-center justify-center">
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
                  <div className="text-muted-foreground text-xs">
                    de {getGrowthText(yoyComparison.percentage)}
                  </div>
                </div>

                {/* 2025 */}
                <div className="flex-1 text-right">
                  <div className="text-muted-foreground mb-1 text-xs font-medium">
                    Revenus hébergement 2025
                  </div>
                  <div className="text-muted-foreground mb-2 text-sm">
                    Réalisé (jan-juin)
                  </div>
                  <div className="text-navy text-2xl font-bold">
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
