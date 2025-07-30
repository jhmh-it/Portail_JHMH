'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  filters: {
    source_prefere: string;
    verbose: string;
  };
  onFiltersChange: (filters: {
    source_prefere: string;
    verbose: string;
  }) => void;
  onClose: () => void;
}

export function UserFilters({ filters, onFiltersChange, onClose }: Props) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-card animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filtres avancés</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 min-w-0 max-w-[200px]">
          <Label htmlFor="source-filter" className="text-xs">
            Source préférée
          </Label>
          <Select
            value={filters.source_prefere}
            onValueChange={value => handleFilterChange('source_prefere', value)}
          >
            <SelectTrigger
              id="source-filter"
              className="h-8 text-sm cursor-pointer mt-1"
            >
              <SelectValue placeholder="Toutes les sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Toutes les sources
              </SelectItem>
              <SelectItem value="web" className="cursor-pointer">
                Web
              </SelectItem>
              <SelectItem value="mobile" className="cursor-pointer">
                Mobile
              </SelectItem>
              <SelectItem value="api" className="cursor-pointer">
                API
              </SelectItem>
              <SelectItem value="desktop" className="cursor-pointer">
                Desktop
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-0 max-w-[200px]">
          <Label htmlFor="verbose-filter" className="text-xs">
            Mode verbose
          </Label>
          <Select
            value={filters.verbose}
            onValueChange={value => handleFilterChange('verbose', value)}
          >
            <SelectTrigger
              id="verbose-filter"
              className="h-8 text-sm cursor-pointer mt-1"
            >
              <SelectValue placeholder="Tous les modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tous les modes
              </SelectItem>
              <SelectItem value="true" className="cursor-pointer">
                Activé
              </SelectItem>
              <SelectItem value="false" className="cursor-pointer">
                Désactivé
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
