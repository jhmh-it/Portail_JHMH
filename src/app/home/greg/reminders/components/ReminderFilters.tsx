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
          <Label htmlFor="status-filter" className="text-xs">
            Statut
          </Label>
          <Select
            value={filters.status}
            onValueChange={value => handleFilterChange('status', value)}
          >
            <SelectTrigger
              id="status-filter"
              className="mt-1 h-8 cursor-pointer text-sm"
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

        <div className="max-w-[200px] min-w-0 flex-1">
          <Label htmlFor="user-filter" className="text-xs">
            Utilisateur
          </Label>
          <Select
            value={filters.userId}
            onValueChange={value => handleFilterChange('userId', value)}
          >
            <SelectTrigger
              id="user-filter"
              className="mt-1 h-8 cursor-pointer text-sm"
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
