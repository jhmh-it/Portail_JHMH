import {
  Calendar,
  BarChart3,
  ChartBar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  getPerformanceColorClass,
  calculateChangePercentage,
} from '@/lib/dashboard-utils';
import type { DashboardMetrics } from '@/types/dashboard';

import { MetricCard, PerformanceCard } from '../index';

interface OverviewTabProps {
  metrics: DashboardMetrics;
}

export function OverviewTab({ metrics }: OverviewTabProps) {
  const { databaseStatistics, monthlyComparison } = metrics;

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

  // Données tableau détaillé du mois
  const monthlyTableData = [
    {
      indicator: 'Revenus hébergement',
      value: getSafeValue(databaseStatistics.thisMonth.accommodationHT),
      change: calculateChangePercentage(
        getSafeValue(databaseStatistics.thisMonth.accommodationHT),
        getSafeValue(databaseStatistics.lastMonth.accommodationHT)
      ),
    },
    {
      indicator: 'Revenus nettoyage',
      value: getSafeValue(databaseStatistics.thisMonth.cleaningHT),
      change: calculateChangePercentage(
        getSafeValue(databaseStatistics.thisMonth.cleaningHT),
        getSafeValue(databaseStatistics.lastMonth.cleaningHT)
      ),
    },
    {
      indicator: "Taux d'occupation",
      value: getSafeValue(databaseStatistics.thisMonth.occupancyRatePercentage),
      change:
        getSafeValue(databaseStatistics.thisMonth.occupancyRatePercentage) -
        getSafeValue(databaseStatistics.lastMonth.occupancyRatePercentage),
      isPercentage: true,
    },
    {
      indicator: 'ADR moyen',
      value: getSafeValue(databaseStatistics.thisMonth.adrHT),
      change: calculateChangePercentage(
        getSafeValue(databaseStatistics.thisMonth.adrHT),
        getSafeValue(databaseStatistics.lastMonth.adrHT)
      ),
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

      {/* 3. Analyse détaillée du mois - Tableau */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <ChartBar className="h-5 w-5" aria-hidden="true" />
          Analyse détaillée du mois en cours
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Données complètes pour {monthlyComparison.monthIdentifier}/
          {monthlyComparison.year}
        </p>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicateur</TableHead>
                  <TableHead className="text-center">Valeur</TableHead>
                  <TableHead className="text-center">
                    Évolution vs mois précédent
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTableData.map((row, index) => (
                  <TableRow key={`monthly-${index}`}>
                    <TableCell className="font-medium">
                      {row.indicator}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {row.isPercentage
                        ? formatPercentage(row.value)
                        : formatCurrency(row.value)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-medium ${getPerformanceColorClass(
                          row.value,
                          row.value - row.change,
                          'higher_better'
                        )}`}
                      >
                        {row.change > 0 ? '+' : ''}
                        {row.isPercentage
                          ? `${row.change.toFixed(1)}%`
                          : `${row.change.toFixed(1)}%`}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium">
                    Total réservations
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {getSafeValue(
                      databaseStatistics.databaseInfo.totalValidBookings
                    ).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    Réservations valides
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 4. Ventes manquées et Opportunités côte à côte */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                Ventes manquées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    getSafeValue(
                      databaseStatistics.thisMonth.missedSalesTTC?.amount
                    )
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getSafeValue(
                    databaseStatistics.thisMonth.missedSalesTTC?.count
                  )}{' '}
                  occasions manquées ce mois
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-navy flex items-center gap-2">
                <CheckCircle className="h-5 w-5" aria-hidden="true" />
                Opportunités disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    getSafeValue(
                      databaseStatistics.thisMonth.opportunityTTC?.amount
                    )
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getSafeValue(
                    databaseStatistics.thisMonth.opportunityTTC?.count
                  )}{' '}
                  créneaux libres à saisir
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
