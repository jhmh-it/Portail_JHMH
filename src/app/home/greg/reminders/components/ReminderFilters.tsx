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
    status: string;
    userId: string;
  };
  onFiltersChange: (filters: { status: string; userId: string }) => void;
  onClose: () => void;
}

export function ReminderFilters({ filters, onFiltersChange, onClose }: Props) {
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
          <Label htmlFor="status-filter" className="text-xs">
            Statut
          </Label>
          <Select
            value={filters.status}
            onValueChange={value => handleFilterChange('status', value)}
          >
            <SelectTrigger
              id="status-filter"
              className="h-8 text-sm cursor-pointer mt-1"
            >
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tous les statuts
              </SelectItem>
              <SelectItem value="PENDING" className="cursor-pointer">
                En attente
              </SelectItem>
              <SelectItem value="COMPLETED" className="cursor-pointer">
                Terminé
              </SelectItem>
              <SelectItem value="CANCELLED" className="cursor-pointer">
                Annulé
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-0 max-w-[200px]">
          <Label htmlFor="user-filter" className="text-xs">
            Utilisateur
          </Label>
          <Select
            value={filters.userId}
            onValueChange={value => handleFilterChange('userId', value)}
          >
            <SelectTrigger
              id="user-filter"
              className="h-8 text-sm cursor-pointer mt-1"
            >
              <SelectValue placeholder="Tous les utilisateurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tous les utilisateurs
              </SelectItem>
              <SelectItem value="current" className="cursor-pointer">
                Mes rappels uniquement
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
