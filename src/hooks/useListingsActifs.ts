import { useQuery, type QueryClient } from '@tanstack/react-query';

import type {
  ActifsFilters,
  ActifsResponse,
  UseActifsParams,
  UseActifsReturn,
} from '@/types/actifs';

// Query configuration
const QUERY_KEY = 'listings-actifs';
const STALE_TIME = 1 * 60 * 1000; // 1 minute
const GC_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const API_ENDPOINT = '/api/listings-actifs';

/**
 * Builds URLSearchParams from actifs filters
 */
function buildQueryParams(filters: ActifsFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Helper to add non-null params
  const addParam = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  };

  addParam('limit', filters.limit ?? filters.page_size);
  addParam(
    'offset',
    filters.offset ?? ((filters.page ?? 1) - 1) * (filters.page_size ?? 20)
  );
  addParam('code_site', filters.code_site);
  addParam('type_logement', filters.type_logement);
  addParam('order_by', filters.order_by);
  addParam('order_direction', filters.order_direction);
  addParam('q', filters.q);
  addParam('superficie_min', filters.superficie_min);
  addParam('superficie_max', filters.superficie_max);
  addParam('date_ouverture_from', filters.date_ouverture_from);
  addParam('date_ouverture_to', filters.date_ouverture_to);

  return params;
}

/**
 * Fetches listings actifs from the API
 */
async function fetchListingsActifs(
  filters: ActifsFilters
): Promise<ActifsResponse> {
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
    throw new Error(result.error ?? 'Failed to fetch listings actifs');
  }

  return result.data;
}

/**
 * Hook personnalisé pour gérer les listings actifs détaillés
 */
export function useListingsActifs({
  filters = {},
  enabled = true,
}: UseActifsParams = {}): UseActifsReturn {
  const query = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => fetchListingsActifs(filters),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled,
    retry: MAX_RETRY_ATTEMPTS,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
 * Prefetch listings actifs data for performance optimization
 */
export function prefetchListingsActifs(
  queryClient: QueryClient,
  filters: ActifsFilters = {}
): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => fetchListingsActifs(filters),
    staleTime: STALE_TIME,
  });
}

/**
 * Invalidate listings actifs cache to force refetch
 */
export function invalidateListingsActifs(
  queryClient: QueryClient
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: [QUERY_KEY],
  });
}
