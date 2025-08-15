/**
 * Composant partagé pour les en-têtes de page
 * Suit les standards d'interface utilisateur cohérents
 */

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Titre principal de la page */
  title: string;
  /** Description optionnelle sous le titre */
  description?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Éléments d'action à droite (boutons, etc.) */
  actions?: React.ReactNode;
  /** Taille du titre */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
} as const;

/**
 * Composant d'en-tête de page standardisé
 * Centralise les styles et la structure des en-têtes
 */
export function PageHeader({
  title,
  description,
  className,
  actions,
  size = 'md',
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <h1
          className={cn('text-navy font-bold tracking-tight', sizeStyles[size])}
        >
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-muted-foreground max-w-3xl">{description}</p>
      )}
    </header>
  );
}
