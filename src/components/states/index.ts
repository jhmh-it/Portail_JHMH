/**
 * Export barrel pour les composants d'état globaux
 * Centralise tous les composants d'état réutilisables dans l'application
 */

// Composants d'état de base
export { NoDataState, NoDataVariants } from './no-data-state';
export {
  LoadingState,
  LoadingGrid,
  LoadingList,
  LoadingVariants,
} from './loading-state';
export { ErrorState, ErrorVariants } from './error-state';

// Note: Les types sont maintenant dans @/types
