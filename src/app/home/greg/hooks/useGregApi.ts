import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';

import { useUser } from '@/hooks/useUser';

import type {
  GregSpacesFilters,
  GregDocumentsFilters,
  GregDocument,
} from '../types/greg';

export function useGregHealth() {
  const { data: user } = useUser();

  return useQuery({
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

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error ?? 'Erreur lors de la récupération du statut de santé'
        );
      }

      // Retourner directement les données aplaties
      return result.data;
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

  return useQuery({
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

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error ?? 'Erreur lors de la récupération des statistiques'
        );
      }

      // Retourner directement les données aplaties
      return result.data;
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

  return useQuery({
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

  return useQuery({
    // N.B. L'API documents ne supporte pas page/page_size → on les exclut de la clé réseau
    queryKey: [
      'greg',
      'documents',
      {
        q: filters.q ?? undefined,
        categories: filters.categories ?? undefined,
        pending_only: filters.pending_only ?? undefined,
      },
      // On ajoute une clé locale pour permettre un re-render sur changement de pagination
      { page: filters.page ?? 1, page_size: filters.page_size ?? 20 },
    ],
    queryFn: async () => {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      const searchParams = new URLSearchParams();
      // Transmettre la pagination à nos routes Next.js (elles paginent côté serveur)
      const page = filters.page ?? 1;
      const pageSize = filters.page_size ?? 20;
      searchParams.set('page', String(page));
      searchParams.set('page_size', String(pageSize));
      if (filters.q) searchParams.set('q', filters.q);
      if (filters.categories && filters.categories.length > 0) {
        searchParams.set('categories', filters.categories.join(','));
      }

      // Utiliser la route appropriée selon le filtre pending_only
      const endpoint = filters.pending_only
        ? '/api/greg/documents/pending'
        : '/api/greg/documents';

      const url = searchParams.toString()
        ? `${endpoint}?${searchParams.toString()}`
        : endpoint;
      const response = await fetch(url, {
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

      // Déballer la payload renvoyée par createGregSuccessResponse (uniformisation)
      const payload = result.data;
      let docsArray: GregDocument[] = [];
      if (Array.isArray(payload)) {
        docsArray = payload as GregDocument[];
      } else if (
        payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { data?: unknown[] }).data)
      ) {
        docsArray = ((payload as { data?: unknown[] }).data ??
          []) as GregDocument[];
      }
      const total: number = payload?.total ?? docsArray.length;
      const currentPage: number = payload?.page ?? page;
      const currentPageSize: number = payload?.page_size ?? pageSize;
      const totalPages: number =
        payload?.total_pages ?? Math.max(1, Math.ceil(total / currentPageSize));

      return {
        data: docsArray,
        total,
        page: currentPage,
        page_size: currentPageSize,
        total_pages: totalPages,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
