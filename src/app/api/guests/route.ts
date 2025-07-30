import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhGuests } from '@/lib/external-api';

/**
 * GET /api/guests
 * Récupère les guests depuis l'API JHMH externe
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extraire les paramètres de query
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    const pageSizeParam = searchParams.get('page_size');
    const page_size = pageSizeParam ? parseInt(pageSizeParam) : 20;

    // Filtres de recherche
    const q = searchParams.get('q') ?? undefined;
    const guest_id = searchParams.get('guest_id') ?? undefined;
    const confirmation_code =
      searchParams.get('confirmation_code') ?? undefined;

    // Validation de base
    if (page_size > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page size cannot exceed 100',
        },
        { status: 400 }
      );
    }

    // Appeler l'API externe JHMH
    const response = await fetchJhmhGuests({
      page,
      page_size,
      q,
      guest_id,
      confirmation_code,
    });

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error ?? 'Erreur lors de la récupération des guests',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data?.data ?? [],
      meta: response.data?.meta ?? {},
    });
  } catch (error) {
    console.error('Erreur dans GET /api/guests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}
