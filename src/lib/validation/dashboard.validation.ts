import { z } from 'zod';

import type { DashboardMetricsQuery } from '@/types/dashboard';

/**
 * Schema de validation pour les paramètres de requête des métriques dashboard
 */
export const dashboardMetricsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .describe('Date au format YYYY-MM-DD'),
  actif: z
    .string()
    .optional()
    .default('global')
    .describe("Identifiant de l'actif à analyser"),
});

/**
 * Type inféré du schema de validation
 */
export type DashboardMetricsQueryInput = z.infer<
  typeof dashboardMetricsQuerySchema
>;

/**
 * Valide et parse les paramètres de requête pour les métriques dashboard
 */
export function validateDashboardMetricsQuery(
  params: Record<string, string | null>
):
  | { success: true; data: DashboardMetricsQuery }
  | { success: false; errors: z.ZodError } {
  const result = dashboardMetricsQuerySchema.safeParse({
    date: params.date,
    actif: params.actif,
  });

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Valide si un actif est dans la liste des actifs autorisés
 */
export function validateActif(
  actif: string,
  validActifs: readonly string[]
): boolean {
  return validActifs.includes(actif);
}

/**
 * Extrait les paramètres de recherche d'une URL
 */
export function extractSearchParams(
  url: string
): Record<string, string | null> {
  const { searchParams } = new URL(url);

  return {
    date: searchParams.get('date'),
    actif: searchParams.get('actif'),
  };
}
