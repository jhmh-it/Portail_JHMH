import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const page = searchParams.get('page') ?? '1';
    const page_size = searchParams.get('page_size') ?? '20';
    const space_type = searchParams.get('space_type') ?? 'ROOM';

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

    // Construire l'URL de l'API externe
    const apiUrl = new URL(`${apiBaseUrl}/api/greg/spaces`);
    apiUrl.searchParams.set('space_type', space_type);

    // Appel à l'API externe
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();

    // Filtrer côté client si nécessaire (recherche textuelle)
    let filteredData = data;
    if (q) {
      const searchQuery = q.toLowerCase();
      filteredData = data.filter((space: Record<string, unknown>) => {
        const spaceName = space.space_name as string;
        const spaceId = space.space_id as string;
        const notes = space.notes as string;

        return (
          spaceName?.toLowerCase().includes(searchQuery) ??
          spaceId?.toLowerCase().includes(searchQuery) ??
          notes?.toLowerCase().includes(searchQuery)
        );
      });
    }

    // Pagination côté client
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      total: filteredData.length,
      page: pageNum,
      page_size: pageSizeNum,
      total_pages: Math.ceil(filteredData.length / pageSizeNum),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des espaces:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des espaces',
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

    // Appel à l'API externe pour créer l'espace
    const apiUrl = `${apiBaseUrl}/api/greg/spaces`;
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
      console.error("[API] Erreur lors de la création de l'espace:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "Impossible de créer l'espace",
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
    console.error("Erreur lors de la création de l'espace:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de l'espace",
      },
      { status: 500 }
    );
  }
}
