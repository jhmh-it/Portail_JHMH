import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  useGregService,
} from '../services/greg.service';
import type { GregErrorCode } from '../types/greg';

/**
 * Middleware HOF pour les routes Greg avec authentification et service intégré
 */

export type GregAuthenticatedHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: { params?: Promise<T> | T },
  gregService: NonNullable<ReturnType<typeof useGregService>['service']>
) => Promise<NextResponse>;

export interface GregMiddlewareOptions {
  requireAuth?: boolean;
  checkApiConfig?: boolean;
}

/**
 * Middleware pour authentifier et injecter le service Greg
 */
export function withGregAuth<T = Record<string, string>>(
  handler: GregAuthenticatedHandler<T>,
  options: GregMiddlewareOptions = {}
): (
  request: NextRequest,
  context: { params?: Promise<T> | T }
) => Promise<NextResponse> {
  const { requireAuth = true, checkApiConfig = true } = options;

  return async (
    request: NextRequest,
    context: { params?: Promise<T> | T }
  ): Promise<NextResponse> => {
    try {
      // Vérifier la configuration API si demandé
      if (checkApiConfig) {
        const { service, isConfigured, error } = useGregService();

        if (!isConfigured) {
          console.error('[Greg Middleware] Configuration API manquante');
          return createGregErrorResponseHttp(
            'Configuration API manquante',
            'API_CONFIG_MISSING',
            error,
            503
          );
        }

        // Si l'authentification n'est pas requise, on peut passer directement au handler
        if (!requireAuth && service) {
          return await handler(request, context, service);
        }
      }

      // Vérifier l'authentification si requise
      if (requireAuth) {
        const authResult = await verifyGregAuthentication();

        if (!authResult.success) {
          return createGregErrorResponseHttp(
            authResult.error ?? "Erreur d'authentification",
            authResult.code,
            authResult.details,
            authResult.status ?? 401
          );
        }
      }

      // Récupérer le service Greg (on sait qu'il est configuré à ce stade)
      const { service } = useGregService();

      if (!service) {
        return createGregErrorResponseHttp(
          'Service Greg indisponible',
          'API_CONFIG_MISSING',
          undefined,
          503
        );
      }

      // Appeler le handler avec le service
      return await handler(request, context, service);
    } catch (error) {
      console.error('[Greg Middleware] Erreur inattendue:', error);

      return createGregErrorResponseHttp(
        'Erreur interne du serveur',
        'UNKNOWN_ERROR',
        error instanceof Error ? error.message : 'Erreur inconnue',
        500
      );
    }
  };
}

/**
 * Vérifie l'authentification Firebase pour les routes Greg
 */
async function verifyGregAuthentication(): Promise<{
  success: boolean;
  error?: string;
  code?: GregErrorCode;
  details?: unknown;
  status?: number;
}> {
  try {
    // Vérifier le cookie de session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return {
        success: false,
        error: 'Non autorisé',
        code: 'ACCESS_DENIED',
        status: 401,
      };
    }

    // Vérifier que Firebase Admin est disponible
    if (!adminAuth) {
      return {
        success: false,
        error: 'Service temporairement indisponible',
        code: 'AUTH_UNAVAILABLE',
        status: 503,
      };
    }

    // Vérifier le token de session
    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
      return { success: true };
    } catch (verifyError) {
      console.warn('[Greg Middleware] Token de session invalide:', verifyError);

      return {
        success: false,
        error: 'Session invalide',
        code: 'ACCESS_DENIED',
        status: 401,
      };
    }
  } catch (error) {
    console.error(
      '[Greg Middleware] Erreur lors de la vérification auth:',
      error
    );

    return {
      success: false,
      error: "Erreur lors de la vérification de l'authentification",
      code: 'AUTH_UNAVAILABLE',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      status: 500,
    };
  }
}

/**
 * Crée une réponse HTTP d'erreur standardisée pour Greg
 */
function createGregErrorResponseHttp(
  error: string,
  code?: GregErrorCode,
  details?: unknown,
  status: number = 400
): NextResponse {
  const errorResponse = createGregErrorResponse(error, code, details);
  return NextResponse.json(errorResponse, { status });
}

/**
 * Crée une réponse HTTP de succès standardisée pour Greg
 */
export function createGregSuccessResponseHttp<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const successResponse = createGregSuccessResponse(data, message);
  return NextResponse.json(successResponse, { status });
}

/**
 * Logge les événements Greg de manière cohérente
 */
export function logGregEvent(
  operation: string,
  entityType: string,
  entityId?: string,
  success: boolean = true,
  error?: string,
  duration?: number
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    operation,
    entityType,
    entityId,
    success,
    error,
    duration: duration ? `${duration.toFixed(2)}ms` : undefined,
  };

  if (success) {
    console.warn('[Greg Event]', logData);
  } else {
    console.error('[Greg Event]', logData);
  }
}

/**
 * Mesure le temps d'exécution d'une opération Greg
 */
export async function measureGregOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  entityType: string,
  entityId?: string
): Promise<T> {
  const start = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - start;

    logGregEvent(
      operationName,
      entityType,
      entityId,
      true,
      undefined,
      duration
    );

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue';

    logGregEvent(
      operationName,
      entityType,
      entityId,
      false,
      errorMessage,
      duration
    );

    throw error;
  }
}

/**
 * Middleware spécialisé pour les routes CRUD Greg
 */
export function withGregCrud<T = Record<string, string>>(
  entityType: string,
  handler: GregAuthenticatedHandler<T>
): (
  request: NextRequest,
  context: { params?: Promise<T> | T }
) => Promise<NextResponse> {
  return withGregAuth<T>(async (request, context, gregService) => {
    return measureGregOperation(
      () => handler(request, context, gregService),
      `${request.method?.toLowerCase() || 'unknown'}_${entityType}`,
      entityType,
      context.params ? String(Object.values(context.params)[0]) : undefined
    );
  });
}

/**
 * Extrait et valide les paramètres de route Greg
 */
export async function extractGregParams<T>(params: Promise<T> | T): Promise<T> {
  if (params instanceof Promise) {
    return await params;
  }
  return params;
}

/**
 * Utilitaire pour extraire les paramètres de recherche de manière sécurisée
 */
export function extractGregSearchParams(
  request: NextRequest
): Record<string, string | null> {
  try {
    const { searchParams } = new URL(request.url);
    return Object.fromEntries(searchParams.entries());
  } catch (error) {
    console.warn('[Greg Middleware] Erreur extraction params:', error);
    return {};
  }
}

/**
 * Utilitaire pour valider et parser le body JSON de manière sécurisée
 */
export async function parseGregRequestBody<T>(
  request: NextRequest
): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    console.warn('[Greg Middleware] Erreur parsing body:', error);
    return null;
  }
}

/**
 * Middleware pour les routes publiques Greg (sans authentification)
 */
export function withGregPublic<T = Record<string, string>>(
  handler: GregAuthenticatedHandler<T>
): (
  request: NextRequest,
  context: { params?: Promise<T> | T }
) => Promise<NextResponse> {
  return withGregAuth<T>(handler, {
    requireAuth: false,
    checkApiConfig: true,
  });
}
