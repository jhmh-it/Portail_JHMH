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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const pageSize = parseInt(searchParams.get('page_size') ?? '20');
    const searchQuery = searchParams.get('q');

    // Appel à l'API externe pour récupérer les documents
    const apiUrl = `${apiBaseUrl}/api/greg/documents`;

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
        '[API] Erreur lors de la récupération des documents:',
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de récupérer les documents',
          details: errorText,
        },
        { status: response.status }
      );
    }

    const documents = await response.json();

    // Filtrer côté client si nécessaire (recherche)
    let filteredDocuments = documents;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredDocuments = documents.filter(
        (doc: {
          spreadsheet_name?: string;
          sheet_name?: string;
          summary?: string;
          categories?: string;
          id?: string;
        }) =>
          (doc.spreadsheet_name?.toLowerCase().includes(query) ?? false) ||
          (doc.sheet_name?.toLowerCase().includes(query) ?? false) ||
          (doc.summary?.toLowerCase().includes(query) ?? false) ||
          (doc.categories?.toLowerCase().includes(query) ?? false) ||
          (doc.id?.toLowerCase().includes(query) ?? false)
      );
    }

    // Pagination côté client
    const total = filteredDocuments.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedDocuments,
      total,
      page,
      page_size: pageSize,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des documents',
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

    // Appel à l'API externe pour créer le document
    const apiUrl = `${apiBaseUrl}/api/greg/documents`;
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
      console.error('[API] Erreur lors de la création du document:', errorText);

      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de créer le document',
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
    console.error('Erreur lors de la création du document:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création du document',
      },
      { status: 500 }
    );
  }
}
