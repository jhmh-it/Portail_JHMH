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
 * Builds API headers with authentication
 */
function getApiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': JHMH_API_KEY,
  };
}

/**
 * Creates and configures an Axios instance for JHMH API
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: JHMH_API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: getApiHeaders(),
  });

  // Request interceptor for logging and auth
  client.interceptors.request.use(
    config => {
      // Ensure x-api-key is always present
      if (config.headers) {
        config.headers['x-api-key'] = JHMH_API_KEY;
      }

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
 * Types pour les listings actifs détaillés
 */
export interface ExternalListingActif {
  code_site: string;
  date_ouverture: string;
  id_opening: string;
  listing_complet: string;
  numero_mairie: string;
  superficie_m2: number | null;
  type_logement: string;
}

/**
 * Service pour récupérer les actifs depuis l'API JHMH
 */
export async function fetchJhmhActifs(): Promise<JhmhActifsResponse> {
  try {
    // Using the correct endpoint from swagger: /api/assets/actifs
    const response =
      await jhmhApiClient.get<ExternalActifsResponse>('/api/assets/actifs');

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
  checkoutDateFrom?: string;
  checkoutDateTo?: string;
  status?: string;
  ota?: string;
  q?: string;
  amountMin?: number;
  amountMax?: number;
  nightsMin?: number;
  nightsMax?: number;
  guestsMin?: number;
  guestsMax?: number;
  currency?: string;
}): URLSearchParams {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size)
    queryParams.append('page_size', params.page_size.toString());
  if (params?.checkinDateFrom)
    queryParams.append('checkin_date_from', params.checkinDateFrom);
  if (params?.checkinDateTo)
    queryParams.append('checkin_date_to', params.checkinDateTo);
  if (params?.checkoutDateFrom)
    queryParams.append('checkout_date_from', params.checkoutDateFrom);
  if (params?.checkoutDateTo)
    queryParams.append('checkout_date_to', params.checkoutDateTo);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.ota) queryParams.append('ota', params.ota);
  if (params?.q) queryParams.append('q', params.q);
  if (params?.amountMin)
    queryParams.append('amount_min', params.amountMin.toString());
  if (params?.amountMax)
    queryParams.append('amount_max', params.amountMax.toString());
  if (params?.nightsMin)
    queryParams.append('nights_min', params.nightsMin.toString());
  if (params?.nightsMax)
    queryParams.append('nights_max', params.nightsMax.toString());
  if (params?.guestsMin)
    queryParams.append('guests_min', params.guestsMin.toString());
  if (params?.guestsMax)
    queryParams.append('guests_max', params.guestsMax.toString());
  if (params?.currency) queryParams.append('currency', params.currency);

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
  checkoutDateFrom?: string;
  checkoutDateTo?: string;
  status?: string;
  ota?: string;
  q?: string;
  amountMin?: number;
  amountMax?: number;
  nightsMin?: number;
  nightsMax?: number;
  guestsMin?: number;
  guestsMax?: number;
  currency?: string;
}): Promise<{
  success: boolean;
  data: ExternalReservation[];
  total: number;
  error?: string;
}> {
  try {
    const queryParams = buildReservationQueryParams(params);
    const queryString = queryParams.toString();
    // Adding /api/ prefix to the URL
    const url = `/api/reservations${queryString ? `?${queryString}` : ''}`;

    const response = await jhmhApiClient.get<ExternalReservationsResponse>(url);

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
    // Adding /api/ prefix to the URL
    const response = await jhmhApiClient.get<ExternalReservation>(
      `/api/reservations/${confirmationCode}`
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

/**
 * Service pour récupérer les listings actifs depuis l'API JHMH
 */
export async function fetchJhmhListingsActifs(params?: {
  limit?: number;
  offset?: number;
  code_site?: string;
  type_logement?: string;
  order_by?: string;
  order_direction?: string;
  q?: string;
  superficie_min?: number;
  superficie_max?: number;
  date_ouverture_from?: string;
  date_ouverture_to?: string;
}): Promise<{
  success: boolean;
  data: ExternalListingActif[];
  total: number;
  error?: string;
}> {
  try {
    const queryParams = new URLSearchParams();

    // Note: On ne passe plus limit/offset à l'API externe
    // On récupère tout et on pagine côté client

    // Filtres de base
    if (params?.code_site) queryParams.append('code_site', params.code_site);
    if (params?.type_logement)
      queryParams.append('type_logement', params.type_logement);
    if (params?.order_by) queryParams.append('order_by', params.order_by);
    if (params?.order_direction)
      queryParams.append('order_direction', params.order_direction);

    // Filtres supplémentaires (si l'API les supporte)
    if (params?.q) queryParams.append('q', params.q);
    if (params?.superficie_min)
      queryParams.append('superficie_min', params.superficie_min.toString());
    if (params?.superficie_max)
      queryParams.append('superficie_max', params.superficie_max.toString());
    if (params?.date_ouverture_from)
      queryParams.append('date_ouverture_from', params.date_ouverture_from);
    if (params?.date_ouverture_to)
      queryParams.append('date_ouverture_to', params.date_ouverture_to);

    const queryString = queryParams.toString();
    const url = `/api/assets/listings-actifs${queryString ? `?${queryString}` : ''}`;

    const response = await jhmhApiClient.get<ExternalListingActif[]>(url);

    // Récupérer tous les actifs, le total réel est la longueur complète
    return {
      success: true,
      data: response.data ?? [],
      total: response.data?.length ?? 0, // Maintenant c'est le vrai total
    };
  } catch (error) {
    console.error('Error fetching JHMH listings actifs:', error);

    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
    };
  }
}

/**
 * Vérifie l'état de santé de l'API externe JHMH
 */
export async function checkJhmhApiHealth(): Promise<{
  success: boolean;
  healthy: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await jhmhApiClient.get<{
      status: string;
      message: string;
    }>('/health');

    const isHealthy = response.data?.status === 'healthy';

    return {
      success: true,
      healthy: isHealthy,
      message: response.data?.message || 'Health check completed',
    };
  } catch (error) {
    console.error('Error checking JHMH API health:', error);

    return {
      success: false,
      healthy: false,
      error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
    };
  }
}
