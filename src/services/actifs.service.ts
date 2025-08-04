import type {
  ActifListing,
  ActifListingAPIResponse,
  ActifsListingsFilters,
  ActifsListingsApiResponse,
  ActifsListingsApiError,
} from '@/types/actifs';

/**
 * Service pour les actifs (listings actifs)
 * Centralise tous les appels API liés aux actifs
 */

/**
 * Options de configuration pour les requêtes
 */
interface RequestOptions {
  /** Temps de cache en secondes (défaut: 900s = 15min) */
  revalidate?: number;
  /** Tags pour l'invalidation du cache */
  tags?: string[];
}

/**
 * Type guard pour vérifier si la réponse est un succès
 */
function isSuccessResponse(
  data: ActifsListingsApiResponse | ActifsListingsApiError
): data is ActifsListingsApiResponse {
  return data.success === true;
}

/**
 * Transforme une réponse API en format client
 * (Dans ce cas, pas de transformation nécessaire)
 */
function transformActifListing(
  apiActif: ActifListingAPIResponse
): ActifListing {
  return apiActif;
}

/**
 * Récupère la liste des actifs (listings actifs)
 * Utilise le cache Next.js pour optimiser les performances
 */
export async function fetchActifsListings(
  filters: ActifsListingsFilters = {},
  options: RequestOptions = {}
): Promise<ActifListing[]> {
  const { revalidate = 900, tags = ['actifs-listings'] } = options;

  try {
    // Construire l'URL avec les paramètres de requête
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const url = `/api/actifs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
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

    const data: ActifsListingsApiResponse | ActifsListingsApiError =
      await response.json();

    if (!isSuccessResponse(data)) {
      throw new Error(data.error);
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Invalid API response format: data is not an array');
    }

    return data.data.map(transformActifListing);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching actifs listings:', error);
    throw new Error(`Failed to fetch actifs listings: ${message}`);
  }
}

/**
 * Récupère les métadonnées des actifs (total, etc.)
 */
export async function fetchActifsListingsMeta(
  filters: ActifsListingsFilters = {},
  options: RequestOptions = {}
): Promise<{ total: number; generatedAt: string; source: string }> {
  const { revalidate = 900, tags = ['actifs-listings-meta'] } = options;

  try {
    const searchParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const url = `/api/actifs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
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

    const data: ActifsListingsApiResponse | ActifsListingsApiError =
      await response.json();

    if (!isSuccessResponse(data)) {
      throw new Error(data.error);
    }

    return data.meta;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching actifs listings meta:', error);
    throw new Error(`Failed to fetch actifs listings meta: ${message}`);
  }
}

/**
 * Fonction utilitaire pour invalider le cache des actifs
 * À utiliser après des modifications côté admin
 */
export function invalidateActifsListingsCache(): void {
  // Cette fonction sera utile quand on aura un système de revalidation
  // Pour l'instant, elle sert de placeholder pour l'évolutivité
  console.warn('Cache invalidation requested for actifs listings');
}

/**
 * Fonction utilitaire pour obtenir les codes de site uniques
 */
export async function getUniqueCodesSite(
  options: RequestOptions = {}
): Promise<string[]> {
  try {
    const actifs = await fetchActifsListings({}, options);
    const uniqueCodes = [...new Set(actifs.map(actif => actif.code_site))];
    return uniqueCodes.sort();
  } catch (error) {
    console.error('Error getting unique codes site:', error);
    return [];
  }
}

/**
 * Fonction utilitaire pour obtenir les types de logement uniques
 */
export async function getUniqueTypesLogement(
  options: RequestOptions = {}
): Promise<string[]> {
  try {
    const actifs = await fetchActifsListings({}, options);
    const uniqueTypes = [...new Set(actifs.map(actif => actif.type_logement))];
    return uniqueTypes.sort();
  } catch (error) {
    console.error('Error getting unique types logement:', error);
    return [];
  }
}
