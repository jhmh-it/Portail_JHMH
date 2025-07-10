import { Euro, Calendar, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  createComparisonData,
} from '@/lib/dashboard-utils';
import type { DashboardMetrics } from '@/types/dashboard';

import { MetricCard, ComparisonTable, PerformanceCard } from '../index';

interface AnalysisTabProps {
  metrics: DashboardMetrics;
}

export function AnalysisTab({ metrics }: AnalysisTabProps) {
  const { databaseStatistics, monthlyComparison } = metrics;

  // Prix au m² - métriques (ordre chronologique : année précédente → mois précédent → mois actuel → moyenne)
  const sqmMetrics = [
    {
      title: monthlyComparison.sqmPriceHT.lastYearSameMonth.label,
      value: getSafeValue(monthlyComparison.sqmPriceHT.lastYearSameMonth.value),
      format: 'currency' as const,
      subtitle: 'Même mois année précédente',
    },
    {
      title: monthlyComparison.sqmPriceHT.lastMonth.label,
      value: getSafeValue(monthlyComparison.sqmPriceHT.lastMonth.value),
      format: 'currency' as const,
      subtitle: 'Mois précédent',
    },
    {
      title: `${monthlyComparison.monthIdentifier}/${monthlyComparison.year}`,
      value: getSafeValue(databaseStatistics.lastMonth.euroPerSquareMeterHT),
      format: 'currency' as const,
      subtitle: 'Mois actuel',
    },
    {
      title: 'Moyenne 12 mois',
      value: getSafeValue(monthlyComparison.sqmPriceHT.last12MonthAvgPerShab),
      format: 'currency' as const,
      subtitle: 'Prix au m² moyen',
    },
  ];

  // Données tendances hebdomadaires
  const weeklyTrendsData = [
    {
      period: 'Semaine dernière',
      identifier: databaseStatistics.lastWeek.weekIdentifier,
      revenue: getSafeValue(databaseStatistics.lastWeek.accommodationHT),
      occupancy: getSafeValue(databaseStatistics.lastWeek.occupancyPercentage),
      adr: getSafeValue(databaseStatistics.lastWeek.adrHT),
    },
    {
      period: 'Semaine actuelle',
      identifier: databaseStatistics.currentWeek.weekIdentifier,
      revenue: getSafeValue(
        databaseStatistics.currentWeek.accommodationHTExcludingCleaning
      ),
      occupancy: getSafeValue(
        databaseStatistics.currentWeek.occupancyPercentage
      ),
      adr: getSafeValue(databaseStatistics.currentWeek.adrHTIncludingCleaning),
      note: 'Hors nettoyage / Inclus nettoyage',
    },
    {
      period: 'Semaine prochaine',
      identifier: databaseStatistics.nextWeek.weekIdentifier,
      revenue: getSafeValue(databaseStatistics.nextWeek.accommodationHT),
      occupancy: getSafeValue(databaseStatistics.nextWeek.occupancyPercentage),
      adr: getSafeValue(databaseStatistics.nextWeek.adrHT),
    },
  ];

  // Données comparaisons détaillées revenus
  const revenueComparisonData = [
    createComparisonData(
      'Ce mois',
      getSafeValue(monthlyComparison.revenues.thisMonthAccommodationHT),
      getSafeValue(monthlyComparison.revenues.lastMonthAccommodationHT),
      'currency'
    ),
    createComparisonData(
      'Annulable',
      getSafeValue(
        monthlyComparison.revenues.thisMonthCancellableAccommodationHT
      ),
      0,
      'currency',
      'neutral'
    ),
    createComparisonData(
      'Année passée',
      getSafeValue(monthlyComparison.revenues.lastYearSameMonthAccommodationHT),
      getSafeValue(monthlyComparison.revenues.thisMonthAccommodationHT),
      'currency'
    ),
  ];

  // Données comparaisons détaillées nettoyage & ADR
  const cleaningAdrData = [
    {
      type: 'Nettoyage',
      thisMonth: getSafeValue(monthlyComparison.cleaning.thisMonthHT),
      lastYear: getSafeValue(monthlyComparison.cleaning.lastYearSameMonthHT),
      lastMonth: getSafeValue(monthlyComparison.cleaning.lastMonthHT),
      evolution: getSafeValue(monthlyComparison.cleaning.changePercentage),
    },
    {
      type: 'ADR',
      thisMonth: getSafeValue(monthlyComparison.adrHT.thisMonth),
      lastYear: getSafeValue(monthlyComparison.adrHT.lastYearSameMonth),
      lastMonth: getSafeValue(monthlyComparison.adrHT.lastMonth),
      evolution: getSafeValue(monthlyComparison.adrHT.changePercentage),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Prix au m² - Analyses comparatives */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <Euro className="h-5 w-5" aria-hidden="true" />
          Prix au m² - Analyses comparatives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sqmMetrics.map((metric, index) => (
            <MetricCard
              key={`sqm-${index}`}
              title={metric.title}
              value={metric.value}
              format={metric.format}
              subtitle={metric.subtitle}
              size="md"
            />
          ))}
        </div>
      </section>

      {/* 2. Tendances hebdomadaires */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5" aria-hidden="true" />
          Tendances hebdomadaires
        </h2>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Revenus hébergement</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>ADR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyTrendsData.map((week, index) => (
                  <TableRow key={`week-${index}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{week.period}</div>
                        <div className="text-sm text-muted-foreground">
                          {week.identifier}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(week.revenue)}
                      {week.note && (
                        <div className="text-xs text-muted-foreground">
                          {week.note.split(' / ')[0]}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={index === 1 ? 'default' : 'secondary'}>
                        {formatPercentage(week.occupancy)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(week.adr)}
                      {week.note && (
                        <div className="text-xs text-muted-foreground">
                          {week.note.split(' / ')[1]}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 3. Comparaisons détaillées */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-3 flex items-center gap-2">
          <Euro className="h-5 w-5" aria-hidden="true" />
          Comparaisons détaillées - {monthlyComparison.monthIdentifier}/
          {monthlyComparison.year}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Comparaisons revenus */}
          <ComparisonTable
            title="Revenus - Détail comparatif"
            data={revenueComparisonData}
            headers={{
              label: 'Période',
              current: 'Montant',
              previous: 'Référence',
              change: 'Évolution',
            }}
          />

          {/* Comparaisons nettoyage et ADR */}
          <Card>
            <CardHeader>
              <CardTitle className="text-navy text-base">
                Nettoyage & ADR - Évolutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cleaningAdrData.map((item, index) => (
                <div key={`cleaning-adr-${index}`}>
                  {index > 0 && <Separator className="my-4" />}
                  <h4 className="font-medium text-navy mb-2">
                    Services de {item.type.toLowerCase()}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ce mois</span>
                      <span className="font-medium">
                        {formatCurrency(item.thisMonth)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Année passée</span>
                      <span>{formatCurrency(item.lastYear)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mois précédent</span>
                      <span>{formatCurrency(item.lastMonth)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">Évolution</span>
                      <span className="font-medium">
                        {item.evolution > 0 ? '+' : ''}
                        {formatPercentage(item.evolution)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Opportunités et Projections */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
          Opportunités et Projections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PerformanceCard
            title="Opportunités restantes"
            mainMetric={{
              label: 'Potentiel de revenus supplémentaires disponible',
              value: getSafeValue(metrics.forecast.modifiedOpportunity2025),
              format: 'currency',
            }}
          />

          <PerformanceCard
            title="Projection tendancielle"
            mainMetric={{
              label: 'Extrapolation basée sur la performance actuelle',
              value: getSafeValue(metrics.forecast.proRataTemporis2025),
              format: 'currency',
            }}
          />
        </div>
      </section>
    </div>
  );
}
