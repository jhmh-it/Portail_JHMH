/**
 * Types pour la gestion des actifs
 */

// Type principal pour un actif
export interface Actif {
  code_site: string;
  date_ouverture: string;
  id_opening: string;
  listing_complet: string;
  numero_mairie: string;
  superficie_m2: number | null;
  type_logement: string;
}

// Paramètres de filtrage pour l'API
export interface ActifsFilters {
  page?: number;
  page_size?: number;
  limit?: number;
  offset?: number;
  code_site?: string;
  type_logement?: string;
  order_by?:
    | 'listing_complet'
    | 'date_ouverture'
    | 'superficie_m2'
    | 'code_site';
  order_direction?: 'ASC' | 'DESC';
  q?: string; // Recherche textuelle
  superficie_min?: number;
  superficie_max?: number;
  date_ouverture_from?: string;
  date_ouverture_to?: string;
}

// Réponse de l'API pour la liste des actifs
export interface ActifsResponse {
  actifs: Actif[];
  total: number;
  page?: number;
  pageSize?: number;
}

// Paramètres pour le hook useActifs
export interface UseActifsParams {
  filters?: ActifsFilters;
  enabled?: boolean;
}

// Type de retour du hook useActifs
export interface UseActifsReturn {
  data: ActifsResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}
