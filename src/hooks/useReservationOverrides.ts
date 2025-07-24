import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ReservationOverride {
  fieldName: string;
  overriddenValue: string | number;
}

interface OverrideResponse {
  success: boolean;
  data?: {
    successful: Array<{ fieldName: string; success: boolean }>;
    errors: string[];
    totalProcessed: number;
    successCount: number;
    errorCount: number;
  };
  message?: string;
  error?: string;
}

export function useReservationOverrides(confirmationCode: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<OverrideResponse, Error, ReservationOverride[]>({
    mutationFn: async (overrides: ReservationOverride[]) => {
      const response = await fetch(
        `/api/reservations/${confirmationCode}/overrides`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ overrides }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? `Erreur HTTP: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache de la réservation pour refléter les changements
      queryClient.invalidateQueries({
        queryKey: ['reservation-details', confirmationCode],
      });

      // Les toasts sont maintenant gérés par le composant via Zustand
      console.warn(
        '✅ Surcharges soumises avec succès - toasts gérés par le composant'
      );
    },
    onError: error => {
      console.error('❌ Erreur lors de la soumission des surcharges:', error);
      // Les toasts d'erreur sont maintenant gérés par le composant via Zustand
    },
  });

  return {
    submitOverrides: mutation.mutate,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
