import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import { updateShiftSchema } from '@/app/home/greg/validation';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  const startTime = Date.now();

  try {
    const { shiftId } = await params;

    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
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
        endpoint: `/api/greg/shifts/${shiftId}`,
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

    if (!shiftId) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'GET',
        success: false,
        statusCode: 400,
        duration,
        error: 'ID du quart de travail requis',
      });

      return NextResponse.json(
        createGregErrorResponse(
          "L'ID du quart de travail est requis",
          'INVALID_REQUEST'
        ),
        { status: 400 }
      );
    }

    // Récupérer le shift
    const result = await gregService.getShift(shiftId);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg =
        result.error ?? 'Impossible de récupérer le quart de travail';
      const status = result.error === 'Shift not found' ? 404 : 500;

      logGregApiError('getShift', `/shifts/${shiftId}`, errorMsg);
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'GET',
        success: false,
        statusCode: status,
        duration,
        error: errorMsg,
        requestParams: { shiftId },
      });

      return NextResponse.json(
        createGregErrorResponse(
          errorMsg,
          status === 404 ? 'SHIFT_NOT_FOUND' : 'EXTERNAL_API_ERROR'
        ),
        { status }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: `/api/greg/shifts/${shiftId}`,
      method: 'GET',
      success: true,
      statusCode: 200,
      duration,
      requestParams: { shiftId },
      responseSize: JSON.stringify(result.data).length,
    });

    return NextResponse.json(createGregSuccessResponse(result.data), {
      status: 200,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('getShift', `/shifts/${(await params).shiftId}`, error);
    logApiCall({
      endpoint: `/api/greg/shifts/${(await params).shiftId}`,
      method: 'GET',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Shift GET] Erreur:', {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  const startTime = Date.now();

  try {
    const { shiftId } = await params;

    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'PUT',
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
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'PUT',
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

    if (!shiftId) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'PUT',
        success: false,
        statusCode: 400,
        duration,
        error: 'ID du quart de travail requis',
      });

      return NextResponse.json(
        createGregErrorResponse(
          "L'ID du quart de travail est requis",
          'INVALID_REQUEST'
        ),
        { status: 400 }
      );
    }

    // Valider les données du body
    const body = await request.json();
    const validatedData = updateShiftSchema.parse(body);

    // Modifier le shift
    const result = await gregService.updateShift(shiftId, validatedData);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg =
        result.error ?? 'Impossible de modifier le quart de travail';
      const status = result.error === 'Shift not found' ? 404 : 500;

      logGregApiError(
        'updateShift',
        `/shifts/${shiftId}`,
        errorMsg,
        validatedData
      );
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'PUT',
        success: false,
        statusCode: status,
        duration,
        error: errorMsg,
        requestParams: { shiftId, ...validatedData },
      });

      return NextResponse.json(
        createGregErrorResponse(
          errorMsg,
          status === 404 ? 'SHIFT_NOT_FOUND' : 'EXTERNAL_API_ERROR'
        ),
        { status }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: `/api/greg/shifts/${shiftId}`,
      method: 'PUT',
      success: true,
      statusCode: 200,
      duration,
      requestParams: { shiftId, ...validatedData },
      responseSize: JSON.stringify(result.data).length,
    });

    return NextResponse.json(
      createGregSuccessResponse(
        result.data,
        'Quart de travail modifié avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('updateShift', `/shifts/${(await params).shiftId}`, error);
    logApiCall({
      endpoint: `/api/greg/shifts/${(await params).shiftId}`,
      method: 'PUT',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Shift PUT] Erreur:', {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> }
) {
  const startTime = Date.now();

  try {
    const { shiftId } = await params;

    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'DELETE',
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
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'DELETE',
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

    if (!shiftId) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'DELETE',
        success: false,
        statusCode: 400,
        duration,
        error: 'ID du quart de travail requis',
      });

      return NextResponse.json(
        createGregErrorResponse(
          "L'ID du quart de travail est requis",
          'INVALID_REQUEST'
        ),
        { status: 400 }
      );
    }

    // Supprimer le shift
    const result = await gregService.deleteShift(shiftId);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg =
        result.error ?? 'Impossible de supprimer le quart de travail';
      const status = result.error === 'Shift not found' ? 404 : 500;

      logGregApiError('deleteShift', `/shifts/${shiftId}`, errorMsg);
      logApiCall({
        endpoint: `/api/greg/shifts/${shiftId}`,
        method: 'DELETE',
        success: false,
        statusCode: status,
        duration,
        error: errorMsg,
        requestParams: { shiftId },
      });

      return NextResponse.json(
        createGregErrorResponse(
          errorMsg,
          status === 404 ? 'SHIFT_NOT_FOUND' : 'EXTERNAL_API_ERROR'
        ),
        { status }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: `/api/greg/shifts/${shiftId}`,
      method: 'DELETE',
      success: true,
      statusCode: 200,
      duration,
      requestParams: { shiftId },
    });

    return NextResponse.json(
      createGregSuccessResponse(
        { deleted: true },
        'Quart de travail supprimé avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('deleteShift', `/shifts/${(await params).shiftId}`, error);
    logApiCall({
      endpoint: `/api/greg/shifts/${(await params).shiftId}`,
      method: 'DELETE',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Shift DELETE] Erreur:', {
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
