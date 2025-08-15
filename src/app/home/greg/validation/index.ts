/**
 * Validation pour le module greg
 */

import { z } from 'zod';

/**
 * Schéma de validation pour les documents
 */
export const documentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  content: z.string().optional(),
  category_id: z.string().optional(),
});

/**
 * Schéma de validation pour les espaces
 */
export const spaceSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
});

/**
 * Schéma de validation pour les catégories
 */
export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().default(''),
  color: z.string().optional(),
});

/**
 * Valide les données avec un schéma Zod
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Validation error' };
  }
}

// Alias pour compatibilité
export const createDocumentSchema = documentSchema;
export const updateDocumentSchema = documentSchema.partial();
export const createCategorySchema = categorySchema;
export const assignSpacesSchema = z.object({
  space_ids: z.array(z.string()),
});

// Schémas pour les reminders
export const createReminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
});
export const updateReminderSchema = createReminderSchema.partial();

// Schémas pour les shifts
export const createShiftSchema = z.object({
  name: z.string().min(1),
  start_time: z.string(),
  end_time: z.string(),
});
export const updateShiftSchema = createShiftSchema.partial();

// Fonctions de validation des filtres
export function validateDocumentFilters(params: unknown) {
  // Autoriser uniquement q et categories côté GET /documents
  const p = (params ?? {}) as Record<string, unknown>;
  const q = typeof p.q === 'string' ? p.q : undefined;
  const categories =
    typeof p.categories === 'string' ? p.categories : undefined;
  const safe: {
    q?: string;
    categories?: string[];
    page?: number;
    page_size?: number;
  } = {};
  if (q && q.trim().length > 0) safe.q = q.trim();
  if (categories && categories.trim().length > 0) {
    safe.categories = categories
      .split(',')
      .map((c: string) => c.trim())
      .filter(Boolean);
  }
  // Pour compat, exposer page/page_size uniquement pour pagination locale, mais ne pas les exiger
  if (typeof p.page !== 'undefined') safe.page = Number(p.page) || 1;
  if (typeof p.page_size !== 'undefined')
    safe.page_size = Number(p.page_size) || 20;
  return { success: true, data: safe } as const;
}

export function validateReminderFilters(params: unknown) {
  return {
    success: true,
    data: (params ?? {}) as Record<string, unknown>,
  } as const;
}

export function validateShiftFilters(params: unknown) {
  const p = (params ?? {}) as Record<string, unknown>;
  const safe: { space_id?: string } = {};
  if (typeof p.space_id === 'string' && p.space_id.trim().length > 0) {
    safe.space_id = p.space_id.trim();
  }
  return { success: true, data: safe } as const;
}
