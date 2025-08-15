import { type NextRequest, NextResponse } from 'next/server';

import type { ExternalGuestsResponse } from '@/app/home/exploitation/guests/types';
import { jhmhApiClient, ERROR_MESSAGES } from '@/lib/jhmh-api';

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

    // Construire les paramètres de la requête
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (page_size) queryParams.append('page_size', page_size.toString());
    if (q) queryParams.append('q', q);
    if (guest_id) queryParams.append('guest_id', guest_id);
    if (confirmation_code)
      queryParams.append('confirmation_code', confirmation_code);

    // Appeler l'API externe JHMH directement
    const queryString = queryParams.toString();
    const url = `/api/guestymirror/guests${queryString ? `?${queryString}` : ''}`;

    const response = await jhmhApiClient.get<ExternalGuestsResponse>(url);

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
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN,
      },
      { status: 500 }
    );
  }
}
