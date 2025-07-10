import { RefreshCw, Search, Loader2 } from 'lucide-react';

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
import type { Actif, FilterState } from '@/types/dashboard';

interface DashboardFiltersProps {
  filters: FilterState;
  actifs: Actif[];
  isLoadingActifs: boolean;
  isLoadingMetrics: boolean;
  actifsError?: Error | null;
  hasSearched: boolean;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onSearch: () => void;
}

export function DashboardFilters({
  filters,
  actifs,
  isLoadingActifs,
  isLoadingMetrics,
  actifsError,
  hasSearched,
  onFiltersChange,
  onSearch,
}: DashboardFiltersProps) {
  const handleActifChange = (value: string) => {
    onFiltersChange({ selectedActif: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onFiltersChange({ selectedDate: date });
    }
  };

  // Fonction pour déterminer la couleur selon le type d'actif
  const getActifColor = (type: Actif['type']) => {
    switch (type) {
      case 'global':
        return 'bg-blue-500';
      case 'property':
        return 'bg-green-500';
      case 'zone':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-navy flex items-center gap-2">
          <Search className="h-5 w-5" aria-hidden="true" />
          Filtres de recherche
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sélecteur d'actif */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="actif-select">Actif</Label>
            <Select
              value={filters.selectedActif}
              onValueChange={handleActifChange}
              disabled={isLoadingActifs}
            >
              <SelectTrigger
                id="actif-select"
                className="w-full"
                aria-describedby={actifsError ? 'actif-error' : undefined}
              >
                <div className="flex items-center gap-2 w-full">
                  {isLoadingActifs && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <SelectValue
                    placeholder={
                      isLoadingActifs
                        ? 'Chargement des actifs...'
                        : 'Choisir un actif'
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent>
                {isLoadingActifs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Chargement...
                    </span>
                  </div>
                ) : (
                  actifs.map(actif => (
                    <SelectItem key={actif.id} value={actif.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${getActifColor(actif.type)}`}
                          aria-hidden="true"
                        />
                        <span className="font-medium">{actif.label}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {actifsError && (
              <p id="actif-error" className="text-xs text-red-600" role="alert">
                Erreur de chargement des actifs
              </p>
            )}
          </div>

          {/* Sélecteur de date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="date-picker">Date de référence</Label>
            <DatePicker
              date={filters.selectedDate}
              onDateChange={handleDateChange}
              placeholder="Sélectionner une date"
              className="w-full"
              aria-describedby="date-help"
            />
            <p id="date-help" className="text-xs text-muted-foreground sr-only">
              Choisissez la date de référence pour l&apos;analyse
            </p>
          </div>

          {/* Bouton de recherche */}
          <div className="flex flex-col gap-2">
            <Label>&nbsp;</Label>
            <Button
              onClick={onSearch}
              className="bg-navy text-white hover:bg-navy/90"
              disabled={isLoadingMetrics}
              aria-describedby="search-help"
            >
              {isLoadingMetrics ? (
                <>
                  <RefreshCw
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Chargement...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  {hasSearched ? 'Actualiser' : 'Rechercher'}
                </>
              )}
            </Button>
            <p
              id="search-help"
              className="text-xs text-muted-foreground sr-only"
            >
              {hasSearched
                ? 'Actualiser les données avec les filtres actuels'
                : 'Lancer la recherche avec les filtres sélectionnés'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
