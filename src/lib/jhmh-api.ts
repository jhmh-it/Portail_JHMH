/**
 * Client API JHMH consolidé - Configuration, client HTTP et services
 * Architecture feature-based : tout en un seul endroit pour simplicité
 */

import axios, { type AxiosError, type AxiosInstance } from 'axios';

// ==========================================
// 📋 CONFIGURATION ET CONSTANTES
// ==========================================

/**
 * Configuration API
 */
export const JHMH_API_CONFIG = {
  BASE_URL: process.env.JHMH_API_BASE_URL,
  API_KEY: process.env.JHMH_API_KEY ?? '',
  TIMEOUT: 10000, // 10 secondes
} as const;

/**
 * Messages d'erreur standardisés
 */
export const ERROR_MESSAGES = {
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur - Veuillez réessayer plus tard',
  TIMEOUT: 'Timeout - La requête a pris trop de temps',
  NETWORK_ERROR: 'Erreur réseau - Vérifiez votre connexion',
  UNKNOWN: 'Erreur inconnue',
} as const;

/**
 * Headers par défaut pour les requêtes API
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

// ==========================================
// 🔧 CLIENT HTTP CONFIGURÉ
// ==========================================

/**
 * Builds API headers with authentication
 */
function getApiHeaders(): Record<string, string> {
  return {
    ...DEFAULT_HEADERS,
    'x-api-key': JHMH_API_CONFIG.API_KEY,
  };
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
 * Creates and configures an Axios instance for JHMH API
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: JHMH_API_CONFIG.BASE_URL,
    timeout: JHMH_API_CONFIG.TIMEOUT,
    headers: getApiHeaders(),
  });

  // Request interceptor for logging and auth
  client.interceptors.request.use(
    config => {
      // Ensure x-api-key is always present
      if (config.headers) {
        config.headers['x-api-key'] = JHMH_API_CONFIG.API_KEY;
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

  // Response interceptor for error handling and data extraction
  client.interceptors.response.use(
    response => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[JHMH API] Response ${response.status} from ${response.config.url}`
        );
      }

      // Auto-extract data from standardized API response format
      // Évite les data.data.data en extrayant automatiquement
      if (response.data && typeof response.data === 'object') {
        // Si la réponse suit le format { success: true, data: [...] }
        if ('success' in response.data && 'data' in response.data) {
          if (!response.data.success) {
            throw new Error(response.data.error ?? 'API request failed');
          }
          // Ne pas déballer si des métadonnées sont présentes (ex: { meta: {...} })
          // afin de conserver les infos de pagination, totaux, etc.
          if (!('meta' in response.data)) {
            // Remplace response.data par response.data.data directement
            response.data = response.data.data;
          }
        }
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
 * Instance principale du client API JHMH
 * Utilisée par tous les services de l'application
 */
export const jhmhApiClient = createApiClient();

// ==========================================
// 📄 EXPORTS DE COMPATIBILITÉ
// ==========================================

// Pour maintenir la compatibilité avec les imports existants
export { JHMH_API_CONFIG as JHMH_API_CLIENT_CONFIG };
export { ERROR_MESSAGES as JHMH_ERROR_MESSAGES };
