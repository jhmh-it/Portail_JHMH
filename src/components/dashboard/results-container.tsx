/**
 * Composant standardisé pour l'affichage conditionnel des résultats
 * Pattern standardisé utilisé dans tous les modules (accounting, guests, etc.)
 * Garantit une UX cohérente et les mêmes styles partout
 */

'use client';

import type { LucideIcon } from 'lucide-react';
import React from 'react';

import { LoadingVariants } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsContainerProps<T = unknown> {
  /** Indique si une recherche/action a été effectuée */
  hasSearched: boolean;
  /** État de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: Error | string | null;
  /** Données récupérées */
  data: T[];
  /** Fonction de retry en cas d'erreur */
  onRetry: () => void;
  /** Fonction de recherche initiale */
  onSearch: () => void;
  /** Titre de la section résultats */
  resultsTitle?: string;
  /** Composant à rendre quand il y a des données */
  children: React.ReactNode;
  /** Classes CSS additionnelles pour le container */
  className?: string;
  /** Variante du skeleton de chargement */
  loadingVariant?: 'dashboard' | 'data' | 'card';
  /** Message d'erreur personnalisé */
  errorTitle?: string;

  // Personnalisation du state "pas encore de recherche"
  /** Titre pour l'état initial (pas de recherche) */
  emptySearchTitle?: string;
  /** Description pour l'état initial */
  emptySearchDescription?: string;
  /** Texte du bouton de recherche */
  emptySearchButtonText?: string;
  /** Icône pour l'état initial */
  emptySearchIcon?: LucideIcon;
  /** Afficher ou non le bouton de recherche dans l'état initial */
  showEmptySearchButton?: boolean;

  // Personnalisation du state "pas de données"
  /** Titre pour l'état "pas de données" */
  noDataTitle?: string;
  /** Description pour l'état "pas de données" */
  noDataDescription?: string;
  /** Texte du bouton dans l'état "pas de données" */
  noDataButtonText?: string;
  /** Afficher ou non le bouton dans l'état "pas de données" */
  showNoDataButton?: boolean;
  /** Fonction appelée par le bouton "pas de données" */
  onNoDataAction?: () => void;

  // Personnalisation du state "erreur"
  /** Texte du bouton retry */
  retryButtonText?: string;
  /** Afficher ou non le bouton retry */
  showRetryButton?: boolean;
}

/**
 * Composant standardisé pour l'affichage conditionnel des résultats
 * Suit le pattern du dashboard accounting pour une UX uniforme
 *
 * @template T Type des données affichées
 */
export function ResultsContainer<T = unknown>({
  hasSearched,
  isLoading,
  error,
  data,
  onRetry,
  onSearch,
  resultsTitle = 'Résultats',
  children,
  className = '',
  loadingVariant = 'dashboard',
  errorTitle = 'Erreur de chargement des données',

  // Props pour l'état initial
  emptySearchTitle = 'Commencez votre recherche',
  emptySearchDescription = 'Utilisez les filtres ci-dessus pour afficher les données.',
  emptySearchButtonText = 'Lancer la recherche',
  emptySearchIcon,
  showEmptySearchButton = true,

  // Props pour l'état "pas de données"
  noDataTitle = 'Aucune donnée disponible',
  noDataDescription = 'Aucun élément ne correspond aux critères de recherche.',
  noDataButtonText = 'Réinitialiser les filtres',
  showNoDataButton = true,
  onNoDataAction,

  // Props pour l'état erreur
  retryButtonText = 'Réessayer',
  showRetryButton = true,
}: ResultsContainerProps<T>) {
  const renderLoadingState = () => {
    switch (loadingVariant) {
      case 'dashboard':
        return <LoadingVariants.DashboardSkeleton />;
      case 'data':
        return <LoadingVariants.Data />;
      case 'card':
        return <LoadingVariants.Card />;
      default:
        return <LoadingVariants.DashboardSkeleton />;
    }
  };

  // Composant personnalisé pour l'état initial
  const renderEmptySearchState = () => {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
        {emptySearchIcon &&
          React.createElement(emptySearchIcon, {
            className: 'h-12 w-12 text-muted-foreground',
          })}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{emptySearchTitle}</h3>
          <p className="text-muted-foreground max-w-sm">
            {emptySearchDescription}
          </p>
        </div>
        {showEmptySearchButton && (
          <button
            onClick={onSearch}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 font-medium transition-colors"
          >
            {emptySearchButtonText}
          </button>
        )}
      </div>
    );
  };

  // Composant personnalisé pour l'état "pas de données"
  const renderNoDataState = () => {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{noDataTitle}</h3>
            <p className="text-muted-foreground max-w-sm">
              {noDataDescription}
            </p>
          </div>
          {showNoDataButton && onNoDataAction && (
            <button
              onClick={onNoDataAction}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-md px-4 py-2 font-medium transition-colors"
            >
              {noDataButtonText}
            </button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Composant personnalisé pour l'état erreur
  const renderErrorState = () => {
    const errorMessage =
      typeof error === 'string' ? error : (error?.message ?? 'Erreur inconnue');
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <div className="space-y-2">
            <h3 className="text-destructive text-lg font-medium">
              {errorTitle}
            </h3>
            <p className="text-muted-foreground max-w-sm">{errorMessage}</p>
          </div>
          {showRetryButton && (
            <button
              onClick={onRetry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center rounded-md px-4 py-2 font-medium transition-colors"
            >
              {retryButtonText}
            </button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <main className={className}>
      {(() => {
        // État: Pas encore de recherche effectuée (personnalisable)
        if (!hasSearched) {
          return renderEmptySearchState();
        }

        // État: Chargement des données (pattern dashboard)
        if (isLoading) {
          return renderLoadingState();
        }

        // État: Erreur lors du chargement (personnalisable)
        if (error) {
          return renderErrorState();
        }

        // État: Pas de données disponibles (personnalisable)
        if (data.length === 0) {
          return renderNoDataState();
        }

        // État: Données disponibles - afficher le contenu
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{resultsTitle}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        );
      })()}
    </main>
  );
}
