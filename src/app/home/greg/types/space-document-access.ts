import { z } from 'zod';

/**
 * Schema de validation pour créer un accès document-espace
 */
export const createSpaceDocumentAccessSchema = z.object({
  space_id: z.string().min(1, 'space_id est requis'),
  document_id: z.string().min(1, 'document_id est requis'),
});

/**
 * Schema de validation pour supprimer un accès document-espace
 */
export const deleteSpaceDocumentAccessSchema = z.object({
  space_id: z.string().min(1, 'space_id est requis'),
  document_id: z.string().min(1, 'document_id est requis'),
});

/**
 * Type pour créer un accès document-espace
 */
export type CreateSpaceDocumentAccessRequest = z.infer<
  typeof createSpaceDocumentAccessSchema
>;

/**
 * Type pour supprimer un accès document-espace
 */
export type DeleteSpaceDocumentAccessRequest = z.infer<
  typeof deleteSpaceDocumentAccessSchema
>;

/**
 * Interface pour un accès document-espace
 */
export interface SpaceDocumentAccess {
  space_id: string;
  document_id: string;
  granted_at: string;
}
