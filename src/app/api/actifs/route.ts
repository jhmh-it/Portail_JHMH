/**
 * API Route Next.js pour les actifs
 * Récupère la liste simple des actifs pour les dropdowns
 */

import { type NextRequest, NextResponse } from 'next/server';

import type {
  ActifsListingsApiResponse,
  ActifsListingsApiError,
} from '@/app/home/exploitation/actifs/types';
import { jhmhApiClient, ERROR_MESSAGES } from '@/lib/jhmh-api';

/**
 * Récupère la liste simple des actifs depuis l'API JHMH
 */
async function fetchSimpleActifs(): Promise<string[]> {
  try {
    const response = await jhmhApiClient.get<string[]>('/api/assets/actifs');
    return response.data ?? [];
  } catch (error) {
    console.error('Error fetching simple actifs:', error);
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN
    );
  }
}

/**
 * GET /api/actifs
 * Récupère la liste simple des actifs pour les dropdowns
 */
export async function GET(_request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching simple actifs list');
    }

    // Récupérer la liste simple des actifs
    const actifsData = await fetchSimpleActifs();

    // Transformer en format attendu minimalement conforme à ActifListing
    // Nous ne connaissons pas toutes les infos → on met des valeurs par défaut plausibles
    const transformedData = actifsData.map(actifId => ({
      code_site: actifId,
      date_ouverture: new Date().toISOString(),
      id_opening: actifId,
      listing_complet: actifId,
      numero_mairie: '',
      superficie_m2: 0,
      type_logement: 'Unknown',
    }));

    const successResponse: ActifsListingsApiResponse = {
      success: true,
      data: transformedData,
      meta: {
        total: transformedData.length,
        generatedAt: new Date().toISOString(),
        source: 'jhmh-api-simple',
      },
    };

    return NextResponse.json(successResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5min cache
      },
    });
  } catch (error) {
    console.error('[API] Error in actifs route:', error);

    const errorResponse: ActifsListingsApiError = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Erreur serveur lors de la récupération des actifs',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
