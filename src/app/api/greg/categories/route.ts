import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
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

    // Appel à l'API externe pour récupérer les catégories
    const apiUrl = `${apiBaseUrl}/api/greg/categories`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[API] Erreur lors de la récupération des catégories:',
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de récupérer les catégories',
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : (data.categories ?? []),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des catégories',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Récupérer les données du body
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le nom de la catégorie est requis',
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'La description de la catégorie est requise',
        },
        { status: 400 }
      );
    }

    // Appel à l'API externe pour créer la catégorie
    const apiUrl = `${apiBaseUrl}/api/greg/categories`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '[API] Erreur lors de la création de la catégorie:',
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de créer la catégorie',
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
    console.error('Erreur lors de la création de la catégorie:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la catégorie',
      },
      { status: 500 }
    );
  }
}
