'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { signOutUser } from '@/lib/firebase-client';
import { useToastStore } from '@/stores/toast-store';
import type { User } from '@/types/auth';

interface UserResponse {
  success: boolean;
  user?: User;
  error?: string;
  code?: string;
}

export const useUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showAuthError } = useToastStore();

  // Fonction de déconnexion automatique en cas d'expiration du token
  const handleTokenExpired = useCallback(async () => {
    try {
      // Nettoyer le cache
      queryClient.clear();

      // Déconnexion côté Firebase
      await signOutUser();

      // Afficher le toast
      showAuthError('Votre session a expiré. Vous avez été déconnecté.');

      // Rediriger vers login
      router.push('/login');
    } catch (logoutError) {
      console.error('Erreur lors de la déconnexion automatique:', logoutError);
      // Même en cas d'erreur, on redirige vers login
      router.push('/login');
    }
  }, [queryClient, router, showAuthError]);

  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await axios.get<UserResponse>('/api/auth/me');

        if (response.data.success && response.data.user) {
          return response.data.user;
        }

        return null;
      } catch (error: unknown) {
        // Si l'utilisateur n'est pas connecté, on retourne null au lieu de throw
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Vérifier si c'est une expiration de token
          if (error.response?.data?.code === 'TOKEN_EXPIRED') {
            // Déclencher la déconnexion automatique
            handleTokenExpired();
          }
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
