import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';
import { fetchReservationDetails } from '@/services/reservation-details.service';
import type { ReservationDetailsQueryParams } from '@/types/reservation-details';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ confirmationCode: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que Firebase Admin est disponible
    if (!adminAuth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporairement indisponible',
          code: 'AUTH_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Verify the session token
    try {
      await adminAuth.verifyIdToken(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Session invalide' },
        { status: 401 }
      );
    }

    const { confirmationCode } = await context.params;

    if (!confirmationCode) {
      return NextResponse.json(
        { success: false, error: 'Code de confirmation manquant' },
        { status: 400 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: ReservationDetailsQueryParams = {
      include_logs: searchParams.get('include_logs') === 'true',
      include_audit_note: searchParams.get('include_audit_note') === 'true',
      force_trace: searchParams.get('force_trace') === 'true',
      force_value: searchParams.get('force_value') === 'true',
    };

    // Fetch reservation details from external API
    const result = await fetchReservationDetails(confirmationCode, queryParams);

    if (!result.success) {
      const status = result.error === 'Réservation non trouvée' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in reservation details API route:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: 'Erreur serveur interne',
      },
      { status: 500 }
    );
  }
}
