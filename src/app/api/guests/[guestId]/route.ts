import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhGuestById } from '@/lib/external-api';

/**
 * GET /api/guests/[guestId]
 * Récupère un guest spécifique par son ID depuis l'API JHMH externe
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;

    if (!guestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID du guest requis',
        },
        { status: 400 }
      );
    }

    // Appeler l'API externe JHMH
    const response = await fetchJhmhGuestById(guestId);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          error: response.error ?? 'Erreur lors de la récupération du guest',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data?.data ?? [],
      meta: response.data?.meta ?? {},
    });
  } catch (error) {
    console.error('Erreur dans GET /api/guests/[guestId]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
      },
      { status: 500 }
    );
  }
}
