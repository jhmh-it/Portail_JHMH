import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import { adminAuth } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const sessionCookie = (await cookieStore).get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        createGregErrorResponse('Non autorisé', 'ACCESS_DENIED'),
        { status: 401 }
      );
    }

    // Verify Firebase session
    if (!adminAuth) {
      return NextResponse.json(
        createGregErrorResponse(
          'Service temporairement indisponible',
          'AUTH_UNAVAILABLE'
        ),
        { status: 503 }
      );
    }

    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
    } catch {
      return NextResponse.json(
        createGregErrorResponse('Session invalide', 'ACCESS_DENIED'),
        { status: 401 }
      );
    }

    // Get Greg service
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

    // Extract params
    const { categoryId } = await context.params;

    if (!categoryId) {
      return NextResponse.json(
        createGregErrorResponse(
          "L'ID de la catégorie est requis",
          'INVALID_REQUEST'
        ),
        { status: 400 }
      );
    }

    const result = await gregService.deleteCategory(categoryId);

    if (!result.success) {
      return NextResponse.json(
        createGregErrorResponse(
          result.error ?? 'Impossible de supprimer la catégorie',
          'EXTERNAL_API_ERROR'
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createGregSuccessResponse(
        { deleted: true },
        'Catégorie supprimée avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Greg Categories DELETE] Erreur:', error);
    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}
