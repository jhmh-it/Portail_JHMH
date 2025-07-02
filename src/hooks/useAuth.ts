'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutUser,
} from '@/lib/firebase-client';
import { useToastStore } from '@/stores/toast-store';
import type { LoginResponse } from '@/types/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showAuthSuccess, showAuthError } = useToastStore();

  // Mutation pour la connexion
  const loginMutation = useMutation({
    mutationFn: async (idToken: string): Promise<LoginResponse> => {
      const response = await axios.post('/api/auth/login', { idToken });
      return response.data;
    },
    onSuccess: data => {
      if (data.success) {
        showAuthSuccess('Connexion réussie !');
        // Invalider le cache pour forcer le refetch des données utilisateur
        queryClient.invalidateQueries({ queryKey: ['user'] });
        router.push('/dashboard');
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        showAuthError(
          error.response?.data?.error ?? 'Erreur lors de la connexion'
        );
      } else {
        showAuthError('Erreur lors de la connexion');
      }
    },
  });

  // Mutation pour la déconnexion
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await axios.post('/api/auth/logout');
      } catch (serverError) {
        console.warn(
          'Server logout failed, proceeding with client logout:',
          serverError
        );
      }
      await signOutUser();
    },
    onSuccess: () => {
      showAuthSuccess('Déconnexion réussie');
      queryClient.clear();
      router.push('/login');
    },
    onError: (error: unknown) => {
      console.error('Erreur lors de la déconnexion:', error);
    },
  });

  /**
   * Connecter un utilisateur avec Google
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Connexion avec Firebase
      const result = await firebaseSignInWithGoogle();
      const idToken = await result.user.getIdToken();

      // Envoi du token au serveur
      loginMutation.mutate(idToken);
    } catch (error: unknown) {
      console.error('Erreur lors de la connexion:', error);

      // Gestion des erreurs spécifiques Firebase
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          showAuthError("Connexion annulée par l'utilisateur");
        } else if (firebaseError.code === 'auth/popup-blocked') {
          showAuthError(
            'Popup bloquée par le navigateur. Veuillez autoriser les popups.'
          );
        } else {
          showAuthError('Erreur lors de la connexion avec Google');
        }
      } else {
        showAuthError('Erreur lors de la connexion avec Google');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnecter l'utilisateur
   */
  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    signInWithGoogle,
    logout,
    loading: loading || loginMutation.isPending || logoutMutation.isPending,
  };
};
