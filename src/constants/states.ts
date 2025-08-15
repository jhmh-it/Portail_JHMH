/**
 * Constantes pour les composants d'état
 * Centralise les configurations des composants d'état
 */

/**
 * Tailles des spinners de chargement
 */
export const LOADING_SPINNER_SIZES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} as const;

/**
 * Classes CSS pour les grilles de colonnes
 */
export const GRID_COLUMNS_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Messages par défaut pour les différents états
 */
export const DEFAULT_STATE_MESSAGES = {
  loading: 'Chargement en cours...',
  loadingData: 'Chargement des données...',
  loadingSearch: 'Recherche en cours...',
  saving: 'Sauvegarde...',
  error: 'Une erreur est survenue',
  errorNetwork: 'Problème de connexion',
  errorServer: 'Erreur du serveur',
  errorValidation: 'Données invalides',
  errorCritical: 'Erreur Critique',
  errorDataLoading: 'Erreur de chargement des données',
  noData: 'Aucune donnée disponible',
  noSearchResults: 'Aucun résultat trouvé',
  noCriteriaData: 'Aucune donnée disponible pour les critères sélectionnés.',
  noElements: 'Cette section ne contient aucun élément pour le moment.',
  cannotLoadData: 'Impossible de charger les données',
} as const;

/**
 * Types d'erreur avec leurs icônes associées
 */
export const ERROR_TYPES = {
  generic: 'AlertCircle',
  network: 'Wifi',
  server: 'Server',
  validation: 'AlertTriangle',
} as const;

/**
 * Types d'icônes pour NoDataState
 */
export const NO_DATA_ICONS = {
  alert: 'AlertCircle',
  search: 'Search',
  file: 'FileX',
  database: 'Database',
} as const;
