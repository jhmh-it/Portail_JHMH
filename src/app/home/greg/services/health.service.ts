/**
 * Service pour la vérification de santé de l'API JHMH
 */

import { jhmhApiClient, ERROR_MESSAGES } from '@/lib/jhmh-api';

/**
 * Réponse de l'endpoint de santé
 */
export interface HealthCheckResponse {
  status: string;
  message: string;
}

/**
 * Réponse standardisée du service de santé
 */
export interface HealthServiceResponse {
  success: boolean;
  healthy: boolean;
  message?: string;
  error?: string;
}

/**
 * Type pour le statut de santé
 */
export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown';

/**
 * Vérifie l'état de santé de l'API externe JHMH
 */
export async function checkJhmhApiHealth(): Promise<HealthServiceResponse> {
  try {
    const response = await jhmhApiClient.get<HealthCheckResponse>('/health');

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
