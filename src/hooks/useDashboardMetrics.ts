'use client';

import { useQuery } from '@tanstack/react-query';

import type { DashboardMetricsResponse } from '@/app/api/dashboard/metrics/route';

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
    queryKey: ['dashboard-metrics', date, actif],
    queryFn: async (): Promise<DashboardMetricsResponse> => {
      const params = new URLSearchParams({
        date,
        actif,
      });

      const response = await fetch(
        `/api/dashboard/metrics?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ?? `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    },
    enabled: enabled && !!date && !!actif,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
