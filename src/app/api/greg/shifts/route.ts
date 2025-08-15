import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import {
  validateShiftFilters,
  createShiftSchema,
} from '@/app/home/greg/validation/greg.validation';
import { logGregApiError, logApiCall } from '@/lib/api-logger';
import { adminAuth } from '@/lib/firebase-admin';

async function verifyAuthentication() {
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const sessionCookie = (await cookieStore).get('session');

  if (!sessionCookie?.value) {
    return { error: 'Non autorisé', status: 401 };
  }

  if (!adminAuth) {
    return { error: 'Service temporairement indisponible', status: 503 };
  }

  try {
    await adminAuth.verifyIdToken(sessionCookie.value);
    return { success: true };
  } catch {
    return { error: 'Session invalide', status: 401 };
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'GET',
        success: false,
        statusCode: authResult.status,
        duration,
        error: authResult.error ?? "Erreur d'authentification",
      });

      return NextResponse.json(
        createGregErrorResponse(
          authResult.error ?? "Erreur d'authentification",
          'ACCESS_DENIED'
        ),
        { status: authResult.status }
      );
    }

    // Obtenir le service Greg
    const gregService = createGregService();
    if (!gregService) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'GET',
        success: false,
        statusCode: 503,
        duration,
        error: 'Service Greg indisponible',
      });

      return NextResponse.json(
        createGregErrorResponse(
          'Service Greg indisponible',
          'API_CONFIG_MISSING'
        ),
        { status: 503 }
      );
    }

    // Extraire et valider les paramètres de filtrage
    const { searchParams } = new URL(request.url);
    const searchParamsObj = Object.fromEntries(searchParams.entries());
    const validation = validateShiftFilters(
      searchParamsObj as Record<string, string | null>
    );

    if (!validation.success) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'GET',
        success: false,
        statusCode: 400,
        duration,
        error: 'Paramètres de requête invalides',
        requestParams: searchParamsObj as Record<string, unknown>,
      });

      return NextResponse.json(
        createGregErrorResponse(
          'Paramètres de requête invalides',
          'INVALID_REQUEST'
        ),
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Récupérer les shifts depuis l'API externe
    const result = await gregService.getShifts(filters);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg =
        result.error ?? 'Impossible de récupérer les quarts de travail';

      logGregApiError('getShifts', '/shifts', errorMsg);
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'GET',
        success: false,
        statusCode: 500,
        duration,
        error: errorMsg,
        requestParams: filters as Record<string, unknown>,
      });

      return NextResponse.json(
        createGregErrorResponse(errorMsg, 'EXTERNAL_API_ERROR'),
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: '/api/greg/shifts',
      method: 'GET',
      success: true,
      statusCode: 200,
      duration,
      requestParams: filters as Record<string, unknown>,
      responseSize: JSON.stringify(result.data).length,
    });

    // Retourner directement les données (format simple pour les listes)
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('getShifts', '/shifts', error);
    logApiCall({
      endpoint: '/api/greg/shifts',
      method: 'GET',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Shifts GET] Erreur:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'POST',
        success: false,
        statusCode: authResult.status,
        duration,
        error: authResult.error ?? "Erreur d'authentification",
      });

      return NextResponse.json(
        createGregErrorResponse(
          authResult.error ?? "Erreur d'authentification",
          'ACCESS_DENIED'
        ),
        { status: authResult.status }
      );
    }

    // Obtenir le service Greg
    const gregService = createGregService();
    if (!gregService) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'POST',
        success: false,
        statusCode: 503,
        duration,
        error: 'Service Greg indisponible',
      });

      return NextResponse.json(
        createGregErrorResponse(
          'Service Greg indisponible',
          'API_CONFIG_MISSING'
        ),
        { status: 503 }
      );
    }

    // Valider les données du body
    const body = await request.json();
    const validatedData = createShiftSchema.parse(body);

    // Créer le shift
    const result = await gregService.createShift(validatedData);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg =
        result.error ?? 'Impossible de créer le quart de travail';

      logGregApiError('createShift', '/shifts', errorMsg, validatedData);
      logApiCall({
        endpoint: '/api/greg/shifts',
        method: 'POST',
        success: false,
        statusCode: 500,
        duration,
        error: errorMsg,
        requestParams: validatedData as Record<string, unknown>,
      });

      return NextResponse.json(
        createGregErrorResponse(errorMsg, 'EXTERNAL_API_ERROR'),
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: '/api/greg/shifts',
      method: 'POST',
      success: true,
      statusCode: 201,
      duration,
      requestParams: validatedData as Record<string, unknown>,
      responseSize: JSON.stringify(result.data).length,
    });

    return NextResponse.json(
      createGregSuccessResponse(
        result.data,
        'Quart de travail créé avec succès'
      ),
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('createShift', '/shifts', error);
    logApiCall({
      endpoint: '/api/greg/shifts',
      method: 'POST',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Shifts POST] Erreur:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}
