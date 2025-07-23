import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhListingsActifs } from '@/lib/external-api';

/**
 * GET /api/listings-actifs
 * Récupère les listings actifs détaillés depuis l'API JHMH externe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Paramètres de pagination côté serveur
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Paramètres de filtrage à passer à l'API externe
    const filters = {
      code_site: searchParams.get('code_site') ?? undefined,
      type_logement: searchParams.get('type_logement') ?? undefined,
      order_by: searchParams.get('order_by') ?? undefined,
      order_direction: searchParams.get('order_direction') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      superficie_min: searchParams.get('superficie_min')
        ? parseFloat(searchParams.get('superficie_min') ?? '0')
        : undefined,
      superficie_max: searchParams.get('superficie_max')
        ? parseFloat(searchParams.get('superficie_max') ?? '0')
        : undefined,
      date_ouverture_from: searchParams.get('date_ouverture_from') ?? undefined,
      date_ouverture_to: searchParams.get('date_ouverture_to') ?? undefined,
    };

    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching listings actifs with filters:', filters);
      console.warn('[API] Pagination params:', { limit, offset });
    }

    // Récupérer TOUS les actifs de l'API externe (sans pagination)
    const response = await fetchJhmhListingsActifs(filters);

    if (!response.success) {
      console.error(
        '[API] Failed to fetch listings actifs from external API:',
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

    // Appliquer la pagination côté serveur sur toutes les données
    const allActifs = response.data;
    const totalItems = allActifs.length;
    const paginatedActifs = allActifs.slice(offset, offset + limit);

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API] Successfully fetched ${totalItems} total actifs, returning ${paginatedActifs.length} for page`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        actifs: paginatedActifs,
        total: totalItems, // Le vrai total maintenant !
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
        data: {
          actifs: [],
          total: 0,
          limit: 20,
          offset: 0,
        },
      },
      { status: 500 }
    );
  }
}
