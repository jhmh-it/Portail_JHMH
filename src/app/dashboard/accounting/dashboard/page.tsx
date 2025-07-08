'use client';

import {
  Building2,
  Calendar,
  Euro,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Target,
  DollarSign,
  Zap,
  LineChart,
  ChartBar,
  ClipboardList,
} from 'lucide-react';
import * as React from 'react';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActifs } from '@/hooks/useActifs';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

export default function AccountingDashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedActif, setSelectedActif] = React.useState<string>('global');
  const [hasSearched, setHasSearched] = React.useState(false);

  const {
    actifs,
    isLoading: isLoadingActifs,
    error: actifsError,
  } = useActifs();

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const {
    data: metricsData,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics({
    date: formatDateForAPI(selectedDate),
    actif: selectedActif,
    enabled: hasSearched,
  });

  const breadcrumbs = [
    { label: 'Tableau de bord', href: '/dashboard' },
    { label: 'Accounting Tool', href: '/dashboard/accounting' },
    { label: 'Dashboard' },
  ];

  const handleSearch = () => {
    setHasSearched(true);
    if (hasSearched) {
      refetchMetrics();
    }
  };

  const renderFilters = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-navy flex items-center gap-2">
          <Search className="h-5 w-5" />
          Filtres de recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sélecteur d'actif */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="actif-select">Actif</Label>
            <Select
              value={selectedActif}
              onValueChange={setSelectedActif}
              disabled={isLoadingActifs}
            >
              <SelectTrigger id="actif-select" className="w-full">
                <SelectValue placeholder="Choisir un actif" />
              </SelectTrigger>
              <SelectContent>
                {actifs.map(actif => (
                  <SelectItem key={actif.id} value={actif.id}>
                    <div className="flex items-center gap-2">
                      {actif.type === 'global' ? (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      <span className="font-medium">{actif.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {actifsError && (
              <p className="text-xs text-red-600">
                Erreur de chargement des actifs
              </p>
            )}
          </div>

          {/* Sélecteur de date */}
          <div className="flex flex-col gap-2">
            <Label>Date de référence</Label>
            <DatePicker
              date={selectedDate}
              onDateChange={date => date && setSelectedDate(date)}
              placeholder="Sélectionner une date"
              className="w-full"
            />
          </div>

          {/* Bouton de recherche */}
          <div className="flex flex-col gap-2">
            <Label>&nbsp;</Label>
            <Button
              onClick={handleSearch}
              className="bg-navy text-white hover:bg-navy/90"
              disabled={isLoadingMetrics}
            >
              {isLoadingMetrics ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {hasSearched ? 'Actualiser' : 'Rechercher'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (!hasSearched) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-navy mb-2">
              Prêt à analyser vos données
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Sélectionnez un actif et une date de référence, puis cliquez sur
              &quot;Rechercher&quot; pour afficher les métriques comptables
              détaillées.
            </p>
          </div>
        </div>
      );
    }

    if (isLoadingMetrics) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map(
            skeletonId => (
              <Card key={skeletonId}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            )
          )}
        </div>
      );
    }

    if (metricsError) {
      return (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erreur de chargement :</strong> {metricsError.message}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearch}
              className="ml-4"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (!metricsData) {
      return null;
    }

    const metrics = metricsData.data.attributes;

    return (
      <div className="flex flex-col gap-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-3 mb-6 bg-gray-100 p-1">
            <TabsTrigger
              value="overview"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
            >
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger
              value="forecasts"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
            >
              Prévisions
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
            >
              Analyse
            </TabsTrigger>
            <TabsTrigger
              value="history"
              style={{
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              className="hover:bg-gray-50 data-[state=active]:!bg-[#0d1b3c] data-[state=active]:!text-white data-[state=active]:!border-[#0d1b3c]"
            >
              Historique
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Vue d'ensemble - Performance aujourd'hui → semaine → mois */}
          <TabsContent value="overview" className="space-y-6">
            {/* 1. Performance aujourd'hui */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Performance aujourd&apos;hui
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Occupation temps réel */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Occupation actuelle
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-navy">
                          {metrics.databaseStatistics.databaseInfo.totalActiveCheckedIns.percentage.toFixed(
                            1
                          )}
                          %
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {
                            metrics.databaseStatistics.databaseInfo
                              .totalActiveCheckedIns.count
                          }{' '}
                          /{' '}
                          {
                            metrics.databaseStatistics.databaseInfo
                              .totalActiveCheckedIns.outOf
                          }
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unités occupées en temps réel
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Check-ins du jour */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Check-ins
                      </h3>
                      <div className="text-2xl font-bold text-navy">
                        {metrics.databaseStatistics.todayBusiness.checkInsToday}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Arrivées prévues aujourd&apos;hui
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Check-outs du jour */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Check-outs
                      </h3>
                      <div className="text-2xl font-bold text-navy">
                        {
                          metrics.databaseStatistics.todayBusiness
                            .checkOutsToday
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Départs prévus aujourd&apos;hui
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 2. Performance semaine avec comparaisons */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance cette semaine (
                {metrics.databaseStatistics.currentWeek.weekIdentifier})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Revenus avec comparaison */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Revenus hébergement
                      </h3>
                      <div className="text-2xl font-bold text-navy">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(
                          metrics.databaseStatistics.currentWeek
                            .accommodationHTExcludingCleaning ?? 0
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium flex items-center gap-1 ${
                            (metrics.databaseStatistics.currentWeek
                              .accommodationHTExcludingCleaning ?? 0) >
                            (metrics.databaseStatistics.lastWeek
                              .accommodationHT ?? 0)
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {(metrics.databaseStatistics.currentWeek
                            .accommodationHTExcludingCleaning ?? 0) >
                          (metrics.databaseStatistics.lastWeek
                            .accommodationHT ?? 0) ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {(
                            (((metrics.databaseStatistics.currentWeek
                              .accommodationHTExcludingCleaning ?? 0) -
                              (metrics.databaseStatistics.lastWeek
                                .accommodationHT ?? 0)) /
                              (metrics.databaseStatistics.lastWeek
                                .accommodationHT ?? 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs semaine dernière
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Occupation avec comparaison */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Occupation
                      </h3>
                      <div className="text-2xl font-bold text-navy">
                        {
                          metrics.databaseStatistics.currentWeek
                            .occupancyPercentage
                        }
                        %
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium flex items-center gap-1 ${
                            metrics.databaseStatistics.currentWeek
                              .occupancyPercentage >
                            metrics.databaseStatistics.lastWeek
                              .occupancyPercentage
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {metrics.databaseStatistics.currentWeek
                            .occupancyPercentage >
                          metrics.databaseStatistics.lastWeek
                            .occupancyPercentage ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {(
                            metrics.databaseStatistics.currentWeek
                              .occupancyPercentage -
                            metrics.databaseStatistics.lastWeek
                              .occupancyPercentage
                          ).toFixed(1)}{' '}
                          pts
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs semaine dernière
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ADR avec comparaison */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        ADR
                      </h3>
                      <div className="text-2xl font-bold text-navy">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(
                          metrics.databaseStatistics.currentWeek
                            .adrHTIncludingCleaning ?? 0
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium flex items-center gap-1 ${
                            (metrics.databaseStatistics.currentWeek
                              .adrHTIncludingCleaning ?? 0) >
                            (metrics.databaseStatistics.lastWeek
                              .adrHTIncludingCleaning ?? 0)
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {(metrics.databaseStatistics.currentWeek
                            .adrHTIncludingCleaning ?? 0) >
                          (metrics.databaseStatistics.lastWeek
                            .adrHTIncludingCleaning ?? 0) ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {(
                            (((metrics.databaseStatistics.currentWeek
                              .adrHTIncludingCleaning ?? 0) -
                              (metrics.databaseStatistics.lastWeek
                                .adrHTIncludingCleaning ?? 0)) /
                              (metrics.databaseStatistics.lastWeek
                                .adrHTIncludingCleaning ?? 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs semaine dernière
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 3. Analyse détaillée du mois - Tableau */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                Analyse détaillée du mois en cours
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Données complètes pour{' '}
                {metrics.monthlyComparison.monthIdentifier}/
                {metrics.monthlyComparison.year}
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
                      <TableRow>
                        <TableCell className="font-medium">
                          Revenus hébergement
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.thisMonth.accommodationHT
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${metrics.monthlyComparison.revenues.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {metrics.monthlyComparison.revenues
                              .changePercentage > 0
                              ? '+'
                              : ''}
                            {metrics.monthlyComparison.revenues.changePercentage.toFixed(
                              1
                            )}
                            %
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Revenus nettoyage
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.thisMonth.cleaningHT
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${metrics.monthlyComparison.cleaning.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {metrics.monthlyComparison.cleaning
                              .changePercentage > 0
                              ? '+'
                              : ''}
                            {metrics.monthlyComparison.cleaning.changePercentage.toFixed(
                              1
                            )}
                            %
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Taux d&apos;occupation
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {metrics.databaseStatistics.thisMonth.occupancyRatePercentage.toFixed(
                            1
                          )}
                          %
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${metrics.databaseStatistics.thisMonth.occupancyRatePercentage - metrics.databaseStatistics.lastMonth.occupancyRatePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {metrics.databaseStatistics.thisMonth
                              .occupancyRatePercentage -
                              metrics.databaseStatistics.lastMonth
                                .occupancyRatePercentage >
                            0
                              ? '+'
                              : ''}
                            {(
                              metrics.databaseStatistics.thisMonth
                                .occupancyRatePercentage -
                              metrics.databaseStatistics.lastMonth
                                .occupancyRatePercentage
                            ).toFixed(1)}
                            %
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">ADR moyen</TableCell>
                        <TableCell className="text-center font-bold">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(metrics.databaseStatistics.thisMonth.adrHT)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${metrics.monthlyComparison.adrHT.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {metrics.monthlyComparison.adrHT.changePercentage >
                            0
                              ? '+'
                              : ''}
                            {metrics.monthlyComparison.adrHT.changePercentage.toFixed(
                              1
                            )}
                            %
                          </span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Total réservations
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {new Intl.NumberFormat('fr-FR').format(
                            metrics.databaseStatistics.databaseInfo
                              .totalValidBookings
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          Réservations valides
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* 4. Ventes manquées et Opportunités côte à côte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Ventes manquées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-red-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(
                        metrics.databaseStatistics.thisMonth.missedSalesTTC
                          ?.amount ?? 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metrics.databaseStatistics.thisMonth.missedSalesTTC
                        ?.count ?? 0}{' '}
                      occasions manquées ce mois
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-navy flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Opportunités disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-green-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(
                        metrics.databaseStatistics.thisMonth.opportunityTTC
                          ?.amount ?? 0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metrics.databaseStatistics.thisMonth.opportunityTTC
                        ?.count ?? 0}{' '}
                      créneaux libres à saisir
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: Prévisions - Objectifs et forecasts */}
          <TabsContent value="forecasts" className="space-y-6">
            {/* Scénarios détaillés pour le mois de pointe */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scénarios pour le mois de{' '}
                {metrics.forecast.maximums.monthIdentifier}/
                {metrics.forecast.maximums.year}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Analyse détaillée du potentiel pour le mois de pointe identifié
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carte du maximum théorique */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Maximum théorique mensuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-navy mb-2">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.forecast.maximums
                              .maxTheoreticalAccommodation
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenus possibles avec{' '}
                          {metrics.forecast.maximums.maxOccupationPercentage}%
                          d&apos;occupation
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Occupation optimale
                          </span>
                          <Badge className="bg-green-100 text-green-800">
                            {metrics.forecast.maximums.maxOccupationPercentage}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Mois cible
                          </span>
                          <Badge variant="outline">
                            {metrics.forecast.maximums.monthIdentifier}/
                            {metrics.forecast.maximums.year}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Carte du mois prochain */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Prévision mois prochain
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-navy mb-2">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.nextMonth.accommodationHT
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Prévision pour{' '}
                          {metrics.databaseStatistics.nextMonth.monthIdentifier}
                          /{metrics.databaseStatistics.nextMonth.year}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Occupation prévue
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {
                              metrics.databaseStatistics.nextMonth
                                .occupancyPercentage
                            }
                            %
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">ADR prévu</span>
                          <span className="text-sm font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.nextMonth.adrHT
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Nettoyage prévu
                          </span>
                          <span className="text-sm font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.nextMonth.cleaningHT
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tableau unifié des prévisions 2025 */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
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
                      {/* Objectif principal 2025 */}
                      <TableRow className="border-b-2 border-gray-200">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-navy flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Objectif annuel 2025
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Revenus hébergement cible -{' '}
                              {metrics.forecast.mixedModelForecast.occupancyPercentage.toFixed(
                                1
                              )}
                              % d&apos;occupation prévue
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.accommodationHT)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div className="font-medium">
                              {(
                                (metrics.forecast.realized2025 /
                                  metrics.forecast.accommodationHT) *
                                100
                              ).toFixed(1)}
                              % atteint
                            </div>
                            <div className="text-muted-foreground">
                              au{' '}
                              {new Date(
                                metrics.databaseStatistics.databaseInfo.lastUpdate
                              ).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Réalisé à date */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Revenus confirmés 2025
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Montant effectivement réalisé jusqu&apos;à présent
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.realized2025)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div className="text-green-600 font-medium">
                              +
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0,
                              }).format(
                                metrics.forecast.realized2025 -
                                  metrics.databaseStatistics.totalRevenues
                                    .totalAccommodationServicesHT
                              )}
                            </div>
                            <div className="text-muted-foreground">
                              vs 2024 total
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Opportunités restantes */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Opportunités disponibles
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Potentiel de revenus non encore réalisé
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.modifiedOpportunity2025)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div className="font-medium">
                              {(
                                (metrics.forecast.modifiedOpportunity2025 /
                                  metrics.forecast.accommodationHT) *
                                100
                              ).toFixed(1)}
                              % de l&apos;objectif
                            </div>
                            <div className="text-muted-foreground">
                              Reste à convertir
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Potentiel maximum théorique */}
                      <TableRow className="border-t-2 border-gray-100">
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Potentiel maximum théorique
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Si toutes les opportunités sont saisies
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.totalModifiedMaxed2025)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div className="font-medium">
                              +
                              {(
                                ((metrics.forecast.totalModifiedMaxed2025 -
                                  metrics.forecast.accommodationHT) /
                                  metrics.forecast.accommodationHT) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                            <div className="text-muted-foreground">
                              vs objectif
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Pro rata temporis */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <LineChart className="h-4 w-4" />
                              Projection tendancielle
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Extrapolation basée sur la performance actuelle
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.proRataTemporis2025)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <div className="font-medium">
                              {(
                                (metrics.forecast.proRataTemporis2025 /
                                  metrics.forecast.accommodationHT) *
                                100
                              ).toFixed(1)}
                              % de l&apos;objectif
                            </div>
                            <div className="text-muted-foreground">
                              Tendance actuelle
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline de réservations futures */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Pipeline de réservations futures
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Réservations futures confirmées"
                  value={
                    metrics.databaseStatistics.databaseInfo.totalFutureBookings
                  }
                  format="number"
                  subtitle="Réservations avec dates futures"
                  size="sm"
                />
                <MetricCard
                  title="Taux de conversion"
                  value={
                    (metrics.databaseStatistics.databaseInfo
                      .totalFutureBookings /
                      metrics.databaseStatistics.databaseInfo
                        .totalValidBookings) *
                    100
                  }
                  format="percentage"
                  subtitle="% du total des réservations"
                  size="sm"
                />
                <MetricCard
                  title="Performance vs 2024"
                  value={
                    metrics.databaseStatistics.yoy2025vs2024AsOfJune30
                      .percentage
                  }
                  format="percentage"
                  subtitle="Croissance année sur année"
                  size="sm"
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Analyse - Opportunités et tendances */}
          <TabsContent value="analysis" className="space-y-6">
            {/* 1. Prix au m² - Analyses comparatives */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Prix au m² - Analyses comparatives
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Moyenne 12 mois"
                  value={
                    metrics.monthlyComparison.sqmPriceHT.last12MonthAvgPerShab
                  }
                  format="currency"
                  subtitle="Prix au m² moyen"
                  size="sm"
                />
                <MetricCard
                  title={metrics.monthlyComparison.sqmPriceHT.lastMonth.label}
                  value={metrics.monthlyComparison.sqmPriceHT.lastMonth.value}
                  format="currency"
                  subtitle="Mois précédent"
                  size="sm"
                />
                <MetricCard
                  title={
                    metrics.monthlyComparison.sqmPriceHT.lastYearSameMonth.label
                  }
                  value={
                    metrics.monthlyComparison.sqmPriceHT.lastYearSameMonth.value
                  }
                  format="currency"
                  subtitle="Même mois année précédente"
                  size="sm"
                />
              </div>
            </div>

            {/* 2. Tendances hebdomadaires */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
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
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">Semaine dernière</div>
                            <div className="text-sm text-muted-foreground">
                              {
                                metrics.databaseStatistics.lastWeek
                                  .weekIdentifier
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(
                            metrics.databaseStatistics.lastWeek
                              .accommodationHT ?? 0
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {
                              metrics.databaseStatistics.lastWeek
                                .occupancyPercentage
                            }
                            %
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(
                            metrics.databaseStatistics.lastWeek.adrHT ?? 0
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">Semaine actuelle</div>
                            <div className="text-sm text-muted-foreground">
                              {
                                metrics.databaseStatistics.currentWeek
                                  .weekIdentifier
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(
                            metrics.databaseStatistics.currentWeek
                              .accommodationHTExcludingCleaning ?? 0
                          )}
                          <div className="text-xs text-muted-foreground">
                            Hors nettoyage
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {
                              metrics.databaseStatistics.currentWeek
                                .occupancyPercentage
                            }
                            %
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(
                            metrics.databaseStatistics.currentWeek
                              .adrHTIncludingCleaning ?? 0
                          )}
                          <div className="text-xs text-muted-foreground">
                            Inclus nettoyage
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">Semaine prochaine</div>
                            <div className="text-sm text-muted-foreground">
                              {
                                metrics.databaseStatistics.nextWeek
                                  .weekIdentifier
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(
                            metrics.databaseStatistics.nextWeek
                              .accommodationHT ?? 0
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {
                              metrics.databaseStatistics.nextWeek
                                .occupancyPercentage
                            }
                            %
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(
                            metrics.databaseStatistics.nextWeek.adrHT ?? 0
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* 3. Comparaisons détaillées */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-3 flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Comparaisons détaillées -{' '}
                {metrics.monthlyComparison.monthIdentifier}/
                {metrics.monthlyComparison.year}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Comparaisons revenus */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-base">
                      Revenus - Détail comparatif
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Période</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Évolution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Ce mois</div>
                            <div className="text-sm text-muted-foreground">
                              Mois {metrics.monthlyComparison.monthIdentifier}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(
                              metrics.monthlyComparison.revenues
                                .thisMonthAccommodationHT
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {metrics.monthlyComparison.revenues
                                .changePercentage > 0
                                ? '+'
                                : ''}
                              {metrics.monthlyComparison.revenues.changePercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Annulable</div>
                            <div className="text-sm text-muted-foreground">
                              Revenus annulables
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(
                              metrics.monthlyComparison.revenues
                                .thisMonthCancellableAccommodationHT
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">N/A</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Année passée</div>
                            <div className="text-sm text-muted-foreground">
                              Même mois 2024
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(
                              metrics.monthlyComparison.revenues
                                .lastYearSameMonthAccommodationHT
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Référence</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Mois précédent</div>
                            <div className="text-sm text-muted-foreground">
                              Comparaison séquentielle
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(
                              metrics.monthlyComparison.revenues
                                .lastMonthAccommodationHT
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Historique</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Comparaisons nettoyage et ADR */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-base">
                      Nettoyage & ADR - Évolutions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Nettoyage */}
                      <div>
                        <h4 className="font-medium text-navy mb-2">
                          Services de nettoyage
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Ce mois</span>
                            <span className="font-medium">
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(
                                metrics.monthlyComparison.cleaning.thisMonthHT
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Année passée</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(
                                metrics.monthlyComparison.cleaning
                                  .lastYearSameMonthHT
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Mois précédent</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(
                                metrics.monthlyComparison.cleaning.lastMonthHT
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium">
                              Évolution
                            </span>
                            <span className="font-medium">
                              {metrics.monthlyComparison.cleaning
                                .changePercentage > 0
                                ? '+'
                                : ''}
                              {metrics.monthlyComparison.cleaning.changePercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* ADR */}
                      <div>
                        <h4 className="font-medium text-navy mb-2">
                          ADR (Prix moyen)
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Ce mois</span>
                            <span className="font-medium">
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(
                                metrics.monthlyComparison.adrHT.thisMonth
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Année passée</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(
                                metrics.monthlyComparison.adrHT
                                  .lastYearSameMonth
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Mois précédent</span>
                            <span>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                              }).format(
                                metrics.monthlyComparison.adrHT.lastMonth
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium">
                              Évolution
                            </span>
                            <span className="font-medium">
                              {metrics.monthlyComparison.adrHT
                                .changePercentage > 0
                                ? '+'
                                : ''}
                              {metrics.monthlyComparison.adrHT.changePercentage.toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 4. Comparaison des performances temporelles */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparaison des performances temporelles
              </h2>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Indicateur</TableHead>
                        <TableHead className="text-center">
                          Même mois 2024
                        </TableHead>
                        <TableHead className="text-center">
                          Mois précédent
                        </TableHead>
                        <TableHead className="text-center">
                          Mois actuel
                        </TableHead>
                        <TableHead className="text-center">
                          Prévision{' '}
                          {metrics.databaseStatistics.nextMonth.monthIdentifier}
                          /{metrics.databaseStatistics.nextMonth.year}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Revenus hébergement */}
                      <TableRow>
                        <TableCell className="font-medium">
                          Revenus hébergement
                        </TableCell>
                        {(() => {
                          const val2024 =
                            metrics.databaseStatistics.sameMonthLastYear
                              .accommodationHT;
                          const valPrev =
                            metrics.databaseStatistics.lastMonth
                              .accommodationHT;
                          const valCurrent =
                            metrics.databaseStatistics.thisMonth
                              .accommodationHT;
                          const maxVal = Math.max(val2024, valPrev, valCurrent);
                          const minVal = Math.min(val2024, valPrev, valCurrent);

                          const getColorClass = (value: number) => {
                            if (value === maxVal)
                              return 'text-green-800 font-bold';
                            if (value === minVal)
                              return 'text-red-800 font-bold';
                            return 'text-foreground font-bold';
                          };

                          return (
                            <>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(val2024)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(val2024)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valPrev)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valPrev)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valCurrent)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valCurrent)}
                                </div>
                              </TableCell>
                            </>
                          );
                        })()}
                        <TableCell className="text-center">
                          <div className="text-blue-800 font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.nextMonth
                                .accommodationHT
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Taux d'occupation */}
                      <TableRow>
                        <TableCell className="font-medium">
                          Taux d&apos;occupation
                        </TableCell>
                        {(() => {
                          const val2024 =
                            metrics.databaseStatistics.sameMonthLastYear
                              .occupancyRatePercentage;
                          const valPrev =
                            metrics.databaseStatistics.lastMonth
                              .occupancyRatePercentage;
                          const valCurrent =
                            metrics.databaseStatistics.thisMonth
                              .occupancyRatePercentage;
                          const maxVal = Math.max(val2024, valPrev, valCurrent);
                          const minVal = Math.min(val2024, valPrev, valCurrent);

                          const getColorClass = (value: number) => {
                            if (value === maxVal)
                              return 'text-green-800 font-bold';
                            if (value === minVal)
                              return 'text-red-800 font-bold';
                            return 'text-foreground font-bold';
                          };

                          return (
                            <>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(val2024)}`}
                                >
                                  {val2024.toFixed(1)}%
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valPrev)}`}
                                >
                                  {valPrev.toFixed(1)}%
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valCurrent)}`}
                                >
                                  {valCurrent.toFixed(1)}%
                                </div>
                              </TableCell>
                            </>
                          );
                        })()}
                        <TableCell className="text-center">
                          <div className="text-blue-800 font-bold">
                            {metrics.databaseStatistics.nextMonth.occupancyPercentage.toFixed(
                              1
                            )}
                            %
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* ADR moyen */}
                      <TableRow>
                        <TableCell className="font-medium">ADR moyen</TableCell>
                        {(() => {
                          const val2024 =
                            metrics.databaseStatistics.sameMonthLastYear.adrHT;
                          const valPrev =
                            metrics.databaseStatistics.lastMonth.adrHT;
                          const valCurrent =
                            metrics.databaseStatistics.thisMonth.adrHT;
                          const maxVal = Math.max(val2024, valPrev, valCurrent);
                          const minVal = Math.min(val2024, valPrev, valCurrent);

                          const getColorClass = (value: number) => {
                            if (value === maxVal)
                              return 'text-green-800 font-bold';
                            if (value === minVal)
                              return 'text-red-800 font-bold';
                            return 'text-foreground font-bold';
                          };

                          return (
                            <>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(val2024)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(val2024)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valPrev)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valPrev)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valCurrent)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valCurrent)}
                                </div>
                              </TableCell>
                            </>
                          );
                        })()}
                        <TableCell className="text-center">
                          <div className="text-blue-800 font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.nextMonth.adrHT
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Services nettoyage */}
                      <TableRow>
                        <TableCell className="font-medium">
                          Services nettoyage
                        </TableCell>
                        {(() => {
                          const val2024 =
                            metrics.databaseStatistics.sameMonthLastYear
                              .cleaningHT;
                          const valPrev =
                            metrics.databaseStatistics.lastMonth.cleaningHT;
                          const valCurrent =
                            metrics.databaseStatistics.thisMonth.cleaningHT;
                          const maxVal = Math.max(val2024, valPrev, valCurrent);
                          const minVal = Math.min(val2024, valPrev, valCurrent);

                          // Pour les coûts, plus bas = mieux (logique inversée)
                          const getColorClass = (value: number) => {
                            if (value === minVal)
                              return 'text-green-800 font-bold';
                            if (value === maxVal)
                              return 'text-red-800 font-bold';
                            return 'text-foreground font-bold';
                          };

                          return (
                            <>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(val2024)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(val2024)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valPrev)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valPrev)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valCurrent)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valCurrent)}
                                </div>
                              </TableCell>
                            </>
                          );
                        })()}
                        <TableCell className="text-center">
                          <div className="text-blue-800 font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.nextMonth.cleaningHT
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Prix au m² */}
                      <TableRow>
                        <TableCell className="font-medium">
                          Prix au m²
                        </TableCell>
                        {(() => {
                          const val2024 =
                            metrics.databaseStatistics.sameMonthLastYear
                              .euroPerSquareMeterHT ?? 0;
                          const valPrev =
                            metrics.databaseStatistics.lastMonth
                              .euroPerSquareMeterHT ?? 0;
                          const valCurrent =
                            metrics.databaseStatistics
                              .euroPerSquareMeterHTLast12MonthAvg;
                          const maxVal = Math.max(val2024, valPrev, valCurrent);
                          const minVal = Math.min(val2024, valPrev, valCurrent);

                          // Pour les coûts, plus bas = mieux (logique inversée)
                          const getColorClass = (value: number) => {
                            if (value === minVal)
                              return 'text-green-800 font-bold';
                            if (value === maxVal)
                              return 'text-red-800 font-bold';
                            return 'text-foreground font-bold';
                          };

                          return (
                            <>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(val2024)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(val2024)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valPrev)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valPrev)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div
                                  className={`font-medium ${getColorClass(valCurrent)}`}
                                >
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0,
                                  }).format(valCurrent)}
                                </div>
                              </TableCell>
                            </>
                          );
                        })()}
                        <TableCell className="text-center">
                          <div className="text-blue-800 font-bold">N/A</div>
                        </TableCell>
                      </TableRow>
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
            </div>

            {/* 5. Synthèse Performance 2025 - Tableau unifié */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Synthèse Performance 2025
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Comparaison intelligente : Objectifs vs Réalisé vs Projections
                complètes
              </p>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Indicateur</TableHead>
                        <TableHead className="text-center">
                          Objectif 2025
                        </TableHead>
                        <TableHead className="text-center">
                          Réalisé à date
                        </TableHead>
                        <TableHead className="text-center">
                          Projection totale
                        </TableHead>
                        <TableHead className="text-center">
                          Écart vs objectif
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Revenus hébergement */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-semibold text-navy">
                              Revenus hébergement
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Performance principale
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-navy">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.accommodationHT)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cible annuelle
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.revenues.revenues.until
                                .totalAccommodationServicesHT
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(
                              (metrics.databaseStatistics.revenues.revenues
                                .until.totalAccommodationServicesHT /
                                metrics.forecast.accommodationHT) *
                              100
                            ).toFixed(1)}
                            % atteint
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.revenues.revenues
                                .totalAccommodationServicesHT
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Projection complète
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {((metrics.databaseStatistics.revenues.revenues
                              .totalAccommodationServicesHT -
                              metrics.forecast.accommodationHT) /
                              metrics.forecast.accommodationHT) *
                              100 >=
                            0
                              ? '+'
                              : ''}
                            {(
                              ((metrics.databaseStatistics.revenues.revenues
                                .totalAccommodationServicesHT -
                                metrics.forecast.accommodationHT) /
                                metrics.forecast.accommodationHT) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            vs objectif
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Services nettoyage */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              Services nettoyage
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Revenus annexes
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-muted-foreground">-</div>
                          <div className="text-xs text-muted-foreground">
                            Pas d&apos;objectif
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.revenues.revenues.until
                                .totalCleaningHT
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Réalisé
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.revenues.revenues
                                .totalCleaningHT
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total projeté
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-muted-foreground">N/A</div>
                        </TableCell>
                      </TableRow>

                      {/* Occupation */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              Taux d&apos;occupation
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Performance opérationnelle
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-navy">
                            {metrics.forecast.mixedModelForecast.occupancyPercentage.toFixed(
                              1
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cible prévue
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {metrics.databaseStatistics.revenues.revenues.until.occupancyPercentage.toFixed(
                              1
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Réalisé à date
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {metrics.databaseStatistics.revenues.revenues.until.occupancyPercentage.toFixed(
                              1
                            )}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Projection
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {metrics.databaseStatistics.revenues.revenues.until
                              .occupancyPercentage -
                              metrics.forecast.mixedModelForecast
                                .occupancyPercentage >=
                            0
                              ? '+'
                              : ''}
                            {(
                              metrics.databaseStatistics.revenues.revenues.until
                                .occupancyPercentage -
                              metrics.forecast.mixedModelForecast
                                .occupancyPercentage
                            ).toFixed(1)}{' '}
                            pts
                          </div>
                          <div className="text-xs text-muted-foreground">
                            vs objectif
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* ADR */}
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">ADR moyen</div>
                            <div className="text-sm text-muted-foreground">
                              Prix par réservation
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-muted-foreground">-</div>
                          <div className="text-xs text-muted-foreground">
                            Pas d&apos;objectif
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.revenues.revenues.until
                                .adrHT
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Réalisé
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(
                              metrics.databaseStatistics.revenues.revenues
                                .totalADR
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Moyen projeté
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-muted-foreground">N/A</div>
                        </TableCell>
                      </TableRow>

                      {/* Potentiel maximum */}
                      <TableRow className="border-t-2 border-gray-100">
                        <TableCell>
                          <div>
                            <div className="font-semibold text-navy">
                              Potentiel maximum
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Si tous objectifs atteints
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-navy">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.accommodationHT)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Base
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.realized2025)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Confirmé
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-green-600">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'EUR',
                              maximumFractionDigits: 0,
                            }).format(metrics.forecast.totalModifiedMaxed2025)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Potentiel théorique
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-bold text-green-600">
                            +
                            {(
                              ((metrics.forecast.totalModifiedMaxed2025 -
                                metrics.forecast.accommodationHT) /
                                metrics.forecast.accommodationHT) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Upside possible
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* 6. Opportunités restantes et Projection tendancielle */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Opportunités et Projections
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-base">
                      Opportunités restantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(metrics.forecast.modifiedOpportunity2025)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Potentiel de revenus supplémentaires disponible
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy text-base">
                      Projection tendancielle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-navy mb-2">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(metrics.forecast.proRataTemporis2025)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Extrapolation basée sur la performance actuelle
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Historique - Données de référence */}
          <TabsContent value="history" className="space-y-6">
            {/* Données de référence */}
            <div>
              <h2 className="text-xl font-semibold text-navy mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
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
                    {/* Informations principales - les plus importantes en premier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-navy mb-2">
                          Revenus totaux 2024
                        </h4>
                        <div className="text-2xl font-bold text-navy mb-1">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.totalRevenues
                              .totalAccommodationServicesHT
                          )}
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
                          {metrics.databaseStatistics.totalRevenues.occupancyPercentage.toFixed(
                            1
                          )}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Performance globale
                        </div>
                      </div>
                    </div>

                    {/* Informations secondaires */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">
                          ADR moyen
                        </h5>
                        <div className="text-lg font-semibold text-navy">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.totalRevenues.adr
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">
                          Services nettoyage
                        </h5>
                        <div className="text-lg font-semibold text-navy">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.totalRevenues
                              .totalCleaningHT
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performances historiques complètes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-navy">
                      Historique complet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Informations principales - totaux historiques les plus importants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-navy mb-2">
                          Total hébergement
                        </h4>
                        <div className="text-2xl font-bold text-navy mb-1">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.allTimesBookings
                              .totalAccommodationServicesHTToDate
                          )}
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
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.allTimesBookings
                              .totalCleaningHTToDate
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Services cumulés
                        </div>
                      </div>
                    </div>

                    {/* Information secondaire */}
                    <div className="pt-4 border-t">
                      <h5 className="text-xs font-medium text-muted-foreground mb-1">
                        ADR moyen historique
                      </h5>
                      <div className="text-lg font-semibold text-navy">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(
                          metrics.databaseStatistics.allTimesBookings.adr
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistiques de réservations */}
              <div className="mt-4">
                <h3 className="text-lg font-medium text-navy mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Statistiques de réservations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Total réservations valides"
                    value={
                      metrics.databaseStatistics.databaseInfo.totalValidBookings
                    }
                    format="number"
                    subtitle="Depuis le début"
                    size="sm"
                  />
                  <MetricCard
                    title="Réservations facturées"
                    value={
                      metrics.databaseStatistics.databaseInfo
                        .totalInvoicedBookings
                    }
                    format="number"
                    subtitle="Réservations traitées"
                    size="sm"
                  />
                  <MetricCard
                    title="No-shows"
                    value={
                      metrics.databaseStatistics.databaseInfo.includingNoShows
                    }
                    format="number"
                    subtitle="Réservations non honorées"
                    size="sm"
                  />
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
                    {/* Comparaison directe avec flèche */}
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
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.yoy2025vs2024AsOfJune30
                              .value2024
                          )}
                        </div>
                      </div>

                      {/* Flèche et croissance */}
                      <div className="flex-shrink-0 mx-8 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <TrendingUp className="h-6 w-6 text-navy" />
                        </div>
                        <div className="text-2xl font-bold text-navy">
                          +
                          {metrics.databaseStatistics.yoy2025vs2024AsOfJune30.percentage.toFixed(
                            1
                          )}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">
                          de croissance
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
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          }).format(
                            metrics.databaseStatistics.yoy2025vs2024AsOfJune30
                              .value2025
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Dashboard Accounting Tool
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances financières de vos actifs immobiliers avec
            des métriques détaillées et des comparaisons temporelles.
          </p>
        </div>

        {renderFilters()}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
}
