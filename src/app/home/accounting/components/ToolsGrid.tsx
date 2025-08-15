/**
 * Composant pour afficher la grille des outils accounting
 */

import { BarChart3, Calculator } from 'lucide-react';

import type { AccountingTool } from '../types';

import { ToolCard } from './ToolCard';
import { ToolCardSkeleton } from './ToolCardSkeleton';

interface ToolsGridProps {
  /** Liste des outils à afficher */
  tools: AccountingTool[];
  /** Indicateur de chargement */
  isLoading: boolean;
}

/**
 * Mapping des icônes par ID d'outil
 */
const TOOL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  dashboard: BarChart3,
  BarChart3: BarChart3,
  Calculator: Calculator,
} as const;

/**
 * Nombre de skeletons à afficher pendant le chargement
 */
const SKELETON_COUNT = 3;

/**
 * Grille responsive des outils accounting
 */
export function ToolsGrid({ tools, isLoading }: ToolsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {isLoading
        ? // Affichage des skeletons pendant le chargement
          Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ToolCardSkeleton key={`tool-skeleton-${index}`} />
          ))
        : // Affichage des outils réels
          tools.map(tool => {
            const IconComponent = TOOL_ICONS[tool.id] || Calculator;

            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                IconComponent={IconComponent}
              />
            );
          })}
    </div>
  );
}
