/**
 * Unified Tool Navigation Hook
 * Smart navigation without unnecessary loading states
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { Tool } from '../types';

/**
 * Custom hook for unified tool navigation
 * Features: Smart navigation without global loading for simple page transitions
 *
 * IMPORTANT: This hook no longer shows global loading by default.
 * Pages that need loading should manage it themselves when fetching data.
 */
export function useToolNavigation() {
  const router = useRouter();
  const [loadingToolId, setLoadingToolId] = useState<string | null>(null);

  /**
   * Handle tool click - Simple navigation without global loading
   *
   * Why no loading?
   * - Next.js handles page transitions smoothly
   * - Pages that fetch data will show their own loading states
   * - Avoids the "loading that never closes" problem
   * - Better UX with instant navigation feedback
   */
  const handleToolClick = async (tool: Tool) => {
    if (!tool.available) return;

    try {
      // Set local loading state for button feedback only
      setLoadingToolId(tool.id);

      // Simply navigate - no global loading needed
      // Next.js will handle the transition, and the destination
      // page will manage its own loading if it needs to fetch data
      router.push(tool.href);
      // Important: do NOT reset loading state here.
      // The component will unmount on route change, keeping the button in
      // loading state until the new page is rendered.
    } catch (error) {
      console.error(`Error navigating to ${tool.title}:`, error);
      setLoadingToolId(null);
    }
  };

  /**
   * Check if a specific tool is loading
   */
  const isToolLoading = (toolId: string): boolean => {
    return loadingToolId === toolId;
  };

  /**
   * Check if any tool is loading
   */
  const isAnyToolLoading = (): boolean => {
    return loadingToolId !== null;
  };

  return {
    handleToolClick,
    isToolLoading,
    isAnyToolLoading,
    loadingToolId,
  };
}
