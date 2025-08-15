/**
 * Export des types Reservation depuis leur emplacement réel
 */
export type {
  ExternalReservation,
  ExternalReservationsResponse,
  ReservationFilters,
  ReservationsServiceResponse,
  ReservationServiceResponse,
} from '@/app/home/exploitation/reservations/types/reservations.types';

export type {
  Reservation,
  ReservationFilters as LegacyReservationFilters,
  ReservationsResponse,
  UseReservationsParams,
  UseReservationsReturn,
} from '@/app/home/exploitation/reservations/types/reservation';
