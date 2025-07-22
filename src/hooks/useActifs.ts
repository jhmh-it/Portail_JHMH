'use client';

import { useQuery } from '@tanstack/react-query';

import type { JhmhActif } from '@/lib/external-api';

interface ActifsResponse {
  success: boolean;
  data: JhmhActif[];
  meta: {
    total: number;
    generatedAt: string;
  };
}

interface UseActifsReturn {
  actifs: JhmhActif[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}

export function useActifs(): UseActifsReturn {
  const query = useQuery({
    queryKey: ['actifs'],
    queryFn: async (): Promise<ActifsResponse> => {
      const response = await fetch('/api/actifs');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ?? `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (les actifs changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
  });

  return {
    actifs: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isError: query.isError,
  };
}
