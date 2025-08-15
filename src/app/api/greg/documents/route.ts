import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import {
  validateDocumentFilters,
  createDocumentSchema,
} from '@/app/home/greg/validation/greg.validation';
import { logGregApiError, logApiCall } from '@/lib/api-logger';
import { adminAuth } from '@/lib/firebase-admin';
import type { GregDocument } from '@/types/greg';

interface GregDocumentWithStringFields {
  spreadsheet_name?: string;
  sheet_name?: string;
  summary?: string;
  categories?: string;
  id?: string;
}

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
  try {
    // Vérifier l'authentification
    const authResult = await verifyAuthentication();
    if ('error' in authResult) {
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
    const validation = validateDocumentFilters(searchParamsObj);
    const filters: {
      q?: string;
      categories?: string[];
      page?: number;
      page_size?: number;
    } = (validation as { success: true; data: Record<string, unknown> })
      .data as {
      q?: string;
      categories?: string[];
      page?: number;
      page_size?: number;
    };

    // Récupérer les documents depuis l'API externe
    const result = await gregService.getDocuments(filters);

    if (!result.success) {
      return NextResponse.json(
        createGregErrorResponse(
          result.error ?? 'Impossible de récupérer les documents',
          'EXTERNAL_API_ERROR'
        ),
        { status: 500 }
      );
    }

    // Traitement client-side pour la recherche et filtres (conservé pour compatibilité)
    let filteredDocuments = Array.isArray(result.data)
      ? result.data
      : ((result.data as { data?: GregDocument[] })?.data ?? []);

    if (filters.q) {
      const query = filters.q.toLowerCase();
      filteredDocuments = filteredDocuments.filter(
        (doc: GregDocumentWithStringFields) =>
          (doc.spreadsheet_name?.toLowerCase().includes(query) ?? false) ||
          (doc.sheet_name?.toLowerCase().includes(query) ?? false) ||
          (doc.summary?.toLowerCase().includes(query) ?? false) ||
          (doc.categories?.toLowerCase().includes(query) ?? false) ||
          (doc.id?.toLowerCase().includes(query) ?? false)
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      filteredDocuments = filteredDocuments.filter(
        (doc: GregDocumentWithStringFields) => {
          if (!doc.categories) return false;
          const docCategories = doc.categories
            .split(',')
            .map((c: string) => c.trim());
          return (
            filters.categories?.some(cat => docCategories.includes(cat)) ??
            false
          );
        }
      );
    }

    // Pagination côté client
    const total = filteredDocuments.length;
    const pageSize = filters.page_size ?? 20;
    const page = filters.page ?? 1;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    // Pour les endpoints consommateurs attendus par Greg UI, on renvoie directement un tableau
    // enveloppé dans le format standard createGregSuccessResponse mais avec data = tableau.
    return NextResponse.json(
      createGregSuccessResponse({
        data: paginatedDocuments,
        total,
        page: filters.page ?? 1,
        page_size: filters.page_size ?? 20,
        total_pages: totalPages,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Greg Documents GET] Erreur:', error);
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
        endpoint: '/api/greg/documents',
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
        endpoint: '/api/greg/documents',
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

    // Log des données reçues pour debugging
    console.warn('[Greg Documents POST] Données reçues:', {
      body,
      timestamp: new Date().toISOString(),
    });

    const validatedData = createDocumentSchema.parse(body);

    const result = await gregService.createDocument(validatedData);

    if (!result.success) {
      const duration = Date.now() - startTime;
      const errorMsg = result.error ?? 'Impossible de créer le document';

      logGregApiError('createDocument', '/documents', errorMsg, {
        validatedData,
        originalBody: body,
      });
      logApiCall({
        endpoint: '/api/greg/documents',
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
      endpoint: '/api/greg/documents',
      method: 'POST',
      success: true,
      statusCode: 201,
      duration,
      requestParams: validatedData,
      responseSize: JSON.stringify(result.data).length,
    });

    console.warn('[Greg Documents POST] Document créé avec succès:', {
      documentId: result.data?.id,
      validatedData,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Document créé avec succès'),
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur interne du serveur';

    logGregApiError('createDocument', '/documents', error);
    logApiCall({
      endpoint: '/api/greg/documents',
      method: 'POST',
      success: false,
      statusCode: 500,
      duration,
      error: errorMessage,
    });

    console.error('[Greg Documents POST] Erreur:', {
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
