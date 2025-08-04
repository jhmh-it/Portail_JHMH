import type {
  AccountingTool,
  AccountingToolAPIResponse,
  AccountingToolsApiResponse,
  AccountingToolsApiError,
} from '@/types/accounting';

/**
 * Service pour les outils comptables
 * Centralise tous les appels API liés aux accounting tools
 */

/**
 * Options de configuration pour les requêtes
 */
interface RequestOptions {
  /** Temps de cache en secondes (défaut: 300s = 5min) */
  revalidate?: number;
  /** Tags pour l'invalidation du cache */
  tags?: string[];
}

/**
 * Type guard pour vérifier si la réponse est un succès
 */
function isSuccessResponse(
  data: AccountingToolsApiResponse | AccountingToolsApiError
): data is AccountingToolsApiResponse {
  return data.success === true;
}

/**
 * Transforme une réponse API en format client
 */
function transformAccountingTool(
  apiTool: AccountingToolAPIResponse
): AccountingTool {
  return {
    id: apiTool.id,
    title: apiTool.name,
    url: apiTool.href,
    description: apiTool.description,
  };
}

/**
 * Récupère la liste des outils comptables
 * Utilise le cache Next.js pour optimiser les performances
 */
export async function fetchAccountingTools(
  options: RequestOptions = {}
): Promise<AccountingTool[]> {
  const { revalidate = 300, tags = ['accounting-tools'] } = options;

  try {
    const response = await fetch('/api/accounting-tools', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate,
        tags,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AccountingToolsApiResponse | AccountingToolsApiError =
      await response.json();

    if (!isSuccessResponse(data)) {
      throw new Error(data.error);
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Invalid API response format: data is not an array');
    }

    return data.data.map(transformAccountingTool);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching accounting tools:', error);
    throw new Error(`Failed to fetch accounting tools: ${message}`);
  }
}

/**
 * Fonction utilitaire pour invalider le cache des outils comptables
 * À utiliser après des modifications côté admin
 */
export function invalidateAccountingToolsCache(): void {
  // Cette fonction sera utile quand on aura un système de revalidation
  // Pour l'instant, elle sert de placeholder pour l'évolutivité
  console.warn('Cache invalidation requested for accounting tools');
}
