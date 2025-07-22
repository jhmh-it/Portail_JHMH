import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhListingsActifs } from '@/lib/external-api';

/**
 * GET /api/listings-actifs
 * Récupère les listings actifs détaillés depuis l'API JHMH externe
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extraire les paramètres de pagination
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 20;
    const offsetParam = searchParams.get('offset');
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    // Filtres de recherche
    const code_site = searchParams.get('code_site') ?? undefined;
    const type_logement = searchParams.get('type_logement') ?? undefined;
    const order_by = searchParams.get('order_by') ?? undefined;
    const order_direction = searchParams.get('order_direction') ?? undefined;
    const q = searchParams.get('q') ?? undefined;

    // Filtres numériques
    const superficie_minParam = searchParams.get('superficie_min');
    const superficie_min = superficie_minParam
      ? parseFloat(superficie_minParam)
      : undefined;
    const superficie_maxParam = searchParams.get('superficie_max');
    const superficie_max = superficie_maxParam
      ? parseFloat(superficie_maxParam)
      : undefined;
    const date_ouverture_from =
      searchParams.get('date_ouverture_from') ?? undefined;
    const date_ouverture_to =
      searchParams.get('date_ouverture_to') ?? undefined;

    // Validation de base
    if (limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit cannot exceed 100',
        },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching listings actifs from external JHMH API...', {
        limit,
        offset,
        filters: {
          code_site,
          type_logement,
          order_by,
          order_direction,
          q,
          superficie_min,
          superficie_max,
          date_ouverture_from,
          date_ouverture_to,
        },
      });
    }

    // Appel à l'API externe
    const response = await fetchJhmhListingsActifs({
      limit,
      offset,
      code_site,
      type_logement,
      order_by,
      order_direction,
      q,
      superficie_min,
      superficie_max,
      date_ouverture_from,
      date_ouverture_to,
    });

    if (!response.success || response.data.length === undefined) {
      console.warn(
        '[API] External API returned error or invalid data',
        response.error
      );
      return NextResponse.json(
        {
          success: false,
          error: response.error ?? 'Failed to fetch listings actifs',
          data: {
            actifs: [],
            total: 0,
            limit,
            offset,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API] Successfully fetched ${response.data.length} listings actifs`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        actifs: response.data,
        total: response.total,
        limit,
        offset,
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: 'external-api',
      },
    });
  } catch (error) {
    console.error(
      '[API] Error fetching listings actifs from external API:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des listings actifs',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
