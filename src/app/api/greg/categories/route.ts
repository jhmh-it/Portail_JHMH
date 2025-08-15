import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import { createCategorySchema } from '@/app/home/greg/validation';
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

export async function GET() {
  const startTime = Date.now();

  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: '/api/greg/categories',
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
        endpoint: '/api/greg/categories',
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

    const result = await gregService.getCategories();

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg = result.error ?? 'Impossible de récupérer les catégories';

      logGregApiError('getCategories', '/categories', errorMsg);
      logApiCall({
        endpoint: '/api/greg/categories',
        method: 'GET',
        success: false,
        statusCode: 500,
        duration,
        error: errorMsg,
      });

      return NextResponse.json(
        createGregErrorResponse(errorMsg, 'EXTERNAL_API_ERROR'),
        { status: 500 }
      );
    }

    const categories = Array.isArray(result.data)
      ? result.data
      : ((result.data as { categories?: unknown[] } | undefined)?.categories ??
        []);

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: '/api/greg/categories',
      method: 'GET',
      success: true,
      statusCode: 200,
      duration,
      responseSize: JSON.stringify(categories).length,
    });

    return NextResponse.json(createGregSuccessResponse(categories), {
      status: 200,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('getCategories', '/categories', error);
    logApiCall({
      endpoint: '/api/greg/categories',
      method: 'GET',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Categories GET] Erreur:', {
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
        endpoint: '/api/greg/categories',
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
        endpoint: '/api/greg/categories',
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
    const validatedData = createCategorySchema.parse(body);

    const result = await gregService.createCategory(validatedData);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg = result.error ?? 'Impossible de créer la catégorie';

      logGregApiError('createCategory', '/categories', errorMsg, validatedData);
      logApiCall({
        endpoint: '/api/greg/categories',
        method: 'POST',
        success: false,
        statusCode: 500,
        duration,
        error: errorMsg,
        requestParams: validatedData,
      });

      return NextResponse.json(
        createGregErrorResponse(errorMsg, 'EXTERNAL_API_ERROR'),
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: '/api/greg/categories',
      method: 'POST',
      success: true,
      statusCode: 201,
      duration,
      requestParams: validatedData,
      responseSize: JSON.stringify(result.data).length,
    });

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Catégorie créée avec succès'),
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('createCategory', '/categories', error);
    logApiCall({
      endpoint: '/api/greg/categories',
      method: 'POST',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Categories POST] Erreur:', {
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
