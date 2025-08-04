import type { NextRequest } from 'next/server';

import {
  createCachedDashboardResponse,
  createDashboardErrorResponse,
  logDashboardEvent,
  measureExecutionTime,
} from '@/lib/dashboard-utils';
import {
  extractSearchParams,
  validateDashboardMetricsQuery,
} from '@/lib/validation';
import { fetchDashboardMetrics } from '@/services/dashboard.service';

// Re-export types pour compatibilité
export type {
  DashboardMetricsResponse,
  DashboardMetricsAttributes,
} from '@/types/dashboard';

/**
 * GET /api/dashboard/metrics
 * Récupère les métriques du dashboard pour une date et un actif donnés
 */

export async function GET(request: NextRequest) {
  return measureExecutionTime(async () => {
    try {
      // Extraire et valider les paramètres
      const searchParams = extractSearchParams(request.url);
      const validation = validateDashboardMetricsQuery(searchParams);

      if (!validation.success) {
        logDashboardEvent(
          'metrics_error',
          undefined,
          undefined,
          'Invalid parameters'
        );
        return createDashboardErrorResponse(
          'Invalid parameters',
          'Paramètres de requête invalides',
          validation.errors.errors
        );
      }

      const { date, actif } = validation.data;

      logDashboardEvent('metrics_request', actif, date);

      // Déléguer la logique au service
      const result = await fetchDashboardMetrics(date, actif);

      if (!result.success) {
        logDashboardEvent('metrics_error', actif, date, result.error.error);

        const status = result.error.error === 'Asset not found' ? 404 : 500;
        return createDashboardErrorResponse(
          result.error.error,
          result.error.message,
          result.error.details,
          status
        );
      }

      logDashboardEvent('metrics_success', actif, date);

      // Retourner la réponse avec cache
      return createCachedDashboardResponse(result.data);
    } catch (error) {
      console.error('Error in dashboard metrics API:', error);
      logDashboardEvent(
        'metrics_error',
        undefined,
        undefined,
        'Unexpected error'
      );

      return createDashboardErrorResponse(
        'Internal server error',
        'Une erreur inattendue est survenue',
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  }, 'Dashboard Metrics API');
}
