import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import { updateReminderSchema } from '@/app/home/greg/validation';
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
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const startTime = Date.now();

  try {
    const { reminderId } = await params;

    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'GET',
        success: false,
        statusCode: authResult.status,
        duration,
        error: authResult.error,
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
        endpoint: `/api/greg/reminders/${reminderId}`,
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

    if (!reminderId) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'GET',
        success: false,
        statusCode: 400,
        duration,
        error: 'ID du rappel requis',
      });

      return NextResponse.json(
        createGregErrorResponse("L'ID du rappel est requis", 'INVALID_REQUEST'),
        { status: 400 }
      );
    }

    // Récupérer le reminder
    const result = await gregService.getReminder(reminderId);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg = result.error ?? 'Impossible de récupérer le rappel';
      const status = result.error === 'Reminder not found' ? 404 : 500;

      logGregApiError('getReminder', `/reminders/${reminderId}`, errorMsg);
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'GET',
        success: false,
        statusCode: status,
        duration,
        error: errorMsg,
        requestParams: { reminderId },
      });

      return NextResponse.json(
        createGregErrorResponse(
          errorMsg,
          status === 404 ? 'REMINDER_NOT_FOUND' : 'EXTERNAL_API_ERROR'
        ),
        { status }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: `/api/greg/reminders/${reminderId}`,
      method: 'GET',
      success: true,
      statusCode: 200,
      duration,
      requestParams: { reminderId },
      responseSize: JSON.stringify(result.data).length,
    });

    return NextResponse.json(createGregSuccessResponse(result.data), {
      status: 200,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError(
      'getReminder',
      `/reminders/${(await params).reminderId}`,
      error
    );
    logApiCall({
      endpoint: `/api/greg/reminders/${(await params).reminderId}`,
      method: 'GET',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Reminder GET] Erreur:', {
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
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const startTime = Date.now();

  try {
    const { reminderId } = await params;

    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'PUT',
        success: false,
        statusCode: authResult.status,
        duration,
        error: authResult.error,
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
        endpoint: `/api/greg/reminders/${reminderId}`,
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

    if (!reminderId) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'PUT',
        success: false,
        statusCode: 400,
        duration,
        error: 'ID du rappel requis',
      });

      return NextResponse.json(
        createGregErrorResponse("L'ID du rappel est requis", 'INVALID_REQUEST'),
        { status: 400 }
      );
    }

    // Valider les données du body
    const body = await request.json();
    const validatedData = updateReminderSchema.parse(body);

    // Modifier le reminder
    const result = await gregService.updateReminder(reminderId, validatedData);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg = result.error ?? 'Impossible de modifier le rappel';
      const status = result.error === 'Reminder not found' ? 404 : 500;

      logGregApiError(
        'updateReminder',
        `/reminders/${reminderId}`,
        errorMsg,
        validatedData
      );
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'PUT',
        success: false,
        statusCode: status,
        duration,
        error: errorMsg,
        requestParams: { reminderId, ...validatedData },
      });

      return NextResponse.json(
        createGregErrorResponse(
          errorMsg,
          status === 404 ? 'REMINDER_NOT_FOUND' : 'EXTERNAL_API_ERROR'
        ),
        { status }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: `/api/greg/reminders/${reminderId}`,
      method: 'PUT',
      success: true,
      statusCode: 200,
      duration,
      requestParams: { reminderId, ...validatedData },
      responseSize: JSON.stringify(result.data).length,
    });

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Rappel modifié avec succès'),
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError(
      'updateReminder',
      `/reminders/${(await params).reminderId}`,
      error
    );
    logApiCall({
      endpoint: `/api/greg/reminders/${(await params).reminderId}`,
      method: 'PUT',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Reminder PUT] Erreur:', {
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
  { params }: { params: Promise<{ reminderId: string }> }
) {
  const startTime = Date.now();

  try {
    const { reminderId } = await params;

    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'DELETE',
        success: false,
        statusCode: authResult.status,
        duration,
        error: authResult.error,
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
        endpoint: `/api/greg/reminders/${reminderId}`,
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

    if (!reminderId) {
      const duration = Date.now() - startTime;
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'DELETE',
        success: false,
        statusCode: 400,
        duration,
        error: 'ID du rappel requis',
      });

      return NextResponse.json(
        createGregErrorResponse("L'ID du rappel est requis", 'INVALID_REQUEST'),
        { status: 400 }
      );
    }

    // Supprimer le reminder
    const result = await gregService.deleteReminder(reminderId);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg = result.error ?? 'Impossible de supprimer le rappel';
      const status = result.error === 'Reminder not found' ? 404 : 500;

      logGregApiError('deleteReminder', `/reminders/${reminderId}`, errorMsg);
      logApiCall({
        endpoint: `/api/greg/reminders/${reminderId}`,
        method: 'DELETE',
        success: false,
        statusCode: status,
        duration,
        error: errorMsg,
        requestParams: { reminderId },
      });

      return NextResponse.json(
        createGregErrorResponse(
          errorMsg,
          status === 404 ? 'REMINDER_NOT_FOUND' : 'EXTERNAL_API_ERROR'
        ),
        { status }
      );
    }

    const duration = Date.now() - startTime;
    logApiCall({
      endpoint: `/api/greg/reminders/${reminderId}`,
      method: 'DELETE',
      success: true,
      statusCode: 200,
      duration,
      requestParams: { reminderId },
    });

    return NextResponse.json(
      createGregSuccessResponse(
        { deleted: true },
        'Rappel supprimé avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError(
      'deleteReminder',
      `/reminders/${(await params).reminderId}`,
      error
    );
    logApiCall({
      endpoint: `/api/greg/reminders/${(await params).reminderId}`,
      method: 'DELETE',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Reminder DELETE] Erreur:', {
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
