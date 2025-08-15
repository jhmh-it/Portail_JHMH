import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteOverrideResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export function useDeleteOverride(confirmationCode: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteOverrideResponse, Error, string>({
    mutationFn: async (fieldName: string) => {
      const response = await fetch(
        `/api/reservations/${confirmationCode}/overrides/${fieldName}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error ?? `Erreur HTTP: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ['reservation-details', confirmationCode],
      });
      queryClient.invalidateQueries({
        queryKey: ['reservation-history', confirmationCode],
      });

      console.warn('✅ Override supprimé avec succès - caches invalidés');
    },
    onError: error => {
      console.error("❌ Erreur lors de la suppression de l'override:", error);
    },
  });

  return {
    deleteOverride: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
