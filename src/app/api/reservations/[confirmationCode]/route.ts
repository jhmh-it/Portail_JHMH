import { type NextRequest, NextResponse } from 'next/server';

import { fetchJhmhReservationByCode } from '@/lib/external-api';

type Props = {
  params: Promise<{ confirmationCode: string }>;
};

/**
 * GET /api/reservations/[confirmationCode]
 * Récupère les détails d'une réservation spécifique
 */
export async function GET(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const { confirmationCode } = params;

    if (!confirmationCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Code de confirmation requis',
        },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn('[API] Fetching reservation details:', confirmationCode);
    }

    // Appel à l'API externe
    const response = await fetchJhmhReservationByCode(confirmationCode);

    if (!response.success || !response.data) {
      return NextResponse.json(
        {
          success: false,
          error: response.error ?? 'Réservation non trouvée',
        },
        { status: response.error === 'Réservation non trouvée' ? 404 : 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] Error fetching reservation details:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur interne du serveur',
        message:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la récupération de la réservation',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
