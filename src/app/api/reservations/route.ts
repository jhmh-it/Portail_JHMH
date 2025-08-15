import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhReservations } from '@/app/home/exploitation/reservations/services/reservations.service';

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
    const confirmationCode = searchParams.get('confirmation_code') ?? undefined;

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
          confirmationCode,
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
      confirmationCode,
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

    // Normalize external API payload to match frontend expectations
    interface Financials {
      subtotal_price?: number;
      total?: number;
      currency?: string;
    }
    interface GuestsCount {
      total?: number;
    }
    interface ListingInfo {
      nickname?: string;
      full_address?: string;
    }
    interface RawReservation {
      confirmationCode?: string;
      confirmation_code?: string;
      REF?: string;
      id?: string;
      guest_name?: string;
      GUEST_NAME?: string;
      listing_name?: string;
      listing_info?: ListingInfo;
      checkin_date?: string;
      check_in?: string;
      checkout_date?: string;
      check_out?: string;
      status?: string;
      ota?: string;
      source?: string;
      total_ttc?: number | string;
      TOTAL_TTC?: number;
      currency?: string;
      financials?: Financials;
      nights?: number;
      NUMBER_OF_NIGHTS?: number | string;
      number_of_guests?: number | string;
      NUMBER_OF_GUESTS?: number | string;
      guests_count?: GuestsCount;
      reportGenerationTimestamp?: string;
      report_generation_timestamp?: string;
    }
    const normalizedReservations = (
      response.data as unknown as RawReservation[]
    ).map(raw => {
      const financials: Financials = raw?.financials ?? {};
      const guestsCount: GuestsCount = raw?.guests_count ?? {};
      const listingInfo: ListingInfo = raw?.listing_info ?? {};

      const confirmationCode =
        raw?.confirmationCode ??
        raw?.confirmation_code ??
        raw?.REF ??
        raw?.id ??
        '';

      let totalTtc: number | null = null;
      if (typeof raw?.total_ttc === 'number') totalTtc = raw.total_ttc;
      else if (typeof raw?.TOTAL_TTC === 'number') totalTtc = raw.TOTAL_TTC;
      else if (typeof financials?.subtotal_price === 'number')
        totalTtc = financials.subtotal_price;
      else if (typeof financials?.total === 'number')
        totalTtc = financials.total;
      else if (raw?.total_ttc != null) totalTtc = Number(raw.total_ttc);

      const currency = raw?.currency ?? financials?.currency ?? 'EUR';

      // Estimation du nombre de nuits si non fourni
      let nights: number | undefined =
        typeof raw?.nights === 'number' ? raw.nights : undefined;
      const ciStr = raw?.check_in ?? raw?.checkin_date ?? undefined;
      const coStr = raw?.check_out ?? raw?.checkout_date ?? undefined;
      if (!nights && ciStr && coStr) {
        const ci = new Date(ciStr);
        const co = new Date(coStr);
        const diff = Math.round(
          (co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)
        );
        nights = Number.isFinite(diff) ? diff : undefined;
      }

      return {
        confirmationCode,
        guest_name: raw?.guest_name ?? raw?.GUEST_NAME ?? null,
        listing_name: raw?.listing_name ?? listingInfo?.nickname ?? null,
        checkin_date: raw?.checkin_date ?? raw?.check_in ?? null,
        checkout_date: raw?.checkout_date ?? raw?.check_out ?? null,
        status: raw?.status ?? 'unknown',
        ota: raw?.ota ?? raw?.source ?? 'manual',
        total_ttc: totalTtc,
        currency,
        nights:
          nights ??
          (raw?.NUMBER_OF_NIGHTS ? Number(raw.NUMBER_OF_NIGHTS) : undefined),
        number_of_guests:
          raw?.number_of_guests ??
          (guestsCount?.total !== undefined
            ? Number(guestsCount.total)
            : undefined) ??
          (raw?.NUMBER_OF_GUESTS !== undefined
            ? Number(raw.NUMBER_OF_GUESTS)
            : null),
        reportGenerationTimestamp:
          raw?.reportGenerationTimestamp ??
          raw?.report_generation_timestamp ??
          null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        reservations: normalizedReservations,
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
