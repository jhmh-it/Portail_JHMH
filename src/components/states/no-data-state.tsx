/**
 * Composant d'état global pour l'absence de données
 * Composant modulaire et réutilisable dans différents contextes
 */

import { AlertCircle, Search, FileX, Database, BarChart3 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_STATE_MESSAGES } from '@/constants';
import { cn } from '@/lib/utils';
import type { NoDataStateProps } from '@/types';

const icons = {
  alert: AlertCircle,
  search: Search,
  file: FileX,
  database: Database,
} as const;

/**
 * Composant d'état pour l'absence de données
 * Utilisable dans tous les contextes de l'application
 */
export function NoDataState({
  message = 'Aucune donnée disponible',
  description,
  icon = 'alert',
  className,
  variant = 'default',
  onSearch,
}: NoDataStateProps) {
  const Icon = icons[icon];

  // Style spécial pour l'état de recherche vide (exactement comme avant)
  if (variant === 'search-empty' && onSearch) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-12',
          className
        )}
      >
        <div className="text-center">
          <BarChart3 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-navy mb-2 text-lg font-medium">
            Prêt à analyser vos données
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Sélectionnez un actif et une date de référence, puis cliquez sur
            &quot;Rechercher&quot; pour afficher les métriques comptables
            détaillées.
          </p>
          <Button
            onClick={onSearch}
            className="bg-navy hover:bg-navy/90 text-white"
          >
            Commencer l&apos;analyse
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="bg-muted/50 mb-6 rounded-full p-4">
            <Icon className="text-muted-foreground h-12 w-12" />
          </div>

          <h3 className="text-foreground mb-2 text-lg font-medium">
            {message}
          </h3>

          {description && (
            <p className="text-muted-foreground max-w-md">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const alertVariant = variant === 'destructive' ? 'destructive' : 'default';

  return (
    <Alert variant={alertVariant} className={cn('text-center', className)}>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">{message}</p>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Composants d'absence de données prédéfinis pour des cas d'usage communs
 */
export const NoDataVariants = {
  /**
   * Aucun résultat de recherche
   */
  Search: (props?: Partial<NoDataStateProps>) => (
    <NoDataState
      icon="search"
      message={DEFAULT_STATE_MESSAGES.noSearchResults}
      description="Essayez de modifier vos critères de recherche."
      {...props}
    />
  ),

  /**
   * Aucune donnée pour les critères sélectionnés
   */
  Criteria: (props?: Partial<NoDataStateProps>) => (
    <NoDataState
      icon="database"
      message={DEFAULT_STATE_MESSAGES.noData}
      description={DEFAULT_STATE_MESSAGES.noCriteriaData}
      {...props}
    />
  ),

  /**
   * Collection vide
   */
  Empty: (props?: Partial<NoDataStateProps>) => (
    <NoDataState
      icon="file"
      message="Aucun élément"
      description={DEFAULT_STATE_MESSAGES.noElements}
      {...props}
    />
  ),

  /**
   * Erreur de chargement des données
   */
  Error: (props?: Partial<NoDataStateProps>) => (
    <NoDataState
      icon="alert"
      variant="destructive"
      message={DEFAULT_STATE_MESSAGES.cannotLoadData}
      description="Une erreur s'est produite lors du chargement."
      {...props}
    />
  ),

  /**
   * État de recherche vide (style original avec bouton)
   */
  SearchEmpty: ({
    onSearch,
    ...props
  }: { onSearch: () => void } & Partial<NoDataStateProps>) => (
    <NoDataState variant="search-empty" onSearch={onSearch} {...props} />
  ),
} as const;
