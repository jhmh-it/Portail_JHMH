import { useQuery } from '@tanstack/react-query';

export interface ReservationOverrideHistory {
  confirmationCode: string;
  createdAt: string;
  createdBy: string;
  fieldName: string;
  overriddenValue: string;
}

export interface ReservationHistoryResponse {
  data: ReservationOverrideHistory[];
  error: boolean;
  message: string;
}

export function useReservationHistory(confirmationCode: string) {
  return useQuery<ReservationHistoryResponse>({
    queryKey: ['reservation-history', confirmationCode],
    queryFn: async () => {
      const response = await fetch(
        `/api/reservations/${confirmationCode}/overrides`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique");
      }

      return response.json();
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
