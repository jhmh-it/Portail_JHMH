import { Calendar, BarChart3 } from 'lucide-react';

import { MetricCard } from '@/components/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatCurrency, formatPercentage, getSafeValue } from '../../lib';
import type { DashboardMetrics } from '../../types/dashboard';
import { PerformanceCard } from '../index';

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
        label: `‎ `,
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
        <h2 className="text-navy mb-4 flex items-center gap-2 text-xl font-semibold">
          <Calendar className="h-5 w-5" aria-hidden="true" />
          Performance aujourd&apos;hui
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <h2 className="text-navy mb-4 flex items-center gap-2 text-xl font-semibold">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
          Performance cette semaine (
          {databaseStatistics.currentWeek.weekIdentifier})
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        <h2 className="text-navy mb-4 flex items-center gap-2 text-xl font-semibold">
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
                    {(() => {
                      // Déterminer best/middle/worst pour les 3 premières valeurs
                      const v = row.values.slice(0, 3);
                      const isCost = row.invertColors === true; // coûts: plus bas est mieux
                      const best = isCost ? Math.min(...v) : Math.max(...v);
                      const worst = isCost ? Math.max(...v) : Math.min(...v);
                      const classes = v.map(val => {
                        if (val === best && val !== worst)
                          return 'bg-green-100 border-green-200 text-green-800 rounded px-1';
                        if (val === worst && val !== best)
                          return 'bg-red-100 border-red-200 text-red-800 rounded px-1';
                        return 'bg-gray-100 border-gray-200 text-gray-800 rounded px-1';
                      });
                      return v.map((value, valueIndex) => (
                        <TableCell
                          key={`value-${valueIndex}`}
                          className="text-center"
                        >
                          <div
                            className={`inline-block border font-medium ${classes[valueIndex]}`}
                          >
                            {row.format === 'percentage'
                              ? formatPercentage(value)
                              : formatCurrency(value)}
                          </div>
                        </TableCell>
                      ));
                    })()}
                    <TableCell className="text-center">
                      <div className="font-bold text-blue-800">
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
            <div className="h-4 w-4 rounded border border-green-200 bg-green-100" />
            <span>Meilleure performance entre les 3 périodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-gray-300 bg-gray-700" />
            <span>Performance intermédiaire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-red-200 bg-red-100" />
            <span>Performance la moins favorable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-blue-200 bg-blue-100" />
            <span>Prévisions (pas de comparaison)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
