/**
 * Types pour l'API Greg - Gestion des documents, espaces et utilisateurs
 */

/**
 * Types de base pour les réponses API
 */
export interface GregApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
}

export interface GregErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: unknown;
  code?: string;
}

export interface GregSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Types pour la pagination
 */
export interface GregPaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GregPaginationParams {
  page?: number;
  page_size?: number;
  q?: string;
}

/**
 * Types pour les catégories
 */
export interface GregCategory {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

/**
 * Types pour les documents
 */
export interface GregDocument {
  id: string;
  title?: string;
  content?: string;
  spreadsheet_name?: string;
  sheet_name?: string;
  summary?: string;
  categories?: string;
  is_pending_review?: boolean;
  pending_for_review?: boolean; // Deprecated alias
  created_at?: string;
  updated_at?: string;
  assigned_spaces?: string[];
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  is_pending_review?: boolean;
  categories?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  is_pending_review?: boolean;
  categories?: string;
}

export interface AssignSpacesRequest {
  space_ids: string[];
}

export interface DocumentFilters extends GregPaginationParams {
  categories?: string[];
  pending_only?: boolean;
}

// Type for documents with all fields as strings (for legacy compatibility)
export interface GregDocumentWithStringFields extends GregDocument {
  [key: string]: string | boolean | string[] | undefined;
}

/**
 * Types pour les espaces
 */
export interface GregSpace {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  assigned_documents?: string[];
  access_permissions?: GregSpaceAccess[];
  // Compatibilité legacy
  space_id?: string;
  space_name?: string;
}

export interface CreateSpaceRequest {
  name: string;
  description?: string;
  type?: string;
}

export interface UpdateSpaceRequest {
  name?: string;
  description?: string;
  type?: string;
  status?: string;
}

export interface AssignDocumentsRequest {
  document_ids: string[];
}

export interface AssignHistoryAccessRequest {
  target_space_ids: string[];
  note?: string;
}

export interface GregSpacesFilters extends GregPaginationParams {
  type?: string;
  status?: string;
}

/**
 * Types pour les accès aux espaces
 */
export interface GregSpaceAccess {
  space_id: string;
  space_target_id: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSpaceAccessRequest {
  space_id: string;
  space_target_id: string;
  note?: string;
}

export interface UpdateSpaceAccessRequest {
  space_id: string;
  space_target_id: string;
  note?: string;
}

export interface DeleteSpaceAccessRequest {
  space_id: string;
  space_target_id: string;
}

/**
 * Types pour les accès aux documents
 */
export interface GregDocumentAccess {
  space_id: string;
  document_id: string;
  created_at?: string;
}

export interface CreateDocumentAccessRequest {
  space_id: string;
  document_id: string;
}

export interface DeleteDocumentAccessRequest {
  space_id: string;
  document_id: string;
}

/**
 * Types pour les utilisateurs
 */
export interface GregUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface UserFilters extends GregPaginationParams {
  role?: string;
  status?: string;
}

/**
 * Types pour les rappels
 */
export interface GregReminder {
  id: string;
  message: string;
  user_id: string;
  target_space_id: string;
  source_space_id?: string;
  status: string;
  remind_at: string;
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReminderRequest {
  message: string;
  user_id: string;
  target_space_id: string;
  source_space_id?: string;
  status: string;
  remind_at: string;
}

export interface UpdateReminderRequest {
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  assigned_to?: string;
  notes?: string;
}

export interface ReminderFilters extends GregPaginationParams {
  status?: string;
  user_id?: string;
}

/**
 * Types pour les équipes/shifts
 */
export interface GregShift {
  id: string;
  space_id: string;
  content: string;
  start_time: string;
  end_time: string;
  name?: string;
  location?: string;
  capacity?: number;
  shift_type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateShiftRequest {
  space_id: string;
  content: string;
  start_time: string;
  end_time: string;
}

export interface UpdateShiftRequest {
  name?: string;
  location?: string;
  capacity?: number;
  shift_type?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
}

export interface ShiftFilters extends GregPaginationParams {
  space_id?: string;
}

/**
 * Types pour les statistiques et santé
 */
export interface GregHealthResponse {
  status: string;
  message: string;
  version?: string;
  timestamp?: string;
}

export interface GregStats {
  total_documents?: number;
  total_spaces?: number;
  total_users?: number;
  total_reminders?: number;
  pending_documents?: number;
  active_spaces?: number;
  last_update?: string;
}

/**
 * Configuration de l'API Greg
 */
export interface GregApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

/**
 * Types pour les erreurs spécifiques Greg
 */
export type GregErrorCode =
  | 'AUTH_UNAVAILABLE'
  | 'API_CONFIG_MISSING'
  | 'INVALID_REQUEST'
  | 'INVALID_SPACE_ID'
  | 'DOCUMENT_NOT_FOUND'
  | 'SPACE_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'REMINDER_NOT_FOUND'
  | 'SHIFT_NOT_FOUND'
  | 'ACCESS_DENIED'
  | 'VALIDATION_ERROR'
  | 'EXTERNAL_API_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

/**
 * Type guard pour vérifier les réponses d'erreur
 */
export function isGregErrorResponse(
  response: GregApiResponse
): response is GregErrorResponse {
  return response.success === false;
}

/**
 * Type guard pour vérifier les réponses de succès
 */
export function isGregSuccessResponse<T>(
  response: GregApiResponse<T>
): response is GregSuccessResponse<T> {
  return response.success === true;
}

/**
 * Types legacy pour compatibilité avec l'ancien code
 */
export type { DocumentFilters as GregDocumentsFilters };
export type { UserFilters as GregUsersFilters };
export type { ReminderFilters as GregRemindersFilters };
export type { ShiftFilters as GregShiftsFilters };

// Ajout des types legacy manquants
export interface GregSpacesFilters {
  page?: number;
  page_size?: number;
  type?: string;
  space_name?: string;
  q?: string;
  space_type?: string;
}

export interface GregSpacesResponse {
  success: boolean;
  data?: GregSpace[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  error?: string;
}

export interface GregDocumentsResponse {
  success: boolean;
  data?: GregDocument[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
  error?: string;
}

export interface GregStatsResponse {
  success: boolean;
  data?: GregStats;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
