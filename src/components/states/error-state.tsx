/**
 * Composants d'état d'erreur globaux
 * Centralise les patterns d'affichage des erreurs pour toute l'application
 */

import {
  AlertCircle,
  RefreshCw,
  Bug,
  Wifi,
  Server,
  AlertTriangle,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_STATE_MESSAGES } from '@/constants';
import { cn } from '@/lib/utils';
import type { ErrorStateProps } from '@/types';

const errorIcons = {
  generic: AlertCircle,
  network: Wifi,
  server: Server,
  validation: AlertTriangle,
} as const;

/**
 * Composant d'état d'erreur standard
 */
export function ErrorState({
  error,
  onRetry,
  className,
  title = DEFAULT_STATE_MESSAGES.error,
  variant = 'default',
  errorType = 'generic',
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  const Icon = errorIcons[errorType];

  if (variant === 'compact') {
    return (
      <Alert variant="destructive" className={cn('', className)}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="flex-1">{errorMessage}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2 h-7 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('border-destructive/50', className)}>
        <CardContent className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="bg-destructive/10 mb-6 rounded-full p-4">
            <Icon className="text-destructive h-12 w-12" />
          </div>

          <h3 className="text-foreground mb-2 text-lg font-medium">{title}</h3>

          <p className="text-muted-foreground mb-6 max-w-md">{errorMessage}</p>

          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'critical') {
    return (
      <div
        className={cn(
          'border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-6 rounded-lg border-2 py-12 text-center',
          className
        )}
      >
        <div className="bg-destructive/10 flex h-20 w-20 items-center justify-center rounded-full">
          <Bug className="text-destructive h-10 w-10" />
        </div>

        <div className="space-y-3">
          <h3 className="text-destructive text-xl font-semibold">
            Erreur Critique
          </h3>
          <p className="text-muted-foreground max-w-md text-sm">
            {errorMessage}
          </p>
          <p className="text-muted-foreground text-xs">
            Veuillez rafraîchir la page ou contacter le support si le problème
            persiste.
          </p>
        </div>

        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-8 text-center',
        className
      )}
    >
      <div className="bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full">
        <Icon className="text-destructive h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-md text-sm">{errorMessage}</p>
      </div>

      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

/**
 * Composants d'erreur prédéfinis pour des cas d'usage communs
 */
export const ErrorVariants = {
  /**
   * Erreur réseau
   */
  Network: ({
    error,
    onRetry,
  }: {
    error: string | Error;
    onRetry?: () => void;
  }) => (
    <ErrorState
      error={error}
      onRetry={onRetry}
      title={DEFAULT_STATE_MESSAGES.errorNetwork}
      errorType="network"
    />
  ),

  /**
   * Erreur serveur
   */
  Server: ({
    error,
    onRetry,
  }: {
    error: string | Error;
    onRetry?: () => void;
  }) => (
    <ErrorState
      error={error}
      onRetry={onRetry}
      title={DEFAULT_STATE_MESSAGES.errorServer}
      errorType="server"
    />
  ),

  /**
   * Erreur de validation
   */
  Validation: ({ error }: { error: string | Error }) => (
    <ErrorState
      error={error}
      title={DEFAULT_STATE_MESSAGES.errorValidation}
      errorType="validation"
      variant="compact"
    />
  ),

  /**
   * Erreur critique
   */
  Critical: ({
    error,
    onRetry,
  }: {
    error: string | Error;
    onRetry?: () => void;
  }) => <ErrorState error={error} onRetry={onRetry} variant="critical" />,

  /**
   * Erreur de chargement de données
   */
  DataLoading: ({
    error,
    onRetry,
  }: {
    error: string | Error;
    onRetry?: () => void;
  }) => (
    <ErrorState
      error={error}
      onRetry={onRetry}
      title={DEFAULT_STATE_MESSAGES.errorDataLoading}
    />
  ),

  /**
   * Erreur avec style Card élégant
   */
  Card: ({
    error,
    onRetry,
    title,
  }: {
    error: string | Error;
    onRetry?: () => void;
    title?: string;
  }) => (
    <ErrorState
      error={error}
      onRetry={onRetry}
      title={title ?? DEFAULT_STATE_MESSAGES.errorDataLoading}
      variant="card"
    />
  ),
} as const;
