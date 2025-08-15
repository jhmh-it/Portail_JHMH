import { NextResponse, type NextRequest } from 'next/server';

import {
  createGregErrorResponse,
  createGregSuccessResponse,
  createGregService,
} from '@/app/home/greg/services/greg.service';
import { updateDocumentSchema } from '@/app/home/greg/validation';
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
  { params }: { params: Promise<{ document_id: string }> }
) {
  try {
    const { document_id } = await params;

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

    // Récupérer le document
    const result = await gregService.getDocument(document_id);

    if (!result.success) {
      return NextResponse.json(
        createGregErrorResponse(
          result.error ?? 'Impossible de récupérer le document',
          'EXTERNAL_API_ERROR'
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(createGregSuccessResponse(result.data), {
      status: 200,
    });
  } catch (error) {
    console.error('[Greg Document GET] Erreur:', error);
    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ document_id: string }> }
) {
  try {
    const { document_id } = await params;

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

    // Valider les données du body
    const body = await request.json();
    const validatedData = updateDocumentSchema.parse(body);

    // Modifier le document
    const result = await gregService.updateDocument(document_id, validatedData);

    if (!result.success) {
      return NextResponse.json(
        createGregErrorResponse(
          result.error ?? 'Impossible de modifier le document',
          'EXTERNAL_API_ERROR'
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createGregSuccessResponse(result.data, 'Document modifié avec succès'),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Greg Document PUT] Erreur:', error);
    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ document_id: string }> }
) {
  try {
    const { document_id } = await params;

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

    // Supprimer le document
    const result = await gregService.deleteDocument(document_id);

    if (!result.success) {
      return NextResponse.json(
        createGregErrorResponse(
          result.error ?? 'Impossible de supprimer le document',
          'EXTERNAL_API_ERROR'
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createGregSuccessResponse(
        { deleted: true },
        'Document supprimé avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Greg Document DELETE] Erreur:', error);
    return NextResponse.json(
      createGregErrorResponse('Erreur interne du serveur', 'UNKNOWN_ERROR'),
      { status: 500 }
    );
  }
}
