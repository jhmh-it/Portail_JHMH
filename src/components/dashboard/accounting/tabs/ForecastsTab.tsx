import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

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
  getSafeValue,
  calculateAchievementRate,
} from '@/lib/dashboard-utils';
import type { DashboardMetrics } from '@/types/dashboard';

interface ForecastsTabProps {
  metrics: DashboardMetrics;
}

export function ForecastsTab({ metrics }: ForecastsTabProps) {
  const { databaseStatistics, forecast } = metrics;

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

  return (
    <div className="space-y-6">
      {/* 1. Opportunités et risques */}
      <section>
        <h2 className="text-xl font-semibold text-navy mb-4">
          Opportunités et risques
        </h2>
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

      {/* 2. Prévisions et Scénarios 2025 */}
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
    </div>
  );
}
