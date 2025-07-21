import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchReservationDetails } from '@/services/reservation-details.service';
import { useLoadingStore } from '@/stores/loading-store';
import type { ReservationDetailsQueryParams } from '@/types/reservation-details';

interface UseReservationDetailsOptions {
  confirmationCode: string;
  queryParams?: ReservationDetailsQueryParams;
}

export function useReservationDetails({
  confirmationCode,
  queryParams = { include_audit_note: true },
}: UseReservationDetailsOptions) {
  const { hideLoading } = useLoadingStore();

  // Close loading modal when component mounts
  useEffect(() => {
    hideLoading();
  }, [hideLoading]);

  const query = useQuery({
    queryKey: ['reservation-details', confirmationCode, queryParams],
    queryFn: () => fetchReservationDetails(confirmationCode, queryParams),
    enabled: !!confirmationCode,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (
        error instanceof Error &&
        error.message === 'Réservation non trouvée'
      ) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    reservation: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess && query.data?.success,
  };
}
