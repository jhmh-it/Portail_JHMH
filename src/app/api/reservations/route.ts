import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhReservations } from '@/lib/external-api';

/**
 * GET /api/reservations
 * Récupère les réservations depuis l'API JHMH externe
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extraire les paramètres de query
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    const pageSizeParam = searchParams.get('page_size');
    const page_size = pageSizeParam ? parseInt(pageSizeParam) : 20;

    // Filtres de recherche (noms frontend en camelCase)
    const checkinDateFrom = searchParams.get('checkinDateFrom') ?? undefined;
    const checkinDateTo = searchParams.get('checkinDateTo') ?? undefined;
    const checkoutDateFrom = searchParams.get('checkoutDateFrom') ?? undefined;
    const checkoutDateTo = searchParams.get('checkoutDateTo') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const ota = searchParams.get('ota') ?? undefined;
    const q = searchParams.get('q') ?? undefined;

    // Filtres numériques
    const amountMinParam = searchParams.get('amountMin');
    const amountMin = amountMinParam ? parseFloat(amountMinParam) : undefined;
    const amountMaxParam = searchParams.get('amountMax');
    const amountMax = amountMaxParam ? parseFloat(amountMaxParam) : undefined;
    const nightsMinParam = searchParams.get('nightsMin');
    const nightsMin = nightsMinParam ? parseInt(nightsMinParam) : undefined;
    const nightsMaxParam = searchParams.get('nightsMax');
    const nightsMax = nightsMaxParam ? parseInt(nightsMaxParam) : undefined;
    const guestsMinParam = searchParams.get('guestsMin');
    const guestsMin = guestsMinParam ? parseInt(guestsMinParam) : undefined;
    const guestsMaxParam = searchParams.get('guestsMax');
    const guestsMax = guestsMaxParam ? parseInt(guestsMaxParam) : undefined;
    const currency = searchParams.get('currency') ?? undefined;

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

    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching reservations from external JHMH API...', {
        page,
        page_size,
        filters: {
          checkinDateFrom,
          checkinDateTo,
          checkoutDateFrom,
          checkoutDateTo,
          status,
          ota,
          q,
          amountMin,
          amountMax,
          nightsMin,
          nightsMax,
          guestsMin,
          guestsMax,
          currency,
        },
      });
    }

    // Appel à l'API externe
    const response = await fetchJhmhReservations({
      page,
      page_size,
      checkinDateFrom,
      checkinDateTo,
      checkoutDateFrom,
      checkoutDateTo,
      status,
      ota,
      q,
      amountMin,
      amountMax,
      nightsMin,
      nightsMax,
      guestsMin,
      guestsMax,
      currency,
    });

    if (!response.success || response.data.length === undefined) {
      console.warn(
        '[API] External API returned error or invalid data',
        response.error
      );
      return NextResponse.json(
        {
          success: false,
          error: response.error ?? 'Failed to fetch reservations',
          data: {
            reservations: [],
            total: 0,
            page,
            page_size,
          },
        },
        { status: 503 } // Service Unavailable
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API] Successfully fetched ${response.data.length} reservations`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reservations: response.data,
        total: response.total,
        page,
        page_size,
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: 'external-api',
      },
    });
  } catch (error) {
    console.error(
      '[API] Error fetching reservations from external API:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération des réservations',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
