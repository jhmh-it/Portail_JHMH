import { useState, useCallback } from 'react';

import { formatDateForAPI } from '@/lib/dashboard-utils';
import type { FilterState } from '@/types/dashboard';

export function useDashboardState() {
  const [filters, setFilters] = useState<FilterState>({
    selectedDate: new Date(),
    selectedActif: 'global',
  });

  const [hasSearched, setHasSearched] = useState(false);

  const handleFiltersChange = useCallback(
    (newFilters: Partial<FilterState>) => {
      setFilters(prev => ({
        ...prev,
        ...newFilters,
      }));
    },
    []
  );

  const handleSearch = useCallback(() => {
    setHasSearched(true);
  }, []);

  const getAPIParams = useCallback(
    () => ({
      date: formatDateForAPI(filters.selectedDate),
      actif: filters.selectedActif,
      enabled: hasSearched,
    }),
    [filters.selectedDate, filters.selectedActif, hasSearched]
  );

  return {
    filters,
    hasSearched,
    handleFiltersChange,
    handleSearch,
    getAPIParams,
  };
}
