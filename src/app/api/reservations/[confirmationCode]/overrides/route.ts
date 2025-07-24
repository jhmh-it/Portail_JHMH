import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ confirmationCode: string }> }
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

    // Get confirmation code from params
    const { confirmationCode } = await context.params;

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

    // Fetch overrides history from external API
    const apiUrl = `${apiBaseUrl}/api/reservations/${confirmationCode}/overrides`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API] Erreur lors de la récupération de l'historique:`,
        errorText
      );
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de récupérer l'historique des modifications",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "[API] Erreur lors de la récupération de l'historique:",
      error
    );
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ confirmationCode: string }> }
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

    // Verify the session token and get user info
    let user;
    try {
      const decodedToken = await adminAuth.verifyIdToken(sessionCookie.value);
      user = await adminAuth.getUser(decodedToken.uid);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Session invalide' },
        { status: 401 }
      );
    }

    // Get confirmation code from params
    const { confirmationCode } = await context.params;

    // Get request body
    const body = await request.json();
    const { overrides } = body;

    if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données de surcharge manquantes ou invalides',
        },
        { status: 400 }
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

    // Send each override to the external API
    const results: Array<{
      fieldName: string;
      success: boolean;
      [key: string]: unknown;
    }> = [];
    const errors: string[] = [];

    // Valider d'abord tous les overrides
    const validOverrides = overrides.filter(override => {
      if (!override.fieldName || override.overriddenValue === undefined) {
        errors.push(
          `Champ ou valeur manquant pour: ${override.fieldName ?? 'inconnu'}`
        );
        return false;
      }
      return true;
    });

    // Traiter tous les overrides en parallèle
    const overridePromises = validOverrides.map(async override => {
      try {
        const apiUrl = `${apiBaseUrl}/api/reservations/${confirmationCode}/overrides`;

        const overrideData = {
          fieldName: override.fieldName,
          overriddenValue: String(override.overriddenValue), // L'API attend une string
          createdBy: user.email ?? user.uid,
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(overrideData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[API] Erreur lors de la création de la surcharge ${override.fieldName}:`,
            errorText
          );
          return {
            fieldName: override.fieldName,
            success: false,
            error: `Erreur pour ${override.fieldName}: ${response.statusText}`,
          };
        }

        const result = await response.json();
        return {
          fieldName: override.fieldName,
          success: true,
          ...result,
        };
      } catch (error) {
        console.error(
          `[API] Erreur lors de la création de la surcharge ${override.fieldName}:`,
          error
        );
        return {
          fieldName: override.fieldName,
          success: false,
          error: `Erreur pour ${override.fieldName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        };
      }
    });

    const settledResults = await Promise.allSettled(overridePromises);

    settledResults.forEach(result => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.push(result.value);
        } else {
          errors.push(result.value.error);
        }
      } else {
        errors.push(`Erreur inattendue: ${result.reason}`);
      }
    });

    // Return results
    const hasErrors = errors.length > 0;
    const hasSuccess = results.length > 0;

    return NextResponse.json({
      success: !hasErrors || hasSuccess,
      data: {
        successful: results,
        errors: errors,
        totalProcessed: overrides.length,
        successCount: results.length,
        errorCount: errors.length,
      },
      message: hasErrors
        ? `${results.length} surcharge(s) créée(s), ${errors.length} erreur(s)`
        : `${results.length} surcharge(s) créée(s) avec succès`,
    });
  } catch (error) {
    console.error('[API] Erreur lors de la création des surcharges:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
