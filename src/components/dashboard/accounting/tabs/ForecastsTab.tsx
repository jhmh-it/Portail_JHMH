import { Calendar, TrendingUp, Building2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatCurrency,
  getSafeValue,
  calculateAchievementRate,
} from '@/lib/dashboard-utils';
import type { DashboardMetrics } from '@/types/dashboard';

import { MetricCard, PerformanceCard } from '../index';

interface ForecastsTabProps {
  metrics: DashboardMetrics;
}

export function ForecastsTab({ metrics }: ForecastsTabProps) {
  const { databaseStatistics, forecast } = metrics;

  // Données pour le scénario mensuel de pointe
  const peakMonthData = {
    maxTheoretical: getSafeValue(forecast.maximums.maxTheoreticalAccommodation),
    maxOccupancy: getSafeValue(forecast.maximums.maxOccupationPercentage),
    monthIdentifier: forecast.maximums.monthIdentifier,
    year: forecast.maximums.year,
  };

  const nextMonthData = {
    revenue: getSafeValue(databaseStatistics.nextMonth.accommodationHT),
    month: databaseStatistics.nextMonth.monthIdentifier,
    year: databaseStatistics.nextMonth.year,
    occupancy: getSafeValue(databaseStatistics.nextMonth.occupancyPercentage),
    adr: getSafeValue(databaseStatistics.nextMonth.adrHT),
    cleaning: getSafeValue(databaseStatistics.nextMonth.cleaningHT),
  };

  // Données tableau prévisions 2025
  const forecasts2025Data = [
    {
      indicator: 'Objectif annuel 2025',
      description: `Revenus hébergement cible - ${forecast.mixedModelForecast.occupancyPercentage.toFixed(1)}% d'occupation prévue`,
      value: getSafeValue(forecast.accommodationHT),
      progress: calculateAchievementRate(
        getSafeValue(forecast.realized2025),
        getSafeValue(forecast.accommodationHT)
      ),
      context: `au ${new Date(databaseStatistics.databaseInfo.lastUpdate).toLocaleDateString('fr-FR')}`,
    },
    {
      indicator: 'Revenus confirmés 2025',
      description: "Montant effectivement réalisé jusqu'à présent",
      value: getSafeValue(forecast.realized2025),
      progress: null,
      context: `+${formatCurrency(getSafeValue(forecast.realized2025) - getSafeValue(databaseStatistics.totalRevenues.totalAccommodationServicesHT))} vs 2024 total`,
    },
    {
      indicator: 'Opportunités disponibles',
      description: 'Potentiel de revenus non encore réalisé',
      value: getSafeValue(forecast.modifiedOpportunity2025),
      progress: calculateAchievementRate(
        getSafeValue(forecast.modifiedOpportunity2025),
        getSafeValue(forecast.accommodationHT)
      ),
      context: 'Reste à convertir',
    },
    {
      indicator: 'Potentiel maximum théorique',
      description: 'Si toutes les opportunités sont saisies',
      value: getSafeValue(forecast.totalModifiedMaxed2025),
      progress: calculateAchievementRate(
        getSafeValue(forecast.totalModifiedMaxed2025),
        getSafeValue(forecast.accommodationHT)
      ),
      context: 'Upside possible',
      isHighlight: true,
    },
    {
      indicator: 'Projection tendancielle',
      description: 'Extrapolation basée sur la performance actuelle',
      value: getSafeValue(forecast.proRataTemporis2025),
      progress: calculateAchievementRate(
        getSafeValue(forecast.proRataTemporis2025),
        getSafeValue(forecast.accommodationHT)
      ),
      context: 'Tendance actuelle',
    },
  ];

  // Métriques pipeline
  const pipelineMetrics = [
    {
      title: 'Réservations futures confirmées',
      value: getSafeValue(databaseStatistics.databaseInfo.totalFutureBookings),
      format: 'number' as const,
      subtitle: 'Réservations avec dates futures',
    },
    {
      title: 'Taux de conversion',
      value: calculateAchievementRate(
        getSafeValue(databaseStatistics.databaseInfo.totalFutureBookings),
        getSafeValue(databaseStatistics.databaseInfo.totalValidBookings)
      ),
      format: 'percentage' as const,
      subtitle: '% du total des réservations',
    },
    {
      title: 'Performance vs 2024',
      value: getSafeValue(
        databaseStatistics.yoy2025vs2024AsOfJune30.percentage
      ),
      format: 'percentage' as const,
      subtitle: 'Croissance année sur année',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Scénarios détaillés pour le mois de pointe */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" aria-hidden="true" />
          Scénarios pour le mois de {peakMonthData.monthIdentifier}/
          {peakMonthData.year}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Analyse détaillée du potentiel pour le mois de pointe identifié
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte du maximum théorique */}
          <PerformanceCard
            title="Maximum théorique mensuel"
            icon={TrendingUp}
            mainMetric={{
              label: `Revenus possibles avec ${peakMonthData.maxOccupancy}% d'occupation`,
              value: peakMonthData.maxTheoretical,
              format: 'currency',
              badgeText: `${peakMonthData.maxOccupancy}%`,
            }}
            additionalMetrics={[
              {
                label: 'Mois cible',
                value: 0,
                format: 'number',
                badgeText: `${peakMonthData.monthIdentifier}/${peakMonthData.year}`,
              },
            ]}
          />

          {/* Carte du mois prochain */}
          <PerformanceCard
            title="Prévision mois prochain"
            icon={Calendar}
            mainMetric={{
              label: `Prévision pour ${nextMonthData.month}/${nextMonthData.year}`,
              value: nextMonthData.revenue,
              format: 'currency',
            }}
            additionalMetrics={[
              {
                label: 'Occupation prévue',
                value: nextMonthData.occupancy,
                format: 'percentage',
              },
              {
                label: 'ADR prévu',
                value: nextMonthData.adr,
                format: 'currency',
              },
              {
                label: 'Nettoyage prévu',
                value: nextMonthData.cleaning,
                format: 'currency',
              },
            ]}
          />
        </div>
      </section>

      {/* 2. Tableau unifié des prévisions 2025 */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
          Prévisions et Scénarios 2025
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Vue d&apos;ensemble complète des objectifs, réalisations et
          projections pour l&apos;année 2025
        </p>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Indicateur</TableHead>
                  <TableHead className="text-center">Valeur</TableHead>
                  <TableHead className="text-center">
                    Progression / Contexte
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts2025Data.map((row, index) => (
                  <TableRow
                    key={`forecast-${index}`}
                    className={
                      row.isHighlight ? 'border-b-2 border-gray-200' : ''
                    }
                  >
                    <TableCell>
                      <div>
                        <div
                          className={`font-semibold ${row.isHighlight ? 'text-navy' : 'font-medium'} flex items-center gap-2`}
                        >
                          {row.indicator}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {row.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className={`font-bold ${row.isHighlight ? 'text-green-600' : ''}`}
                      >
                        {formatCurrency(row.value)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm">
                        {row.progress !== null ? (
                          <>
                            <div
                              className={`font-medium ${row.isHighlight ? 'text-green-600' : ''}`}
                            >
                              {row.progress > 100 ? '+' : ''}
                              {row.progress.toFixed(1)}%{' '}
                              {row.isHighlight ? '' : "de l'objectif"}
                            </div>
                            <div className="text-muted-foreground">
                              {row.context}
                            </div>
                          </>
                        ) : (
                          <div className="text-green-600 font-medium">
                            {row.context}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 3. Pipeline de réservations futures */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          Pipeline de réservations futures
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pipelineMetrics.map((metric, index) => (
            <MetricCard
              key={`pipeline-${index}`}
              title={metric.title}
              value={metric.value}
              format={metric.format}
              subtitle={metric.subtitle}
              size="sm"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
