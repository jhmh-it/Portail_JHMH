import { z } from 'zod';

import type {
  GregPaginationParams,
  DocumentFilters,
  UserFilters,
  ReminderFilters,
  ShiftFilters,
} from '../types/greg';

/**
 * Schemas de validation pour les entités Greg
 */

// Schemas de base
const objectIdSchema = z.string().min(1, 'ID requis');
const optionalStringSchema = z.string().optional();
const requiredStringSchema = z.string().min(1, 'Champ requis');
const dateTimeSchema = z.string().datetime('Format datetime ISO requis');
const optionalDateTimeSchema = z.string().datetime().optional();

// Schema pour la pagination
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  page_size: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: optionalStringSchema,
});

// Schemas pour les catégories
export const createCategorySchema = z.object({
  name: requiredStringSchema.max(255, 'Nom trop long'),
  description: requiredStringSchema.max(1000, 'Description trop longue'),
});

export const updateCategorySchema = z
  .object({
    name: z.string().max(255, 'Nom trop long').optional(),
    description: z.string().max(1000, 'Description trop longue').optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

// Schemas pour les documents
export const createDocumentSchema = z.object({
  title: requiredStringSchema.max(255, 'Titre trop long'),
  content: requiredStringSchema.max(5000, 'Contenu trop long'),
  is_pending_review: z.boolean().optional().default(false),
  categories: optionalStringSchema,
});

export const updateDocumentSchema = z
  .object({
    title: z.string().max(255, 'Titre trop long').optional(),
    content: z.string().max(5000, 'Contenu trop long').optional(),
    is_pending_review: z.boolean().optional(),
    categories: optionalStringSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const assignSpacesSchema = z.object({
  space_ids: z.array(objectIdSchema).min(1, 'Au moins un espace requis'),
});

export const documentFiltersSchema = paginationParamsSchema.extend({
  categories: z.array(z.string()).optional(),
});

// Schemas pour les espaces
export const createSpaceSchema = z.object({
  name: requiredStringSchema.max(255, 'Nom trop long'),
  description: z.string().max(1000, 'Description trop longue').optional(),
  type: optionalStringSchema,
});

export const updateSpaceSchema = z
  .object({
    name: z.string().max(255, 'Nom trop long').optional(),
    description: z.string().max(1000, 'Description trop longue').optional(),
    type: optionalStringSchema,
    status: optionalStringSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const assignDocumentsSchema = z.object({
  document_ids: z.array(objectIdSchema).min(1, 'Au moins un document requis'),
});

export const assignHistoryAccessSchema = z.object({
  target_space_ids: z
    .array(objectIdSchema)
    .min(1, 'Au moins un espace cible requis'),
  note: optionalStringSchema,
});

// Schemas pour les accès aux espaces
export const createSpaceAccessSchema = z.object({
  space_id: objectIdSchema,
  space_target_id: objectIdSchema,
  note: optionalStringSchema,
});

export const updateSpaceAccessSchema = z.object({
  space_id: objectIdSchema,
  space_target_id: objectIdSchema,
  note: optionalStringSchema,
});

export const deleteSpaceAccessSchema = z.object({
  space_id: objectIdSchema,
  space_target_id: objectIdSchema,
});

// Schemas pour les accès aux documents
export const createDocumentAccessSchema = z.object({
  space_id: objectIdSchema,
  document_id: objectIdSchema,
});

export const deleteDocumentAccessSchema = z.object({
  space_id: objectIdSchema,
  document_id: objectIdSchema,
});

// Schemas pour les utilisateurs
export const createUserSchema = z.object({
  name: requiredStringSchema.max(255, 'Nom trop long'),
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  role: optionalStringSchema,
});

export const updateUserSchema = z
  .object({
    name: z.string().max(255, 'Nom trop long').optional(),
    email: z
      .string()
      .email('Email invalide')
      .max(255, 'Email trop long')
      .optional(),
    role: optionalStringSchema,
    status: optionalStringSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const userFiltersSchema = paginationParamsSchema.extend({
  role: optionalStringSchema,
  status: optionalStringSchema,
});

// Schemas pour les rappels
export const createReminderSchema = z.object({
  message: requiredStringSchema.max(1000, 'Message trop long'),
  user_id: objectIdSchema,
  target_space_id: objectIdSchema,
  source_space_id: optionalStringSchema,
  status: requiredStringSchema,
  remind_at: dateTimeSchema,
});

export const updateReminderSchema = z
  .object({
    title: z.string().max(255, 'Titre trop long').optional(),
    description: z.string().max(1000, 'Description trop longue').optional(),
    type: optionalStringSchema,
    status: optionalStringSchema,
    priority: optionalStringSchema,
    due_date: optionalDateTimeSchema,
    assigned_to: optionalStringSchema,
    notes: z.string().max(2000, 'Notes trop longues').optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  });

export const reminderFiltersSchema = paginationParamsSchema.extend({
  status: optionalStringSchema,
  user_id: optionalStringSchema,
});

// Schemas pour les équipes/shifts
export const createShiftSchema = z
  .object({
    space_id: objectIdSchema,
    content: requiredStringSchema.max(1000, 'Contenu trop long'),
    start_time: dateTimeSchema,
    end_time: dateTimeSchema,
  })
  .refine(data => new Date(data.end_time) > new Date(data.start_time), {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['end_time'],
  });

export const updateShiftSchema = z
  .object({
    name: z.string().max(255, 'Nom trop long').optional(),
    location: z.string().max(255, 'Localisation trop longue').optional(),
    capacity: z.number().int().min(1).optional(),
    shift_type: optionalStringSchema,
    start_time: optionalDateTimeSchema,
    end_time: optionalDateTimeSchema,
    status: optionalStringSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  })
  .refine(
    data => {
      if (data.start_time && data.end_time) {
        return new Date(data.end_time) > new Date(data.start_time);
      }
      return true;
    },
    {
      message: 'La date de fin doit être postérieure à la date de début',
      path: ['end_time'],
    }
  );

export const shiftFiltersSchema = paginationParamsSchema.extend({
  space_id: optionalStringSchema,
});

/**
 * Types inférés des schemas
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type AssignSpacesInput = z.infer<typeof assignSpacesSchema>;
export type DocumentFiltersInput = z.infer<typeof documentFiltersSchema>;
export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type AssignDocumentsInput = z.infer<typeof assignDocumentsSchema>;
export type AssignHistoryAccessInput = z.infer<
  typeof assignHistoryAccessSchema
>;
export type CreateSpaceAccessInput = z.infer<typeof createSpaceAccessSchema>;
export type UpdateSpaceAccessInput = z.infer<typeof updateSpaceAccessSchema>;
export type DeleteSpaceAccessInput = z.infer<typeof deleteSpaceAccessSchema>;
export type CreateDocumentAccessInput = z.infer<
  typeof createDocumentAccessSchema
>;
export type DeleteDocumentAccessInput = z.infer<
  typeof deleteDocumentAccessSchema
>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type ReminderFiltersInput = z.infer<typeof reminderFiltersSchema>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type ShiftFiltersInput = z.infer<typeof shiftFiltersSchema>;
export type PaginationParamsInput = z.infer<typeof paginationParamsSchema>;

/**
 * Fonctions utilitaires de validation
 */

/**
 * Valide les paramètres de pagination
 */
export function validatePaginationParams(
  params: Record<string, string | null>
):
  | { success: true; data: GregPaginationParams }
  | { success: false; errors: z.ZodError } {
  const result = paginationParamsSchema.safeParse({
    page: params.page,
    page_size: params.page_size,
    q: params.q,
  });

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Valide un ID d'entité
 */
export function validateEntityId(id: string): boolean {
  return objectIdSchema.safeParse(id).success;
}

/**
 * Extrait les paramètres de recherche d'une URL de manière sécurisée
 */
export function extractGregSearchParams(
  url: string
): Record<string, string | null> {
  try {
    const { searchParams } = new URL(url);
    return Object.fromEntries(searchParams.entries());
  } catch {
    return {};
  }
}

/**
 * Valide et parse les filtres de document
 */
export function validateDocumentFilters(
  params: Record<string, string | null>
):
  | { success: true; data: DocumentFilters }
  | { success: false; errors: z.ZodError } {
  const processedParams = {
    ...params,
    categories: params.categories ? params.categories.split(',') : undefined,
  };

  const result = documentFiltersSchema.safeParse(processedParams);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Valide et parse les filtres d'utilisateur
 */
export function validateUserFilters(
  params: Record<string, string | null>
):
  | { success: true; data: UserFilters }
  | { success: false; errors: z.ZodError } {
  const result = userFiltersSchema.safeParse(params);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Valide et parse les filtres de rappel
 */
export function validateReminderFilters(
  params: Record<string, string | null>
):
  | { success: true; data: ReminderFilters }
  | { success: false; errors: z.ZodError } {
  const result = reminderFiltersSchema.safeParse(params);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Valide et parse les filtres de shift
 */
export function validateShiftFilters(
  params: Record<string, string | null>
):
  | { success: true; data: ShiftFilters }
  | { success: false; errors: z.ZodError } {
  const result = shiftFiltersSchema.safeParse(params);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}
