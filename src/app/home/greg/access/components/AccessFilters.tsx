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
    spaceType: string;
    documentType: string;
    dateRange: string;
  };
  onFiltersChange: (filters: {
    spaceType: string;
    documentType: string;
    dateRange: string;
  }) => void;
  onClose: () => void;
}

export function AccessFilters({ filters, onFiltersChange, onClose }: Props) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-card animate-in slide-in-from-top-2 rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
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

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end">
        <div className="max-w-[200px] min-w-0 flex-1">
          <Label htmlFor="space-type" className="text-xs">
            Type d&apos;espace
          </Label>
          <Select
            value={filters.spaceType}
            onValueChange={value => handleFilterChange('spaceType', value)}
          >
            <SelectTrigger
              id="space-type"
              className="mt-1 h-8 cursor-pointer text-sm"
            >
              <SelectValue placeholder="Tous les espaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tous les espaces
              </SelectItem>
              <SelectItem value="ROOM" className="cursor-pointer">
                Groupes uniquement
              </SelectItem>
              <SelectItem value="DM" className="cursor-pointer">
                DMs uniquement
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-w-[200px] min-w-0 flex-1">
          <Label htmlFor="document-type" className="text-xs">
            Type de document
          </Label>
          <Select
            value={filters.documentType}
            onValueChange={value => handleFilterChange('documentType', value)}
          >
            <SelectTrigger
              id="document-type"
              className="mt-1 h-8 cursor-pointer text-sm"
            >
              <SelectValue placeholder="Tous les documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tous les documents
              </SelectItem>
              <SelectItem value="pending" className="cursor-pointer">
                En attente de révision
              </SelectItem>
              <SelectItem value="approved" className="cursor-pointer">
                Approuvés
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="max-w-[180px] min-w-0 flex-1">
          <Label htmlFor="date-range" className="text-xs">
            Période
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={value => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger
              id="date-range"
              className="mt-1 h-8 cursor-pointer text-sm"
            >
              <SelectValue placeholder="Toute période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Toute période
              </SelectItem>
              <SelectItem value="today" className="cursor-pointer">
                Aujourd&apos;hui
              </SelectItem>
              <SelectItem value="week" className="cursor-pointer">
                Cette semaine
              </SelectItem>
              <SelectItem value="month" className="cursor-pointer">
                Ce mois
              </SelectItem>
              <SelectItem value="year" className="cursor-pointer">
                Cette année
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
