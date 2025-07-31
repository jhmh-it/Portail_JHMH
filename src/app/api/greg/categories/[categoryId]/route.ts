import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que Firebase Admin est disponible
    if (!adminAuth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporairement indisponible',
          code: 'AUTH_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Verify the session token
    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Session invalide' },
        { status: 401 }
      );
    }

    // Configuration API
    const apiBaseUrl = process.env.JHMH_API_BASE_URL;
    const apiKey = process.env.JHMH_API_KEY;

    if (!apiBaseUrl || !apiKey) {
      console.error('[API] Configuration API manquante');
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration API manquante',
          code: 'API_CONFIG_MISSING',
        },
        { status: 500 }
      );
    }

    // Récupérer l'ID de la catégorie
    const { categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "L'ID de la catégorie est requis",
        },
        { status: 400 }
      );
    }

    // Appel à l'API externe pour supprimer la catégorie
    const apiUrl = `${apiBaseUrl}/api/greg/categories/${categoryId}`;
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[API] Erreur lors de la suppression de la catégorie:',
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de supprimer la catégorie',
          details: errorText,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de la catégorie',
      },
      { status: 500 }
    );
  }
}
