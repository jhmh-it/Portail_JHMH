'use client';

import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS, CACHE_CONFIG } from '../../config';
import { fetchDashboardMetrics } from '../services';
import type { DashboardMetricsResponse } from '../types';

interface UseDashboardMetricsProps {
  date: string;
  actif: string;
  enabled?: boolean;
}

interface UseDashboardMetricsReturn {
  data: DashboardMetricsResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export function useDashboardMetrics({
  date,
  actif,
  enabled = true,
}: UseDashboardMetricsProps): UseDashboardMetricsReturn {
  const query = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_METRICS({ date, actif }),
    queryFn: () => fetchDashboardMetrics({ date, actif }),
    enabled: enabled && !!date && !!actif,
    staleTime: CACHE_CONFIG.DASHBOARD_METRICS.staleTime,
    gcTime: CACHE_CONFIG.DASHBOARD_METRICS.gcTime,
    retry: (failureCount, error) => {
      // Ne pas retry si c'est une erreur 400 ou 404
      if (error.message.includes('400') || error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isError: query.isError,
  };
}
