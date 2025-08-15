import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { logApiCall, logGregApiError } from '@/lib/api-logger';

import {
  createGregService,
  createGregErrorResponse,
} from '../services/greg.service';
import type { GregErrorCode } from '../types/greg';

import { withAuthentication } from './auth-middleware';

interface ApiRouteConfig {
  method: string;
  endpoint: string;
  requiresAuth?: boolean;
}

/**
 * Wrapper générique pour les routes API Greg
 * Centralise l'authentification, la validation, le logging et la gestion d'erreur
 */
export function createApiRouteHandler<TInput = unknown, TOutput = unknown>(
  config: ApiRouteConfig,
  handler: (
    request: NextRequest,
    validatedData?: TInput,
    gregService?: ReturnType<typeof createGregService>
  ) => Promise<TOutput>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();

    try {
      if (config.requiresAuth !== false) {
        return withAuthentication(async () => {
          return executeHandler();
        });
      } else {
        return executeHandler();
      }

      async function executeHandler(): Promise<NextResponse> {
        // Créer le service Greg si nécessaire
        let gregService;
        if (config.requiresAuth !== false) {
          gregService = createGregService();
          if (!gregService) {
            logGregApiError(
              config.method,
              config.endpoint,
              new Error('API_CONFIG_MISSING'),
              { duration: Date.now() - startTime }
            );
            return NextResponse.json(
              createGregErrorResponse(
                'Configuration API manquante',
                'API_CONFIG_MISSING'
              ),
              { status: 500 }
            );
          }
        }

        // Exécuter le handler
        const result = await handler(request, undefined, gregService);

        // Log de succès
        logApiCall({
          method: config.method,
          endpoint: config.endpoint,
          success: true,
          statusCode: 200,
          duration: Date.now() - startTime,
          requestParams: {},
        });

        return result as NextResponse;
      }
    } catch (error) {
      let errorCode: GregErrorCode = 'UNKNOWN_ERROR';
      let statusCode = 500;

      if (error instanceof z.ZodError) {
        errorCode = 'INVALID_REQUEST';
        statusCode = 400;
      }

      logGregApiError(config.method, config.endpoint, error, {
        errorCode,
        duration: Date.now() - startTime,
      });

      console.error(`Error in ${config.endpoint}:`, error);
      return NextResponse.json(
        createGregErrorResponse('Internal server error', errorCode),
        { status: statusCode }
      );
    }
  };
}

/**
 * Wrapper spécialisé pour les routes avec validation de données
 */
export function createValidatedApiRouteHandler<TInput, TOutput>(
  config: ApiRouteConfig,
  schema: z.ZodSchema<TInput>,
  handler: (
    request: NextRequest,
    validatedData: TInput,
    gregService: NonNullable<ReturnType<typeof createGregService>>
  ) => Promise<TOutput>
) {
  return createApiRouteHandler<TInput, TOutput>(
    config,
    async (request, _, gregService) => {
      if (!gregService) {
        throw new Error('Greg service not available');
      }
      const body = await request.json();
      const validatedData = schema.parse(body);
      return handler(request, validatedData, gregService);
    }
  );
}
