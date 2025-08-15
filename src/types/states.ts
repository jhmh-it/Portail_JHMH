/**
 * Types pour les composants d'état globaux
 * Centralise les interfaces pour tous les composants d'état
 */

export interface LoadingStateProps {
  /** Message de chargement personnalisé */
  message?: string;
  /** Taille du spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Classes CSS additionnelles */
  className?: string;
  /** Affichage compact ou complet */
  variant?: 'default' | 'compact' | 'minimal' | 'card' | 'skeleton';
}

export interface ErrorStateProps {
  /** Message d'erreur */
  error: string | Error;
  /** Fonction de retry optionnelle */
  onRetry?: () => void;
  /** Classes CSS additionnelles */
  className?: string;
  /** Titre personnalisé */
  title?: string;
  /** Variante d'affichage */
  variant?: 'default' | 'compact' | 'critical' | 'card';
  /** Type d'erreur pour l'icône appropriée */
  errorType?: 'generic' | 'network' | 'server' | 'validation';
}

export interface NoDataStateProps {
  /** Message principal à afficher */
  message?: string;
  /** Description additionnelle */
  description?: string;
  /** Icône à afficher */
  icon?: 'alert' | 'search' | 'file' | 'database';
  /** Classes CSS additionnelles */
  className?: string;
  /** Variante d'affichage */
  variant?: 'default' | 'destructive' | 'card' | 'search-empty';
  /** Fonction de recherche pour SearchEmptyState */
  onSearch?: () => void;
}

export interface LoadingGridProps {
  /** Nombre d'éléments à afficher */
  count?: number;
  /** Classes CSS additionnelles */
  className?: string;
  /** Nombre de colonnes */
  columns?: 1 | 2 | 3 | 4;
}

export interface LoadingListProps {
  /** Nombre d'éléments à afficher */
  count?: number;
  /** Classes CSS additionnelles */
  className?: string;
}
