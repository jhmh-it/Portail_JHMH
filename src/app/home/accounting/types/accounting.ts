/**
 * Types pour les outils comptables (Accounting Tools)
 */

/**
 * Structure d'un outil comptable côté client
 */
export interface AccountingTool {
  /** Identifiant unique de l'outil */
  id: string;
  /** Titre affiché de l'outil */
  title: string;
  /** URL de navigation vers l'outil */
  url: string;
  /** Description de l'outil */
  description: string;
}

/**
 * Structure d'un outil comptable côté API
 */
export interface AccountingToolAPIResponse {
  /** Identifiant unique de l'outil */
  id: string;
  /** Nom de l'outil (sera mappé vers title) */
  name: string;
  /** Lien de navigation (sera mappé vers url) */
  href: string;
  /** Description de l'outil */
  description: string;
  /** Icône associée à l'outil */
  icon: string;
  /** Catégorie de l'outil */
  category: string;
}

/**
 * Réponse de l'API pour les outils comptables
 */
export interface AccountingToolsApiResponse {
  /** Indicateur de succès */
  success: boolean;
  /** Liste des outils comptables */
  data: AccountingToolAPIResponse[];
  /** Horodatage de la réponse */
  timestamp: string;
}

/**
 * Réponse d'erreur de l'API
 */
export interface AccountingToolsApiError {
  /** Indicateur d'échec */
  success: false;
  /** Message d'erreur */
  error: string;
}

/**
 * Types d'icônes supportés pour les outils
 */
export type AccountingToolIcon =
  | 'BarChart3'
  | 'Calculator'
  | 'TrendingUp'
  | 'PieChart';

/**
 * Catégories d'outils comptables
 */
export type AccountingToolCategory =
  | 'analytics'
  | 'reporting'
  | 'calculation'
  | 'management';
