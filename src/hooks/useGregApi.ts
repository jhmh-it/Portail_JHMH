import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';

import { useUser } from '@/hooks/useUser';
import type {
  GregHealthResponse,
  GregStatsResponse,
  GregSpacesResponse,
  GregSpacesFilters,
  GregDocumentsResponse,
  GregDocumentsFilters,
  ApiResponse,
} from '@/types/greg';

export function useGregHealth() {
  const { data: user } = useUser();

  return useQuery<ApiResponse<GregHealthResponse>>({
    queryKey: ['greg', 'health'],
    queryFn: async () => {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch('/api/greg/health', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du statut de santé');
      }

      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGregStats() {
  const { data: user } = useUser();

  return useQuery<ApiResponse<GregStatsResponse>>({
    queryKey: ['greg', 'stats'],
    queryFn: async () => {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch('/api/greg/stats', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGregSpaces(filters: GregSpacesFilters) {
  const { data: user } = useUser();

  return useQuery<GregSpacesResponse>({
    queryKey: ['greg', 'spaces', filters],
    queryFn: async () => {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const searchParams = new URLSearchParams();

      // Toujours filtrer sur les salles (ROOM)
      searchParams.set('space_type', 'ROOM');

      // Ajouter les autres filtres
      if (filters.q) searchParams.set('q', filters.q);
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.page_size)
        searchParams.set('page_size', filters.page_size.toString());

      const response = await fetch(
        `/api/greg/spaces?${searchParams.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des espaces');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error ?? 'Erreur lors de la récupération des espaces'
        );
      }

      return {
        data: result.data,
        total: result.total,
        page: result.page,
        page_size: result.page_size,
        total_pages: result.total_pages,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useGregDocuments(filters: GregDocumentsFilters) {
  const { data: user } = useUser();

  return useQuery<GregDocumentsResponse>({
    queryKey: ['greg', 'documents', filters],
    queryFn: async () => {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const searchParams = new URLSearchParams();

      // Ajouter les filtres
      if (filters.q) searchParams.set('q', filters.q);
      if (filters.page) searchParams.set('page', filters.page.toString());
      if (filters.page_size)
        searchParams.set('page_size', filters.page_size.toString());

      // Utiliser la route appropriée selon le filtre pending_only
      const endpoint = filters.pending_only
        ? '/api/greg/documents/pending'
        : '/api/greg/documents';

      const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error ?? 'Erreur lors de la récupération des documents'
        );
      }

      return {
        data: result.data,
        total: result.total,
        page: result.page,
        page_size: result.page_size,
        total_pages: result.total_pages,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
