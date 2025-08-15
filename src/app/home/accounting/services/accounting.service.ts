/**
 * Service accounting refactorisé
 * Utilise le client API JHMH pour une cohérence applicative
 */

import { jhmhApiClient } from '@/lib/jhmh-api';

import type {
  AccountingTool,
  AccountingToolAPIResponse,
} from '../types/accounting';

/**
 * Options de configuration pour les requêtes
 */
interface RequestOptions {
  /** Temps de cache en secondes (défaut: 300s = 5min) */
  revalidate?: number;
}

/**
 * Transforme une réponse API en format client
 * Applique les transformations métier nécessaires
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
 * Utilise le client API centralisé avec gestion d'erreurs standardisée
 */
export async function fetchAccountingTools(
  _options: RequestOptions = {}
): Promise<AccountingTool[]> {
  // Note: revalidate option not used with jhmhApiClient (axios-based)
  // Future: implement cache invalidation if needed

  try {
    // Utilise jhmhApiClient (axios-based) pour cohérence avec le reste de l'app
    const response = await jhmhApiClient.get<AccountingToolAPIResponse[]>(
      '/api/accounting-tools'
    );

    const tools = response.data;

    if (!Array.isArray(tools)) {
      throw new Error('Invalid API response format: data is not an array');
    }

    return tools.map(transformAccountingTool);
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
