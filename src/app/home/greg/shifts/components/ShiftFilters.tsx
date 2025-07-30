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
        <div className="flex-1 min-w-0 max-w-[250px]">
          <Label htmlFor="space-filter" className="text-xs">
            Espace
          </Label>
          <Select
            value={filters.spaceId}
            onValueChange={value => handleFilterChange('spaceId', value)}
          >
            <SelectTrigger
              id="space-filter"
              className="h-8 text-sm cursor-pointer mt-1"
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
