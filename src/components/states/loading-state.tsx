/**
 * Composants d'état de chargement globaux
 * Centralise les patterns d'affichage des états de chargement pour toute l'application
 */

import { Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
//
import {
  LOADING_SPINNER_SIZES,
  GRID_COLUMNS_CLASSES,
  DEFAULT_STATE_MESSAGES,
} from '@/constants';
import { cn } from '@/lib/utils';
import type {
  LoadingStateProps,
  LoadingGridProps,
  LoadingListProps,
} from '@/types';

/**
 * Composant d'état de chargement standard
 */
export function LoadingState({
  message = DEFAULT_STATE_MESSAGES.loading,
  size = 'md',
  className,
  variant = 'default',
}: LoadingStateProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <Loader2
          className={cn(
            'text-primary animate-spin',
            LOADING_SPINNER_SIZES[size]
          )}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 p-2', className)}>
        <Loader2
          className={cn('text-primary animate-spin', LOADING_SPINNER_SIZES.sm)}
        />
        <span className="text-muted-foreground text-sm">{message}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="bg-primary/10 mb-6 rounded-full p-4">
            <Loader2
              className={cn(
                'text-primary animate-spin',
                LOADING_SPINNER_SIZES.lg
              )}
            />
          </div>

          <h3 className="text-foreground mb-2 text-lg font-medium">
            Traitement en cours
          </h3>

          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Skeleton des onglets */}
        <div className="w-full">
          <div className="mb-6 grid grid-cols-4 gap-3 rounded-lg bg-gray-100 p-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-md" />
            ))}
          </div>
        </div>

        {/* Skeleton du contenu principal */}
        <div className="space-y-6">
          {/* Grille de métriques principales */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Grandes cartes */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-4">
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-8',
        className
      )}
    >
      <Loader2
        className={cn('text-primary animate-spin', LOADING_SPINNER_SIZES[size])}
      />
      <p className="text-muted-foreground max-w-md text-center text-sm">
        {message}
      </p>
    </div>
  );
}

/**
 * Composant de chargement pour grilles/tableaux
 */
export function LoadingGrid({
  count = 6,
  className,
  columns = 3,
}: LoadingGridProps) {
  return (
    <div className={cn('grid gap-4', GRID_COLUMNS_CLASSES[columns], className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-muted h-32 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Composant de chargement pour listes
 */
export function LoadingList({ count = 5, className }: LoadingListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-muted h-16 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Composants de chargement prédéfinis pour des cas d'usage communs
 */
export const LoadingVariants = {
  /**
   * Chargement de données
   */
  Data: (props?: Partial<LoadingStateProps>) => (
    <LoadingState message={DEFAULT_STATE_MESSAGES.loadingData} {...props} />
  ),

  /**
   * Chargement de recherche
   */
  Search: (props?: Partial<LoadingStateProps>) => (
    <LoadingState message={DEFAULT_STATE_MESSAGES.loadingSearch} {...props} />
  ),

  /**
   * Sauvegarde en cours
   */
  Saving: (props?: Partial<LoadingStateProps>) => (
    <LoadingState
      variant="compact"
      message={DEFAULT_STATE_MESSAGES.saving}
      size="sm"
      {...props}
    />
  ),

  /**
   * Chargement minimal pour boutons
   */
  Button: () => <LoadingState variant="minimal" size="sm" />,

  /**
   * Chargement avec style Card élégant
   */
  Card: (props?: Partial<LoadingStateProps>) => (
    <LoadingState
      variant="card"
      message={DEFAULT_STATE_MESSAGES.loadingData}
      {...props}
    />
  ),

  /**
   * Skeleton de dashboard avec structure complète
   */
  DashboardSkeleton: (props?: Partial<LoadingStateProps>) => (
    <LoadingState variant="skeleton" {...props} />
  ),
} as const;
