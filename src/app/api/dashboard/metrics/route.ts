import type { NextRequest } from 'next/server';

import {
  createCachedDashboardResponse,
  createDashboardErrorResponse,
  logDashboardEvent,
  measureExecutionTime,
} from '@/app/home/accounting/dashboard/lib/dashboard-utils';
import { fetchDashboardMetrics } from '@/app/home/accounting/dashboard/services';
import {
  extractSearchParams,
  validateDashboardMetricsQuery,
} from '@/app/home/accounting/dashboard/validation';
import { logApiCall } from '@/lib/api-logger';

// Re-export types pour compatibilité
export type {
  DashboardMetricsResponse,
  DashboardMetrics as DashboardMetricsAttributes,
} from '@/app/home/accounting/dashboard/types';

/**
 * GET /api/dashboard/metrics
 * Récupère les métriques du dashboard pour une date et un actif donnés
 */

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  return measureExecutionTime(async () => {
    try {
      // Extraire et valider les paramètres
      const searchParams = extractSearchParams(request);
      const validation = validateDashboardMetricsQuery(searchParams);

      if (!validation.valid) {
        const duration = Date.now() - startTime;
        logApiCall({
          endpoint: '/api/dashboard/metrics',
          method: 'GET',
          success: false,
          statusCode: 400,
          duration,
          error: 'Invalid parameters',
          requestParams: Object.fromEntries(searchParams.entries()),
        });

        logDashboardEvent(
          'metrics_error',
          undefined,
          undefined,
          'Invalid parameters'
        );
        return createDashboardErrorResponse(
          'Invalid parameters',
          'Paramètres de requête invalides',
          validation.error
        );
      }

      const { date, actif } = validation.data as {
        date: string;
        actif: string;
      };

      logDashboardEvent('metrics_request', actif, date);

      // Déléguer la logique au service
      const result = await fetchDashboardMetrics({ date, actif });

      if (!result.success) {
        const duration = Date.now() - startTime;
        const status = 500;

        logApiCall({
          endpoint: '/api/dashboard/metrics',
          method: 'GET',
          success: false,
          statusCode: status,
          duration,
          error: 'Failed to fetch metrics',
          requestParams: { date, actif },
        });

        logDashboardEvent(
          'metrics_error',
          actif,
          date,
          'Failed to fetch metrics'
        );

        return createDashboardErrorResponse(
          'FETCH_ERROR',
          'Failed to fetch dashboard metrics',
          undefined,
          status
        );
      }

      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/dashboard/metrics',
        method: 'GET',
        success: true,
        statusCode: 200,
        duration,
        requestParams: { date, actif },
        responseSize: JSON.stringify(result.data).length,
      });

      logDashboardEvent('metrics_success', actif, date);

      // Retourner la réponse avec cache
      return createCachedDashboardResponse(result.data);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Extraire les paramètres même en cas d'erreur pour les logs
      let requestParams: Record<string, unknown> | undefined = undefined;
      try {
        const searchParams = extractSearchParams(request);
        const validation = validateDashboardMetricsQuery(searchParams);
        requestParams = validation.valid
          ? validation.data
          : Object.fromEntries(searchParams.entries());
      } catch {
        requestParams = undefined;
      }

      logApiCall({
        endpoint: '/api/dashboard/metrics',
        method: 'GET',
        success: false,
        statusCode: 500,
        duration,
        error: errorMessage,
        requestParams,
      });

      console.error('Error in dashboard metrics API:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      const rp = requestParams as { actif?: string; date?: string } | undefined;
      logDashboardEvent(
        'metrics_error',
        rp?.actif,
        rp?.date,
        'Unexpected error'
      );

      return createDashboardErrorResponse(
        'Internal server error',
        'Une erreur inattendue est survenue',
        errorMessage,
        500
      );
    }
  }, 'Dashboard Metrics API');
}
