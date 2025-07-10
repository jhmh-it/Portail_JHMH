import { NextResponse } from 'next/server';

import { fetchJhmhActifs } from '@/lib/external-api';

// Export du type pour les autres composants
export interface Actif {
  id: string;
  label: string;
  description: string;
  type: 'global' | 'property' | 'zone';
  isActive: boolean;
}

/**
 * GET /api/actifs
 * Récupère les actifs depuis l'API JHMH externe
 */
export async function GET() {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching actifs from external JHMH API...');
    }

    // Appel à l'API externe
    const response = await fetchJhmhActifs();

    if (!response.success) {
      console.warn(
        '[API] External API returned success: false, returning empty data'
      );
      return NextResponse.json(
        {
          success: false,
          data: [],
          error: 'External API error',
          message: "Impossible de récupérer les actifs depuis l'API externe",
          meta: {
            total: 0,
            generatedAt: new Date().toISOString(),
            source: 'external-api',
          },
        },
        { status: 503 }
      ); // Service Unavailable
    }

    // Filtrer seulement les actifs actifs
    const activeActifs = response.data.filter(actif => actif.isActive);

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[API] Successfully fetched ${activeActifs.length} active actifs`
      );
    }

    return NextResponse.json({
      success: true,
      data: activeActifs,
      meta: {
        total: activeActifs.length,
        generatedAt: new Date().toISOString(),
        source: 'external-api',
      },
    });
  } catch (error) {
    console.error('[API] Error fetching actifs from external API:', error);

    // En cas d'erreur, on peut soit retourner une erreur, soit un fallback
    // Ici on retourne l'erreur pour debug, mais on pourrait aussi faire un fallback
    return NextResponse.json(
      {
        success: false,
        error: 'External API error',
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des actifs depuis l'API externe",
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
