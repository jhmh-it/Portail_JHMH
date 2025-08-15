import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhListingsActifs } from '@/app/home/exploitation/actifs/services/listings.service';
import type { ListingActifFilters } from '@/app/home/exploitation/actifs/services/listings.types';

/**
 * GET /api/assets/listings-actifs
 * Récupère la liste des listings actifs depuis l'API JHMH externe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Construction des filtres à partir des query parameters
    const filters: ListingActifFilters = {};

    // Filtres de base
    const code_site = searchParams.get('code_site');
    if (code_site) filters.code_site = code_site;

    const type_logement = searchParams.get('type_logement');
    if (type_logement) filters.type_logement = type_logement;

    const order_by = searchParams.get('order_by');
    if (order_by) filters.order_by = order_by;

    const order_direction = searchParams.get('order_direction');
    if (
      order_direction &&
      (order_direction === 'ASC' || order_direction === 'DESC')
    ) {
      filters.order_direction = order_direction;
    }

    // Filtres de recherche
    const q = searchParams.get('q') ?? searchParams.get('search');
    if (q) filters.q = q;

    // Filtres de superficie
    const superficie_min = searchParams.get('superficie_min');
    if (superficie_min) filters.superficie_min = Number(superficie_min);

    const superficie_max = searchParams.get('superficie_max');
    if (superficie_max) filters.superficie_max = Number(superficie_max);

    // Filtres de date
    const date_ouverture_from = searchParams.get('date_ouverture_from');
    if (date_ouverture_from) filters.date_ouverture_from = date_ouverture_from;

    const date_ouverture_to = searchParams.get('date_ouverture_to');
    if (date_ouverture_to) filters.date_ouverture_to = date_ouverture_to;

    // Appeler l'API externe JHMH
    const response = await fetchJhmhListingsActifs(filters);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            response.error ??
            'Erreur lors de la récupération des listings actifs',
        },
        { status: 500 }
      );
    }

    // Retourner directement les données (array) comme dans l'exemple fourni
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erreur dans GET /api/assets/listings-actifs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}
