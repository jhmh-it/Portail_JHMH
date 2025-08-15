/**
 * Types globaux uniquement
 * Les types feature-based sont dans src/app/home/[feature]/types/
 */

// Types d'authentification globaux
export * from './auth';

// Types des composants d'état globaux
export * from './states';

// Type utilitaire pour les API responses
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
