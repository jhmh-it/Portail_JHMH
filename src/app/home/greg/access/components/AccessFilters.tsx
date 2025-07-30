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
          <Label htmlFor="space-type" className="text-xs">
            Type d&apos;espace
          </Label>
          <Select
            value={filters.spaceType}
            onValueChange={value => handleFilterChange('spaceType', value)}
          >
            <SelectTrigger
              id="space-type"
              className="h-8 text-sm cursor-pointer mt-1"
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

        <div className="flex-1 min-w-0 max-w-[200px]">
          <Label htmlFor="document-type" className="text-xs">
            Type de document
          </Label>
          <Select
            value={filters.documentType}
            onValueChange={value => handleFilterChange('documentType', value)}
          >
            <SelectTrigger
              id="document-type"
              className="h-8 text-sm cursor-pointer mt-1"
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

        <div className="flex-1 min-w-0 max-w-[180px]">
          <Label htmlFor="date-range" className="text-xs">
            Période
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={value => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger
              id="date-range"
              className="h-8 text-sm cursor-pointer mt-1"
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
