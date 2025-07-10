import { Calendar, BarChart3 } from 'lucide-react';

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
  formatPercentage,
  getSafeValue,
  getComparisonColorClass,
} from '@/lib/dashboard-utils';
import type { DashboardMetrics } from '@/types/dashboard';

import { MetricCard, PerformanceCard } from '../index';

interface OverviewTabProps {
  metrics: DashboardMetrics;
}

export function OverviewTab({ metrics }: OverviewTabProps) {
  const { databaseStatistics } = metrics;

  // Données pour performance aujourd'hui
  const todayMetrics = [
    {
      title: 'Occupation actuelle',
      value: getSafeValue(
        databaseStatistics.databaseInfo.totalActiveCheckedIns.percentage
      ),
      format: 'percentage' as const,
      subtitle: `${getSafeValue(databaseStatistics.databaseInfo.totalActiveCheckedIns.count)} / ${getSafeValue(databaseStatistics.databaseInfo.totalActiveCheckedIns.outOf)} unités occupées`,
    },
    {
      title: 'Check-ins',
      value: getSafeValue(databaseStatistics.todayBusiness.checkInsToday),
      format: 'number' as const,
      subtitle: "Arrivées prévues aujourd'hui",
    },
    {
      title: 'Check-outs',
      value: getSafeValue(databaseStatistics.todayBusiness.checkOutsToday),
      format: 'number' as const,
      subtitle: "Départs prévus aujourd'hui",
    },
  ];

  // Données pour performance semaine
  const weekMetrics = [
    {
      title: 'Revenus hébergement',
      mainMetric: {
        label: 'Cette semaine',
        value: getSafeValue(
          databaseStatistics.currentWeek.accommodationHTExcludingCleaning
        ),
        format: 'currency' as const,
      },
      comparisonMetric: {
        value: getSafeValue(databaseStatistics.lastWeek.accommodationHT),
        label: 'vs semaine dernière',
        type: 'higher_better' as const,
      },
    },
    {
      title: 'Occupation',
      mainMetric: {
        label: `${databaseStatistics.currentWeek.occupancyPercentage}%`,
        value: getSafeValue(databaseStatistics.currentWeek.occupancyPercentage),
        format: 'percentage' as const,
      },
      comparisonMetric: {
        value: getSafeValue(databaseStatistics.lastWeek.occupancyPercentage),
        label: 'vs semaine dernière',
        type: 'higher_better' as const,
      },
    },
    {
      title: 'ADR',
      mainMetric: {
        label: 'Taux journalier moyen',
        value: getSafeValue(
          databaseStatistics.currentWeek.adrHTIncludingCleaning
        ),
        format: 'currency' as const,
      },
      comparisonMetric: {
        value: getSafeValue(databaseStatistics.lastWeek.adrHTIncludingCleaning),
        label: 'vs semaine dernière',
        type: 'higher_better' as const,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Performance aujourd'hui */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" aria-hidden="true" />
          Performance aujourd&apos;hui
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todayMetrics.map((metric, index) => (
            <MetricCard
              key={`today-metric-${index}`}
              title={metric.title}
              value={metric.value}
              format={metric.format}
              subtitle={metric.subtitle}
              size="md"
            />
          ))}
        </div>
      </section>

      {/* 2. Performance semaine avec comparaisons */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Performance cette semaine (
          {databaseStatistics.currentWeek.weekIdentifier})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weekMetrics.map((metric, index) => (
            <PerformanceCard
              key={`week-metric-${index}`}
              title={metric.title}
              mainMetric={metric.mainMetric}
              comparisonMetric={metric.comparisonMetric}
            />
          ))}
        </div>
      </section>

      {/* 3. Comparaison des performances temporelles */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Comparaison des performances temporelles
        </h2>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Indicateur</TableHead>
                  <TableHead className="text-center">Même mois 2024</TableHead>
                  <TableHead className="text-center">Mois précédent</TableHead>
                  <TableHead className="text-center">Mois actuel</TableHead>
                  <TableHead className="text-center">
                    Prévision {databaseStatistics.nextMonth.monthIdentifier}/
                    {databaseStatistics.nextMonth.year}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    indicator: 'Revenus hébergement',
                    values: [
                      getSafeValue(
                        databaseStatistics.sameMonthLastYear.accommodationHT
                      ),
                      getSafeValue(
                        databaseStatistics.lastMonth.accommodationHT
                      ),
                      getSafeValue(
                        databaseStatistics.thisMonth.accommodationHT
                      ),
                      getSafeValue(
                        databaseStatistics.nextMonth.accommodationHT
                      ),
                    ],
                    format: 'currency' as const,
                  },
                  {
                    indicator: "Taux d'occupation",
                    values: [
                      getSafeValue(
                        databaseStatistics.sameMonthLastYear
                          .occupancyRatePercentage
                      ),
                      getSafeValue(
                        databaseStatistics.lastMonth.occupancyRatePercentage
                      ),
                      getSafeValue(
                        databaseStatistics.thisMonth.occupancyRatePercentage
                      ),
                      getSafeValue(
                        databaseStatistics.nextMonth.occupancyPercentage
                      ),
                    ],
                    format: 'percentage' as const,
                  },
                  {
                    indicator: 'ADR moyen',
                    values: [
                      getSafeValue(databaseStatistics.sameMonthLastYear.adrHT),
                      getSafeValue(databaseStatistics.lastMonth.adrHT),
                      getSafeValue(databaseStatistics.thisMonth.adrHT),
                      getSafeValue(databaseStatistics.nextMonth.adrHT),
                    ],
                    format: 'currency' as const,
                  },
                  {
                    indicator: 'Services nettoyage',
                    values: [
                      getSafeValue(
                        databaseStatistics.sameMonthLastYear.cleaningHT
                      ),
                      getSafeValue(databaseStatistics.lastMonth.cleaningHT),
                      getSafeValue(databaseStatistics.thisMonth.cleaningHT),
                      getSafeValue(databaseStatistics.nextMonth.cleaningHT),
                    ],
                    format: 'currency' as const,
                    invertColors: true, // Pour les coûts, moins c'est mieux
                  },
                ].map((row, index) => (
                  <TableRow key={`temporal-${index}`}>
                    <TableCell className="font-medium">
                      {row.indicator}
                    </TableCell>
                    {row.values.slice(0, 3).map((value, valueIndex) => (
                      <TableCell
                        key={`value-${valueIndex}`}
                        className="text-center"
                      >
                        <div
                          className={`font-medium ${getComparisonColorClass(
                            value,
                            row.values.slice(0, 3),
                            row.invertColors ? 'lower_better' : 'higher_better'
                          )}`}
                        >
                          {row.format === 'percentage'
                            ? formatPercentage(value)
                            : formatCurrency(value)}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <div className="text-blue-800 font-bold">
                        {row.format === 'percentage'
                          ? formatPercentage(row.values[3])
                          : formatCurrency(row.values[3])}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Légende des couleurs */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
            <span>Meilleure performance entre les 3 périodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 border border-gray-300 rounded" />
            <span>Performance intermédiaire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded" />
            <span>Performance la moins favorable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded" />
            <span>Prévisions (pas de comparaison)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
