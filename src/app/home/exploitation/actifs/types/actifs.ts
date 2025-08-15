/**
 * Types pour la gestion des actifs
 * Basé sur le swagger.json /api/assets/listings-actifs
 */

/**
 * Structure d'un actif selon l'API externe (swagger)
 */
export interface ActifListingAPIResponse {
  /** Le code du site, ex: 14M, 17C */
  code_site: string;
  /** La date d'ouverture */
  date_ouverture: string;
  /** L'identifiant unique d'ouverture */
  id_opening: string;
  /** Le nom complet du listing, ex: (14M) STUDIO (601) */
  listing_complet: string;
  /** Le numéro d'identification de la mairie */
  numero_mairie: string;
  /** La superficie en mètres carrés */
  superficie_m2: number;
  /** Le type de logement simplifié, ex: STUDIO */
  type_logement: string;
}

/**
 * Structure d'un actif côté client (identique à l'API pour ce cas)
 */
export type ActifListing = ActifListingAPIResponse;

/**
 * Paramètres de filtrage supportés par l'API (selon swagger)
 */
export interface ActifsListingsFilters {
  /** Filtrer par code de site (ex: 14M, 15C) */
  code_site?: string;
  /** Filtrer par type de logement (ex: STUDIO, T2) */
  type_logement?: string;
  /** Nombre maximum de résultats à retourner */
  limit?: number;
  /** Nombre d'éléments à ignorer pour la pagination */
  offset?: number;
  /** Colonne pour le tri */
  order_by?:
    | 'listing_complet'
    | 'date_ouverture'
    | 'superficie_m2'
    | 'code_site';
  /** Direction du tri */
  order_direction?: 'ASC' | 'DESC';
  /** Recherche textuelle (extension locale) */
  q?: string;
  /** Filtrage par superficie (extensions locales) */
  superficie_min?: number;
  superficie_max?: number;
  /** Filtrage par date d'ouverture (extensions locales) */
  date_ouverture_from?: string;
  date_ouverture_to?: string;
}

/**
 * Réponse de notre API /api/actifs
 */
export interface ActifsListingsApiResponse {
  /** Indicateur de succès */
  success: true;
  /** Liste des actifs */
  data: ActifListing[];
  /** Métadonnées */
  meta: {
    /** Nombre total d'éléments */
    total: number;
    /** Horodatage de génération */
    generatedAt: string;
    /** Source des données */
    source: string;
  };
}

/**
 * Réponse d'erreur de notre API
 */
export interface ActifsListingsApiError {
  /** Indicateur d'échec */
  success: false;
  /** Message d'erreur */
  error: string;
  /** Message utilisateur */
  message?: string;
  /** Détails supplémentaires (dev uniquement) */
  details?: unknown;
}

/**
 * Types de logement supportés
 */
export type TypeLogement = 'STUDIO' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/**
 * Codes de site supportés
 */
export type CodeSite = '14M' | '15C' | '17C' | '82S';

/**
 * Types d'ordre supportés
 */
export type OrderBy =
  | 'listing_complet'
  | 'date_ouverture'
  | 'superficie_m2'
  | 'code_site';

/**
 * Direction de tri
 */
export type OrderDirection = 'ASC' | 'DESC';

// Types historiques pour compatibilité (DEPRECATED - utiliser ActifListing)
/** @deprecated Utiliser ActifListing à la place */
export type Actif = ActifListing;

/** @deprecated Utiliser ActifsListingsFilters à la place */
export interface ActifsFilters extends ActifsListingsFilters {
  page?: number;
  page_size?: number;
}

// Types historiques pour la compatibilité avec les hooks existants
/** @deprecated Utiliser ActifsListingsApiResponse à la place */
export interface ActifsResponse {
  actifs: ActifListing[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** @deprecated Utiliser les nouveaux types du hook useActifs */
export interface UseActifsParams {
  filters?: ActifsFilters;
  enabled?: boolean;
}

/** @deprecated Utiliser les nouveaux types du hook useActifs */
export interface UseActifsReturn {
  data: ActifsResponse | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  isSuccess: boolean;
  isError: boolean;
}
