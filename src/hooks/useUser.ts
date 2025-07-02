'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { User } from '@/types/auth';

interface UserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const useUser = () => {
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
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 