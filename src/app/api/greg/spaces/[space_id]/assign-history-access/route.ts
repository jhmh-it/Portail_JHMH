import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ space_id: string }> }
) {
  try {
    const { space_id } = await params;

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

    // Récupérer les données du body
    const body = await request.json();

    // Reconstituer le space_id complet avec le préfixe "spaces/"
    const fullSpaceId = `spaces/${space_id}`;

    // Appel à l'API externe pour assigner l'accès à l'historique
    const apiUrl = `${apiBaseUrl}/api/greg/spaces/${fullSpaceId}/assign-history-access`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[API] Erreur lors de l'assignation de l'accès à l'historique:",
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error: "Impossible d'assigner l'accès à l'historique",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'assignation de l'accès à l'historique:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'assignation de l'accès à l'historique",
      },
      { status: 500 }
    );
  }
}
