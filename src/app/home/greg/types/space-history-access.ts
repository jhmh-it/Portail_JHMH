import { z } from 'zod';

/**
 * Schema de validation pour créer un accès historique espace
 */
export const createSpaceHistoryAccessSchema = z.object({
  space_id: z.string().min(1, 'space_id est requis'),
  space_target_id: z.string().min(1, 'space_target_id est requis'),
  note: z.string().optional(),
});

/**
 * Schema de validation pour modifier un accès historique espace
 */
export const updateSpaceHistoryAccessSchema = z.object({
  space_id: z.string().min(1, 'space_id est requis'),
  space_target_id: z.string().min(1, 'space_target_id est requis'),
  note: z.string().optional(),
});

/**
 * Schema de validation pour supprimer un accès historique espace
 */
export const deleteSpaceHistoryAccessSchema = z.object({
  space_id: z.string().min(1, 'space_id est requis'),
  space_target_id: z.string().min(1, 'space_target_id est requis'),
});

/**
 * Type pour créer un accès historique espace
 */
export type CreateSpaceHistoryAccessRequest = z.infer<
  typeof createSpaceHistoryAccessSchema
>;

/**
 * Type pour modifier un accès historique espace
 */
export type UpdateSpaceHistoryAccessRequest = z.infer<
  typeof updateSpaceHistoryAccessSchema
>;

/**
 * Type pour supprimer un accès historique espace
 */
export type DeleteSpaceHistoryAccessRequest = z.infer<
  typeof deleteSpaceHistoryAccessSchema
>;

/**
 * Interface pour un accès historique espace
 */
export interface SpaceHistoryAccess {
  space_id: string;
  space_target_id: string;
  granted_at: string;
  note?: string;
}
