import axios, { type AxiosError, type AxiosInstance } from 'axios';

// Configuration constants
const JHMH_API_BASE_URL = process.env.JHMH_API_BASE_URL;
const JHMH_API_KEY = process.env.JHMH_API_KEY ?? '';
const API_TIMEOUT = 10000; // 10 seconds

// Error messages
const ERROR_MESSAGES = {
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur - Veuillez réessayer plus tard',
  TIMEOUT: 'Timeout - La requête a pris trop de temps',
  NETWORK_ERROR: 'Erreur réseau - Vérifiez votre connexion',
  UNKNOWN: 'Erreur inconnue',
} as const;

/**
 * Creates and configures an Axios instance for JHMH API
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: JHMH_API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor for logging and auth
  client.interceptors.request.use(
    config => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[JHMH API] ${config.method?.toUpperCase()} ${config.url}`
        );
      }
      return config;
    },
    error => {
      console.error('[JHMH API] Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    response => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[JHMH API] Response ${response.status} from ${response.config.url}`
        );
      }
      return response;
    },
    (error: AxiosError) => {
      const customError = handleApiError(error);
      return Promise.reject(customError);
    }
  );

  return client;
}

/**
 * Handles API errors and returns standardized error messages
 */
function handleApiError(error: AxiosError): Error {
  console.error('[JHMH API] Response error:', {
    status: error.response?.status,
    message: error.message,
    url: error.config?.url,
  });

  // Map error status to user-friendly messages
  if (error.response?.status === 404) {
    error.message = ERROR_MESSAGES.NOT_FOUND;
  } else if (error.response?.status && error.response.status >= 500) {
    error.message = ERROR_MESSAGES.SERVER_ERROR;
  } else if (error.code === 'ECONNABORTED') {
    error.message = ERROR_MESSAGES.TIMEOUT;
  } else if (!error.response) {
    error.message = ERROR_MESSAGES.NETWORK_ERROR;
  }

  return error;
}

/**
 * Axios client configured for JHMH external API
 */
export const jhmhApiClient = createApiClient();

/**
 * Types pour l'API JHMH
 */
export interface JhmhActif {
  id: string;
  label: string;
  description: string;
  type: 'global' | 'property' | 'zone';
  isActive: boolean;
}

export interface JhmhActifsResponse {
  success: boolean;
  data: JhmhActif[];
  meta?: {
    total: number;
    generatedAt: string;
  };
}

/**
 * Réponse brute de l'API externe (selon swagger)
 */
type ExternalActifsResponse = string[]; // L'API retourne directement un array de strings

/**
 * Types pour les réservations
 */
export interface ExternalReservation {
  confirmationCode: string;
  guest_name: string | null;
  listing_name: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  status: string;
  ota: string;
  total_ttc?: number | null;
  currency?: string;
  nights?: number;
  number_of_guests?: number | null;
  reportGenerationTimestamp?: string | null;
}

export interface ExternalReservationsResponse {
  data: ExternalReservation[];
  error: boolean;
  message: string;
  meta: {
    filters_applied: Record<string, string | number | undefined>;
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  timestamp: string;
}

/**
 * Builds API headers with authentication
 */
function getApiHeaders(): Record<string, string> {
  return {
    'x-api-key': JHMH_API_KEY,
  };
}

/**
 * Service pour récupérer les actifs depuis l'API JHMH
 */
export async function fetchJhmhActifs(): Promise<JhmhActifsResponse> {
  try {
    const response = await jhmhApiClient.get<ExternalActifsResponse>('/actifs');

    // Validate response format
    if (!Array.isArray(response.data)) {
      throw new Error('API response is not an array');
    }

    // Transform strings to structured objects
    const transformedActifs: JhmhActif[] =
      response.data.map(transformActifString);

    return {
      success: true,
      data: transformedActifs,
      meta: {
        total: transformedActifs.length,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching JHMH actifs:', error);

    return {
      success: false,
      data: [],
      meta: {
        total: 0,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * Transforms a string actif name to a structured JhmhActif object
 */
function transformActifString(actifName: string): JhmhActif {
  return {
    id: actifName,
    label: actifName,
    description: `Actif ${actifName}`,
    type: actifName.toLowerCase() === 'global' ? 'global' : 'property',
    isActive: true,
  };
}

/**
 * Builds query parameters for reservations endpoint
 */
function buildReservationQueryParams(params?: {
  page?: number;
  page_size?: number;
  checkinDateFrom?: string;
  checkinDateTo?: string;
  status?: string;
  ota?: string;
  q?: string;
}): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size)
    queryParams.append('page_size', params.page_size.toString());
  if (params?.checkinDateFrom)
    queryParams.append('checkin_date_from', params.checkinDateFrom);
  if (params?.checkinDateTo)
    queryParams.append('checkin_date_to', params.checkinDateTo);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.ota) queryParams.append('ota', params.ota);
  if (params?.q) queryParams.append('q', params.q);

  return queryParams;
}

/**
 * Service pour récupérer les réservations depuis l'API JHMH
 */
export async function fetchJhmhReservations(params?: {
  page?: number;
  page_size?: number;
  checkinDateFrom?: string;
  checkinDateTo?: string;
  status?: string;
  ota?: string;
  q?: string;
}): Promise<{
  success: boolean;
  data: ExternalReservation[];
  total: number;
  error?: string;
}> {
  try {
    const queryParams = buildReservationQueryParams(params);
    const queryString = queryParams.toString();
    const url = `/reservations${queryString ? `?${queryString}` : ''}`;

    const response = await jhmhApiClient.get<ExternalReservationsResponse>(
      url,
      { headers: getApiHeaders() }
    );

    return {
      success: true,
      data: response.data.data ?? [],
      total: response.data.meta?.total ?? 0,
    };
  } catch (error) {
    console.error('Error fetching JHMH reservations:', error);

    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
    };
  }
}

/**
 * Service pour récupérer une réservation spécifique par son code
 */
export async function fetchJhmhReservationByCode(
  confirmationCode: string
): Promise<{
  success: boolean;
  data: ExternalReservation | null;
  error?: string;
}> {
  try {
    const response = await jhmhApiClient.get<ExternalReservation>(
      `/reservations/${confirmationCode}`,
      { headers: getApiHeaders() }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching JHMH reservation by code:', error);

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        success: false,
        data: null,
        error: 'Réservation non trouvée',
      };
    }

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
    };
  }
}
