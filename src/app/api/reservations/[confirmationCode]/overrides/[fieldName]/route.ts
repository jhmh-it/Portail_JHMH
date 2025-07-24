import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ confirmationCode: string; fieldName: string }> }
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

    // Get confirmation code and field name from params
    const { confirmationCode, fieldName } = await context.params;

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

    // Delete override from external API
    const apiUrl = `${apiBaseUrl}/api/reservations/${confirmationCode}/overrides/${fieldName}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API] Erreur lors de la suppression de l'override ${fieldName}:`,
        errorText
      );

      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: 'Override non trouvé ou déjà supprimé',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de supprimer l'override",
        },
        { status: response.status }
      );
    }

    console.warn(`[API] Override ${fieldName} supprimé avec succès`);

    return NextResponse.json({
      success: true,
      message: `Override "${fieldName}" supprimé avec succès`,
    });
  } catch (error) {
    console.error("[API] Erreur lors de la suppression de l'override:", error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
