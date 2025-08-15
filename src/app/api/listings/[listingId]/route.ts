import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhListingDetailsById } from '@/app/home/exploitation/actifs/services/listings.service';

/**
 * GET /api/listings/[listingId]
 * Récupère les détails d'un listing depuis l'API JHMH externe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const { listingId } = await params;

    if (!listingId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Listing ID is required',
        },
        { status: 400 }
      );
    }

    // Appeler l'API externe JHMH pour récupérer les détails complets
    const response = await fetchJhmhListingDetailsById(listingId);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error ?? 'Erreur lors de la récupération du listing',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error('Erreur dans GET /api/listings/[listingId]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}
