'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';

import type {
  ReservationFilters,
  ReservationsResponse,
  UseReservationsParams,
  UseReservationsReturn,
} from '@/types/reservation';

// Constants
const QUERY_KEY = 'reservations' as const;
const STALE_TIME = 1 * 60 * 1000; // 1 minute
const GC_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const API_ENDPOINT = '/api/reservations';

/**
 * Builds URLSearchParams from reservation filters
 */
function buildQueryParams(filters: ReservationFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Helper to add non-null params
  const addParam = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  };

  addParam('page', filters.page);
  addParam('page_size', filters.page_size);
  addParam('checkinDateFrom', filters.checkinDateFrom);
  addParam('checkinDateTo', filters.checkinDateTo);
  addParam('checkoutDateFrom', filters.checkoutDateFrom);
  addParam('checkoutDateTo', filters.checkoutDateTo);
  addParam('status', filters.status);
  addParam('ota', filters.ota);
  addParam('q', filters.q);
  addParam('amountMin', filters.amountMin);
  addParam('amountMax', filters.amountMax);
  addParam('nightsMin', filters.nightsMin);
  addParam('nightsMax', filters.nightsMax);
  addParam('guestsMin', filters.guestsMin);
  addParam('guestsMax', filters.guestsMax);
  addParam('currency', filters.currency);

  return params;
}

/**
 * Fetches reservations from the API
 */
async function fetchReservations(
  filters: ReservationFilters
): Promise<ReservationsResponse> {
  const params = buildQueryParams(filters);
  const queryString = params.toString();
  const url = `${API_ENDPOINT}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(
      errorData.message ?? `HTTP error! status: ${response.status}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error ?? 'Failed to fetch reservations');
  }

  return result.data;
}

/**
 * Hook personnalisé pour gérer les réservations
 */
export function useReservations({
  filters = {},
  enabled = true,
}: UseReservationsParams = {}): UseReservationsReturn {
  const query = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => fetchReservations(filters),
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < MAX_RETRY_ATTEMPTS;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isError: query.isError,
  };
}

/**
 * Prefetches reservations data
 * @param queryClient - TanStack Query client instance
 * @param filters - Optional reservation filters
 */
export async function prefetchReservations(
  queryClient: QueryClient,
  filters: ReservationFilters = {}
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => fetchReservations(filters),
    staleTime: STALE_TIME,
  });
}
