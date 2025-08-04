import { type NextRequest, NextResponse } from 'next/server';

import { jhmhApiClient } from '@/lib/external-api';
import type {
  ActifListingAPIResponse,
  ActifsListingsApiResponse,
  ActifsListingsApiError,
  ActifsListingsFilters,
} from '@/types/actifs';

/**
 * Extrait et valide les filtres depuis les paramètres de requête
 */
function extractFilters(searchParams: URLSearchParams): ActifsListingsFilters {
  const filters: ActifsListingsFilters = {};

  // Paramètres supportés par l'API externe (selon swagger)
  const code_site = searchParams.get('code_site');
  if (code_site) filters.code_site = code_site;

  const type_logement = searchParams.get('type_logement');
  if (type_logement) filters.type_logement = type_logement;

  const limitParam = searchParams.get('limit');
  if (limitParam) {
    const limit = parseInt(limitParam);
    if (!isNaN(limit) && limit > 0 && limit <= 100) {
      filters.limit = limit;
    }
  }

  const offsetParam = searchParams.get('offset');
  if (offsetParam) {
    const offset = parseInt(offsetParam);
    if (!isNaN(offset) && offset >= 0) {
      filters.offset = offset;
    }
  }

  const order_by = searchParams.get('order_by');
  if (
    order_by &&
    [
      'listing_complet',
      'date_ouverture',
      'superficie_m2',
      'code_site',
    ].includes(order_by)
  ) {
    filters.order_by = order_by as ActifsListingsFilters['order_by'];
  }

  const order_direction = searchParams.get('order_direction');
  if (order_direction && ['ASC', 'DESC'].includes(order_direction)) {
    filters.order_direction =
      order_direction as ActifsListingsFilters['order_direction'];
  }

  // Extensions locales (filtrage côté serveur si l'API externe ne les supporte pas)
  const q = searchParams.get('q');
  if (q) filters.q = q;

  const superficie_minParam = searchParams.get('superficie_min');
  if (superficie_minParam) {
    const superficie_min = parseFloat(superficie_minParam);
    if (!isNaN(superficie_min)) filters.superficie_min = superficie_min;
  }

  const superficie_maxParam = searchParams.get('superficie_max');
  if (superficie_maxParam) {
    const superficie_max = parseFloat(superficie_maxParam);
    if (!isNaN(superficie_max)) filters.superficie_max = superficie_max;
  }

  const date_ouverture_from = searchParams.get('date_ouverture_from');
  if (date_ouverture_from) filters.date_ouverture_from = date_ouverture_from;

  const date_ouverture_to = searchParams.get('date_ouverture_to');
  if (date_ouverture_to) filters.date_ouverture_to = date_ouverture_to;

  return filters;
}

/**
 * Applique les filtres non supportés par l'API externe côté serveur
 */
function applyServerSideFilters(
  actifs: ActifListingAPIResponse[],
  filters: ActifsListingsFilters
): ActifListingAPIResponse[] {
  let filtered = actifs;

  // Recherche textuelle
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(
      actif =>
        actif.listing_complet.toLowerCase().includes(query) ||
        actif.code_site.toLowerCase().includes(query) ||
        actif.type_logement.toLowerCase().includes(query) ||
        actif.numero_mairie.toLowerCase().includes(query)
    );
  }

  // Filtrage par superficie
  if (filters.superficie_min !== undefined) {
    const minValue = filters.superficie_min;
    filtered = filtered.filter(actif => actif.superficie_m2 >= minValue);
  }
  if (filters.superficie_max !== undefined) {
    const maxValue = filters.superficie_max;
    filtered = filtered.filter(actif => actif.superficie_m2 <= maxValue);
  }

  // Filtrage par date d'ouverture
  if (filters.date_ouverture_from) {
    const fromDate = filters.date_ouverture_from;
    filtered = filtered.filter(actif => actif.date_ouverture >= fromDate);
  }
  if (filters.date_ouverture_to) {
    const toDate = filters.date_ouverture_to;
    filtered = filtered.filter(actif => actif.date_ouverture <= toDate);
  }

  return filtered;
}

/**
 * GET /api/actifs
 * Récupère les listings actifs depuis l'API JHMH externe /api/assets/listings-actifs
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ActifsListingsApiResponse | ActifsListingsApiError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = extractFilters(searchParams);

    // Validation de base
    if (filters.limit && filters.limit > 100) {
      const errorResponse: ActifsListingsApiError = {
        success: false,
        error: 'Limit cannot exceed 100',
        message: 'La limite ne peut pas dépasser 100 éléments',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching actifs listings from external JHMH API...', {
        filters,
      });
    }

    // Construire les paramètres pour l'API externe (uniquement ceux supportés par le swagger)
    const externalParams = new URLSearchParams();
    if (filters.code_site)
      externalParams.append('code_site', filters.code_site);
    if (filters.type_logement)
      externalParams.append('type_logement', filters.type_logement);
    if (filters.limit) externalParams.append('limit', String(filters.limit));
    if (filters.offset) externalParams.append('offset', String(filters.offset));
    if (filters.order_by) externalParams.append('order_by', filters.order_by);
    if (filters.order_direction)
      externalParams.append('order_direction', filters.order_direction);

    const externalUrl = `/api/assets/listings-actifs${externalParams.toString() ? `?${externalParams.toString()}` : ''}`;

    // Appel à l'API externe avec les paramètres supportés
    const response =
      await jhmhApiClient.get<ActifListingAPIResponse[]>(externalUrl);

    if (!Array.isArray(response.data)) {
      throw new Error('API response is not an array');
    }

    // Appliquer les filtres non supportés par l'API externe côté serveur
    const filteredActifs = applyServerSideFilters(response.data, filters);

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API] Successfully fetched ${filteredActifs.length} actifs listings`
      );
    }

    const successResponse: ActifsListingsApiResponse = {
      success: true,
      data: filteredActifs,
      meta: {
        total: filteredActifs.length,
        generatedAt: new Date().toISOString(),
        source: 'external-api',
      },
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(
      '[API] Error fetching actifs listings from external API:',
      error
    );

    const errorResponse: ActifsListingsApiError = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Erreur lors de la récupération des actifs',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
  }
}
