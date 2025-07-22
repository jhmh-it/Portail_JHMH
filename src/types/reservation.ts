/**
 * Types pour la gestion des réservations
 */

// Type principal pour une réservation
export interface Reservation {
  confirmationCode: string;
  guest_name: string | null;
  listing_name: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  status: string;
  ota: string;
  total_ttc?: number | null;
  currency?: string;
  nights?: number;
  number_of_guests?: number | null;
  reportGenerationTimestamp?: string | null;
}

// Statuts possibles d'une réservation
export type ReservationStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'no_show';

// Paramètres de filtrage pour l'API
export interface ReservationFilters {
  page?: number;
  page_size?: number;
  checkinDateFrom?: string;
  checkinDateTo?: string;
  checkoutDateFrom?: string;
  checkoutDateTo?: string;
  status?: string;
  ota?: string;
  q?: string; // Recherche textuelle
  amountMin?: number;
  amountMax?: number;
  nightsMin?: number;
  nightsMax?: number;
  guestsMin?: number;
  guestsMax?: number;
  currency?: string;
}

// Réponse de l'API pour la liste des réservations
export interface ReservationsResponse {
  reservations: Reservation[];
  total: number;
  page?: number;
  pageSize?: number;
}

// Paramètres pour le hook useReservations
export interface UseReservationsParams {
  filters?: ReservationFilters;
  enabled?: boolean;
}

// Type de retour du hook useReservations
export interface UseReservationsReturn {
  data: ReservationsResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}
