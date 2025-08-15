import { logJhmhApiCall, logGregApiError } from '@/lib/api-logger';

import type {
  GregApiConfig,
  GregApiResponse,
  GregCategory,
  GregDocument,
  GregSpace,
  GregUser,
  GregReminder,
  GregShift,
  GregHealthResponse,
  GregStats,
  GregPaginatedResponse,
  CreateCategoryRequest,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  AssignSpacesRequest,
  CreateSpaceRequest,
  UpdateSpaceRequest,
  AssignDocumentsRequest,
  AssignHistoryAccessRequest,
  CreateSpaceAccessRequest,
  UpdateSpaceAccessRequest,
  DeleteSpaceAccessRequest,
  CreateDocumentAccessRequest,
  DeleteDocumentAccessRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateReminderRequest,
  UpdateReminderRequest,
  CreateShiftRequest,
  UpdateShiftRequest,
  DocumentFilters,
  UserFilters,
  ReminderFilters,
  ShiftFilters,
  GregErrorCode,
} from '../types/greg';

/**
 * Service centralisé pour l'API Greg
 * Gère toutes les interactions avec l'API externe JHMH Greg
 */

/**
 * Configuration par défaut de l'API
 */
const DEFAULT_CONFIG: Partial<GregApiConfig> = {
  timeout: 30000, // 30 secondes
};

/**
 * Messages d'erreur standardisés
 */
const ERROR_MESSAGES = {
  CONFIG_MISSING: 'Configuration API manquante',
  NETWORK_ERROR: 'Erreur réseau',
  TIMEOUT: 'Timeout de la requête',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur',
  VALIDATION_ERROR: 'Erreur de validation',
  UNKNOWN_ERROR: 'Erreur inconnue',
} as const;

/**
 * Classe du service Greg
 */
export class GregService {
  private config: GregApiConfig;

  constructor(config: GregApiConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Méthode générique pour effectuer des requêtes vers l'API Greg
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GregApiResponse<T>> {
    const startTime = Date.now();
    const method = options.method ?? 'GET';
    const url = `${this.config.baseUrl}/api/greg${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.config.apiKey,
          ...options.headers,
        },
        signal: AbortSignal.timeout(
          this.config.timeout ?? DEFAULT_CONFIG.timeout ?? 30000
        ),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = this.getErrorMessage(response.status);

        // Log de l'erreur JHMH API
        logJhmhApiCall(endpoint, method, false, {
          statusCode: response.status,
          duration,
          error: errorMessage,
          requestParams: this.parseRequestBody(options.body),
        });

        return {
          success: false,
          error: errorMessage,
          details: errorText,
        };
      }

      const data = await response.json();

      // Log du succès JHMH API
      logJhmhApiCall(endpoint, method, true, {
        statusCode: response.status,
        duration,
        responseSize: JSON.stringify(data).length,
        requestParams: this.parseRequestBody(options.body),
      });

      return {
        success: true,
        data,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;

      // Log de l'erreur JHMH API (network error, timeout, etc.)
      logJhmhApiCall(endpoint, method, false, {
        duration,
        error: errorMessage,
        requestParams: this.parseRequestBody(options.body),
      });

      logGregApiError('makeRequest', endpoint, error, {
        method,
        url,
        options,
      });

      return {
        success: false,
        error: errorMessage,
        details: error,
      };
    }
  }

  /**
   * Parse le body de la requête pour le logging
   */
  private parseRequestBody(
    body?: BodyInit | null
  ): Record<string, unknown> | undefined {
    if (!body) return undefined;

    try {
      if (typeof body === 'string') {
        return JSON.parse(body);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Obtient un message d'erreur basé sur le code de statut HTTP
   */
  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return ERROR_MESSAGES.TIMEOUT;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  /**
   * Construit les paramètres de requête pour la pagination et filtres
   */
  private buildQueryParams(
    params:
      | Record<string, unknown>
      | DocumentFilters
      | UserFilters
      | ReminderFilters
      | ShiftFilters
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }

  // ===============================
  // Méthodes pour les catégories
  // ===============================

  async getCategories(): Promise<GregApiResponse<GregCategory[]>> {
    return this.makeRequest<GregCategory[]>('/categories');
  }

  async createCategory(
    data: CreateCategoryRequest
  ): Promise<GregApiResponse<GregCategory>> {
    return this.makeRequest<GregCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: string): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // Méthodes pour les documents
  // ===============================

  async getDocuments(
    filters?: DocumentFilters
  ): Promise<GregApiResponse<GregPaginatedResponse<GregDocument>>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    const endpoint = `/documents${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<GregPaginatedResponse<GregDocument>>(endpoint);
  }

  async getPendingDocuments(
    filters?: DocumentFilters
  ): Promise<GregApiResponse<GregPaginatedResponse<GregDocument>>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    const endpoint = `/documents/pending${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<GregPaginatedResponse<GregDocument>>(endpoint);
  }

  async getDocument(
    documentId: string
  ): Promise<GregApiResponse<GregDocument>> {
    return this.makeRequest<GregDocument>(`/documents/${documentId}`);
  }

  async createDocument(
    data: CreateDocumentRequest
  ): Promise<GregApiResponse<GregDocument>> {
    return this.makeRequest<GregDocument>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDocument(
    documentId: string,
    data: UpdateDocumentRequest
  ): Promise<GregApiResponse<GregDocument>> {
    return this.makeRequest<GregDocument>(`/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(documentId: string): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async assignSpacesToDocument(
    documentId: string,
    data: AssignSpacesRequest
  ): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>(`/documents/${documentId}/assign-spaces`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ===============================
  // Méthodes pour les espaces
  // ===============================

  async getSpaces(filters?: {
    q?: string;
  }): Promise<GregApiResponse<GregSpace[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    const endpoint = `/spaces${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<GregSpace[]>(endpoint);
  }

  async getSpace(spaceId: string): Promise<GregApiResponse<GregSpace>> {
    // Ajouter le préfixe "spaces/" si nécessaire
    const fullSpaceId = spaceId.startsWith('spaces/')
      ? spaceId
      : `spaces/${spaceId}`;
    return this.makeRequest<GregSpace>(`/spaces/${fullSpaceId}`);
  }

  async createSpace(
    data: CreateSpaceRequest
  ): Promise<GregApiResponse<GregSpace>> {
    return this.makeRequest<GregSpace>('/spaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSpace(
    spaceId: string,
    data: UpdateSpaceRequest
  ): Promise<GregApiResponse<GregSpace>> {
    // Ajouter le préfixe "spaces/" si nécessaire
    const fullSpaceId = spaceId.startsWith('spaces/')
      ? spaceId
      : `spaces/${spaceId}`;
    return this.makeRequest<GregSpace>(`/spaces/${fullSpaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSpace(spaceId: string): Promise<GregApiResponse<void>> {
    // Ajouter le préfixe "spaces/" si nécessaire
    const fullSpaceId = spaceId.startsWith('spaces/')
      ? spaceId
      : `spaces/${spaceId}`;
    return this.makeRequest<void>(`/spaces/${fullSpaceId}`, {
      method: 'DELETE',
    });
  }

  async assignDocumentsToSpace(
    spaceId: string,
    data: AssignDocumentsRequest
  ): Promise<GregApiResponse<void>> {
    // Ajouter le préfixe "spaces/" si nécessaire
    const fullSpaceId = spaceId.startsWith('spaces/')
      ? spaceId
      : `spaces/${spaceId}`;
    return this.makeRequest<void>(`/spaces/${fullSpaceId}/assign-documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignHistoryAccessToSpace(
    spaceId: string,
    data: AssignHistoryAccessRequest
  ): Promise<GregApiResponse<void>> {
    // Ajouter le préfixe "spaces/" si nécessaire
    const fullSpaceId = spaceId.startsWith('spaces/')
      ? spaceId
      : `spaces/${spaceId}`;
    return this.makeRequest<void>(
      `/spaces/${fullSpaceId}/assign-history-access`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // ===============================
  // Méthodes pour les accès
  // ===============================

  async getSpaceDocumentAccess(): Promise<GregApiResponse<unknown[]>> {
    return this.makeRequest<unknown[]>('/space-document-access');
  }

  async createSpaceDocumentAccess(
    data: CreateDocumentAccessRequest
  ): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>('/space-document-access', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSpaceDocumentAccess(
    data: DeleteDocumentAccessRequest
  ): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>('/space-document-access', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async getSpaceHistoryAccess(): Promise<GregApiResponse<unknown[]>> {
    return this.makeRequest<unknown[]>('/space-history-access');
  }

  async createSpaceHistoryAccess(
    data: CreateSpaceAccessRequest
  ): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>('/space-history-access', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSpaceHistoryAccess(
    data: UpdateSpaceAccessRequest
  ): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>('/space-history-access', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSpaceHistoryAccess(
    data: DeleteSpaceAccessRequest
  ): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>('/space-history-access', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // ===============================
  // Méthodes pour les utilisateurs
  // ===============================

  async getUsers(filters?: UserFilters): Promise<GregApiResponse<GregUser[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<GregUser[]>(endpoint);
  }

  async getUser(userId: string): Promise<GregApiResponse<GregUser>> {
    return this.makeRequest<GregUser>(`/users/${userId}`);
  }

  async createUser(
    data: CreateUserRequest
  ): Promise<GregApiResponse<GregUser>> {
    return this.makeRequest<GregUser>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<GregApiResponse<GregUser>> {
    return this.makeRequest<GregUser>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // Méthodes pour les rappels
  // ===============================

  async getReminders(
    filters?: ReminderFilters
  ): Promise<GregApiResponse<GregReminder[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    const endpoint = `/reminders${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<GregReminder[]>(endpoint);
  }

  async getReminder(
    reminderId: string
  ): Promise<GregApiResponse<GregReminder>> {
    return this.makeRequest<GregReminder>(`/reminders/${reminderId}`);
  }

  async createReminder(
    data: CreateReminderRequest
  ): Promise<GregApiResponse<GregReminder>> {
    return this.makeRequest<GregReminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReminder(
    reminderId: string,
    data: UpdateReminderRequest
  ): Promise<GregApiResponse<GregReminder>> {
    return this.makeRequest<GregReminder>(`/reminders/${reminderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReminder(reminderId: string): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>(`/reminders/${reminderId}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // Méthodes pour les équipes/shifts
  // ===============================

  async getShifts(
    filters?: ShiftFilters
  ): Promise<GregApiResponse<GregShift[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    const endpoint = `/shifts${queryString ? `?${queryString}` : ''}`;
    return this.makeRequest<GregShift[]>(endpoint);
  }

  async getShift(shiftId: string): Promise<GregApiResponse<GregShift>> {
    return this.makeRequest<GregShift>(`/shifts/${shiftId}`);
  }

  async createShift(
    data: CreateShiftRequest
  ): Promise<GregApiResponse<GregShift>> {
    return this.makeRequest<GregShift>('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShift(
    shiftId: string,
    data: UpdateShiftRequest
  ): Promise<GregApiResponse<GregShift>> {
    return this.makeRequest<GregShift>(`/shifts/${shiftId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShift(shiftId: string): Promise<GregApiResponse<void>> {
    return this.makeRequest<void>(`/shifts/${shiftId}`, {
      method: 'DELETE',
    });
  }

  // ===============================
  // Méthodes pour la santé et stats
  // ===============================

  async getHealth(): Promise<GregApiResponse<GregHealthResponse>> {
    return this.makeRequest<GregHealthResponse>('/health');
  }

  async getStats(): Promise<GregApiResponse<GregStats>> {
    return this.makeRequest<GregStats>('/stats');
  }
}

/**
 * Instance singleton du service Greg
 */
let gregServiceInstance: GregService | null = null;

/**
 * Factory function pour créer ou récupérer l'instance du service Greg
 */
export function createGregService(): GregService | null {
  const baseUrl = process.env.JHMH_API_BASE_URL;
  const apiKey = process.env.JHMH_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error(
      '[Greg Service] Configuration manquante - JHMH_API_BASE_URL ou JHMH_API_KEY'
    );
    return null;
  }

  gregServiceInstance ??= new GregService({
    baseUrl,
    apiKey,
  });

  return gregServiceInstance;
}

/**
 * Hook pour utiliser le service Greg avec vérification de configuration
 */
export function useGregService(): {
  service: GregService | null;
  isConfigured: boolean;
  error?: string;
} {
  const service = createGregService();

  return {
    service,
    isConfigured: service !== null,
    error: service === null ? ERROR_MESSAGES.CONFIG_MISSING : undefined,
  };
}

/**
 * Fonction utilitaire pour créer des réponses d'erreur standardisées
 */
export function createGregErrorResponse(
  error: string,
  code?: GregErrorCode,
  details?: unknown,
  message?: string
): {
  success: false;
  error: string;
  code?: GregErrorCode;
  details?: unknown;
  message?: string;
} {
  const result: {
    success: false;
    error: string;
    code?: GregErrorCode;
    details?: unknown;
    message?: string;
  } = {
    success: false,
    error,
  };

  if (code) {
    result.code = code;
  }

  if (message) {
    result.message = message;
  }

  if (details) {
    result.details = details;
  }

  return result;
}

/**
 * Fonction utilitaire pour créer des réponses de succès standardisées
 */
export function createGregSuccessResponse<T>(
  data: T,
  message?: string
): { success: true; data: T; message?: string } {
  const result: { success: true; data: T; message?: string } = {
    success: true,
    data,
  };

  if (message) {
    result.message = message;
  }

  return result;
}
