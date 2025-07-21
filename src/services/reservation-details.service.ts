import { jhmhApiClient } from '@/lib/external-api';
import type {
  ReservationDetails,
  ReservationDetailsQueryParams,
  ReservationDetailsResponse,
} from '@/types/reservation-details';

interface JhmhApiResponse {
  data: ReservationDetails;
  error: boolean;
  message: string;
  timestamp: string;
}

/**
 * Service to fetch complete reservation details from JHMH API
 */
export async function fetchReservationDetails(
  confirmationCode: string,
  params?: ReservationDetailsQueryParams
): Promise<ReservationDetailsResponse> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params?.include_logs !== undefined) {
      queryParams.append('include_logs', params.include_logs.toString());
    }
    if (params?.include_audit_note !== undefined) {
      queryParams.append(
        'include_audit_note',
        params.include_audit_note.toString()
      );
    }
    if (params?.force_trace !== undefined) {
      queryParams.append('force_trace', params.force_trace.toString());
    }
    if (params?.force_value !== undefined) {
      queryParams.append('force_value', params.force_value.toString());
    }

    const queryString = queryParams.toString();
    const url = `/api/reservations/${confirmationCode}${queryString ? `?${queryString}` : ''}`;

    const response = await jhmhApiClient.get<JhmhApiResponse>(url);

    // Extract the actual reservation data from the response
    if (response.data?.data) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    // Handle case where data structure is unexpected
    return {
      success: false,
      data: null,
      error: 'Format de réponse inattendu',
    };
  } catch (error) {
    console.error('Error fetching reservation details:', error);

    if (error instanceof Error) {
      // Check if it's a 404 error
      if (
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return {
          success: false,
          data: null,
          error: 'Réservation non trouvée',
        };
      }

      return {
        success: false,
        data: null,
        error: error.message || 'Erreur lors du chargement des détails',
      };
    }

    return {
      success: false,
      data: null,
      error: 'Erreur inconnue',
    };
  }
}
