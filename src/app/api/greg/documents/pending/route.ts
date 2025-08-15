import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('page_size') ?? '20');
    const searchQuery = searchParams.get('q');

    // Helper pour extraire les tableaux quel que soit le format { data: [] } ou []
    const extractDocs = (payload: unknown): Record<string, unknown>[] => {
      if (Array.isArray(payload)) return payload as Record<string, unknown>[];
      if (
        payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { data?: unknown }).data)
      )
        return (payload as { data: Record<string, unknown>[] }).data;
      return [];
    };

    // Récupérer les documents en attente (endpoint dédié), avec repli robuste
    let pendingDocs: Record<string, unknown>[] = [];
    const result = await gregService.getPendingDocuments();
    if (result.success) {
      pendingDocs = extractDocs(result.data);
    }

    // Fallback: si l'endpoint dédié échoue ou renvoie vide, utiliser /documents et filtrer
    if (!result.success || pendingDocs.length === 0) {
      const fallback = await gregService.getDocuments({ pending_only: true });
      if (fallback.success) {
        pendingDocs = extractDocs(fallback.data);
      } else {
        return NextResponse.json(
          createGregErrorResponse(
            fallback.error ??
              result.error ??
              'Impossible de récupérer les documents en attente',
            'EXTERNAL_API_ERROR'
          ),
          { status: 500 }
        );
      }
    }

    // Les documents en attente ont par définition pending_for_review = true
    const rawDocuments = pendingDocs;
    const documentsWithPending = rawDocuments.map(
      (doc: Record<string, unknown>) => ({
        ...doc,
        pending_for_review: true,
      })
    );

    // Filtrer côté client si nécessaire (recherche)
    let filteredDocuments = documentsWithPending;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredDocuments = documentsWithPending.filter(
        (doc: Record<string, unknown>) =>
          (doc.spreadsheet_name as string)?.toLowerCase().includes(query) ||
          (doc.sheet_name as string)?.toLowerCase().includes(query) ||
          (doc.summary as string)?.toLowerCase().includes(query) ||
          (doc.categories as string)?.toLowerCase().includes(query) ||
          (doc.id as string)?.toLowerCase().includes(query)
      );
    }

    // Pagination côté client
    const total = filteredDocuments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    return NextResponse.json(
      createGregSuccessResponse({
        data: paginatedDocuments,
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Greg Documents Pending] Erreur:', error);
    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}
