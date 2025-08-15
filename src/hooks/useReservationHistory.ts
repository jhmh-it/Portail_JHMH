/**
 * Hook pour gérer l'historique des réservations
 */

export interface ReservationOverrideHistory {
  id: string;
  field: string;
  fieldName: string; // Display name for the field
  oldValue: unknown;
  newValue: unknown;
  overriddenValue: unknown; // Same as newValue for compatibility
  updatedAt: string;
  createdAt: string; // Same as updatedAt for compatibility
  updatedBy: string;
  createdBy: string; // Same as updatedBy for compatibility
  reason?: string;
}

export function useReservationHistory(_reservationId: string) {
  // TODO: Implémenter la logique pour récupérer l'historique
  return {
    history: [] as ReservationOverrideHistory[],
    isLoading: false,
    error: null,
  };
}
