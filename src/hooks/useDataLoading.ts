/**
 * Smart Data Loading Hook
 * Manages loading states ONLY when actually fetching data
 */

'use client';

import { useEffect } from 'react';

import { useLoadingStore } from '@/stores/loading-store';

interface UseDataLoadingOptions {
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Error state if any */
  error?: Error | null;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom loading description */
  loadingDescription?: string;
  /** Whether to show global loading (default: false for better UX) */
  showGlobalLoading?: boolean;
}

/**
 * Smart hook for managing loading states during data fetching
 *
 * PRINCIPLES:
 * 1. Only show loading when actually fetching data
 * 2. Automatically hide loading when data arrives or errors occur
 * 3. No loading for simple page navigation
 * 4. Prefer local loading states over global ones
 *
 * @example
 * ```tsx
 * // In a page that fetches data
 * const { data, isLoading, error } = useQuery(...);
 *
 * useDataLoading({
 *   isLoading,
 *   error,
 *   loadingMessage: 'Loading dashboard data...',
 *   showGlobalLoading: true // Only if really needed
 * });
 * ```
 */
export function useDataLoading({
  isLoading,
  error,
  loadingMessage = 'Chargement des données...',
  loadingDescription = 'Veuillez patienter',
  showGlobalLoading = false, // Default to false for better UX
}: UseDataLoadingOptions) {
  const { showLoading, hideLoading } = useLoadingStore();

  useEffect(() => {
    // Only manage global loading if explicitly requested AND actually loading
    if (!showGlobalLoading) return;

    if (isLoading) {
      // Show loading only when actually fetching
      showLoading(loadingMessage, loadingDescription);
    } else {
      // Hide loading when done (success or error)
      hideLoading();
    }

    // Cleanup: always hide on unmount
    return () => {
      if (showGlobalLoading) {
        hideLoading();
      }
    };
  }, [
    isLoading,
    error,
    showGlobalLoading,
    loadingMessage,
    loadingDescription,
    showLoading,
    hideLoading,
  ]);

  // Return loading state for local UI handling
  return { isLoading, error };
}

/**
 * Hook for pages that need to show loading during critical data fetching
 *
 * Use this ONLY when:
 * 1. Fetching critical data that blocks the entire page
 * 2. The operation takes more than 2 seconds
 * 3. User explicitly triggered a refresh/search
 *
 * DON'T use for:
 * 1. Simple page navigation
 * 2. Background data updates
 * 3. Partial content loading
 */
export function useCriticalDataLoading(options: UseDataLoadingOptions) {
  return useDataLoading({
    ...options,
    showGlobalLoading: true, // Force global loading for critical operations
  });
}
