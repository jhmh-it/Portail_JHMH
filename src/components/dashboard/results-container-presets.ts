/**
 * Presets de configuration pour ResultsContainer
 * Centralise les personnalisations par module pour éviter la répétition
 */

import {
  Users,
  BarChart3,
  Home,
  FileText,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

export interface ResultsContainerPreset {
  // Props pour l'état initial
  emptySearchTitle?: string;
  emptySearchDescription?: string;
  emptySearchButtonText?: string;
  emptySearchIcon?: LucideIcon;
  showEmptySearchButton?: boolean;

  // Props pour l'état "pas de données"
  noDataTitle?: string;
  noDataDescription?: string;
  noDataButtonText?: string;
  showNoDataButton?: boolean;

  // Props pour l'état erreur
  retryButtonText?: string;
  showRetryButton?: boolean;
  errorTitle?: string;
}

/**
 * Presets par module
 */
export const RESULTS_CONTAINER_PRESETS = {
  // Module Guests
  GUESTS: {
    emptySearchTitle: 'Recherche de guests',
    emptySearchDescription:
      'Utilisez la barre de recherche et les filtres ci-dessus pour trouver des guests.',
    emptySearchButtonText: 'Lancer la recherche',
    emptySearchIcon: Users,
    showEmptySearchButton: true,

    noDataTitle: 'Aucun guest trouvé',
    noDataDescription:
      "Il n'y a actuellement aucun guest à afficher. Les guests apparaîtront ici une fois qu'ils seront disponibles dans le système.",
    showNoDataButton: false, // Pas de bouton pour guests

    retryButtonText: 'Réessayer la recherche',
    showRetryButton: true,
    errorTitle: 'Erreur lors du chargement des guests',
  },

  // Module Dashboard Accounting
  ACCOUNTING_DASHBOARD: {
    emptySearchTitle: 'Analyse comptable',
    emptySearchDescription:
      "Sélectionnez vos critères d'analyse pour afficher les données financières.",
    emptySearchButtonText: "Lancer l'analyse",
    emptySearchIcon: BarChart3,
    showEmptySearchButton: true,

    noDataTitle: 'Aucune donnée disponible',
    noDataDescription: 'Aucune donnée ne correspond aux critères sélectionnés.',
    noDataButtonText: 'Modifier les critères',
    showNoDataButton: true,

    retryButtonText: "Relancer l'analyse",
    showRetryButton: true,
    errorTitle: 'Erreur lors du chargement des données',
  },

  // Module Actifs
  ACTIFS: {
    emptySearchTitle: "Recherche d'actifs",
    emptySearchDescription:
      'Utilisez les filtres pour rechercher parmi vos biens immobiliers.',
    emptySearchButtonText: 'Rechercher des actifs',
    emptySearchIcon: Home,
    showEmptySearchButton: true,

    noDataTitle: 'Aucun actif trouvé',
    noDataDescription: 'Aucun actif ne correspond aux critères de recherche.',
    showNoDataButton: false,

    retryButtonText: 'Réessayer',
    showRetryButton: true,
    errorTitle: 'Erreur lors du chargement des actifs',
  },

  // Module Documents
  DOCUMENTS: {
    emptySearchTitle: 'Recherche de documents',
    emptySearchDescription:
      'Explorez votre bibliothèque de documents avec les filtres disponibles.',
    emptySearchButtonText: 'Parcourir les documents',
    emptySearchIcon: FileText,
    showEmptySearchButton: true,

    noDataTitle: 'Aucun document trouvé',
    noDataDescription: 'Aucun document ne correspond à votre recherche.',
    showNoDataButton: false,

    retryButtonText: 'Réessayer',
    showRetryButton: true,
    errorTitle: 'Erreur lors du chargement des documents',
  },

  // Module Finances/Transactions
  FINANCES: {
    emptySearchTitle: 'Analyse financière',
    emptySearchDescription:
      'Configurez vos filtres pour analyser vos transactions financières.',
    emptySearchButtonText: 'Analyser les finances',
    emptySearchIcon: CreditCard,
    showEmptySearchButton: true,

    noDataTitle: 'Aucune transaction trouvée',
    noDataDescription:
      'Aucune transaction ne correspond aux critères sélectionnés.',
    noDataButtonText: 'Réinitialiser les filtres',
    showNoDataButton: true,

    retryButtonText: 'Relancer la recherche',
    showRetryButton: true,
    errorTitle: 'Erreur lors du chargement des transactions',
  },

  // Preset générique par défaut
  DEFAULT: {
    emptySearchTitle: 'Commencez votre recherche',
    emptySearchDescription:
      'Utilisez les filtres ci-dessus pour afficher les données.',
    emptySearchButtonText: 'Lancer la recherche',
    showEmptySearchButton: true,

    noDataTitle: 'Aucune donnée disponible',
    noDataDescription: 'Aucun élément ne correspond aux critères de recherche.',
    noDataButtonText: 'Réinitialiser les filtres',
    showNoDataButton: true,

    retryButtonText: 'Réessayer',
    showRetryButton: true,
    errorTitle: 'Erreur de chargement des données',
  },
} as const;

/**
 * Type helper pour les clés de preset
 */
export type ResultsContainerPresetKey = keyof typeof RESULTS_CONTAINER_PRESETS;
