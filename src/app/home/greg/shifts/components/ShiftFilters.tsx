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
    spaceId: string;
  };
  onFiltersChange: (filters: { spaceId: string }) => void;
  onClose: () => void;
  spaces: Array<{
    space_id: string;
    space_name: string;
    type: string;
  }>;
}

export function ShiftFilters({
  filters,
  onFiltersChange,
  onClose,
  spaces,
}: Props) {
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
        <div className="max-w-[250px] min-w-0 flex-1">
          <Label htmlFor="space-filter" className="text-xs">
            Espace
          </Label>
          <Select
            value={filters.spaceId}
            onValueChange={value => handleFilterChange('spaceId', value)}
          >
            <SelectTrigger
              id="space-filter"
              className="mt-1 h-8 cursor-pointer text-sm"
            >
              <SelectValue placeholder="Tous les espaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                Tous les espaces
              </SelectItem>
              {spaces.map(space => (
                <SelectItem
                  key={space.space_id}
                  value={space.space_id}
                  className="cursor-pointer"
                >
                  {space.space_name} ({space.type === 'ROOM' ? 'Groupe' : 'DM'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
