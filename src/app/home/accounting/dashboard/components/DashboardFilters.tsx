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

import type { FilterState } from '../types/dashboard';

// Type temporaire pour Actif (provient du module exploitation)
interface Actif {
  id: string;
  label: string;
  type?: string;
}

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
        return 'bg-green-500';
      case 'property':
        return 'bg-blue-500';
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                <div className="flex w-full items-center gap-2">
                  {isLoadingActifs && (
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
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
            <p id="date-help" className="text-muted-foreground sr-only text-xs">
              Choisissez la date de référence pour l&apos;analyse
            </p>
          </div>

          {/* Bouton de recherche */}
          <div className="flex flex-col gap-2">
            <Label>&nbsp;</Label>
            <Button
              onClick={onSearch}
              className="bg-navy hover:bg-navy/90 text-white"
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
              className="text-muted-foreground sr-only text-xs"
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
