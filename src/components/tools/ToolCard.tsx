/**
 * Unified Tool Card Component
 * Professional card with consistent animations and loading states
 * Used across: Home, Exploitation, Accounting, Greg pages
 */

'use client';

import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { ToolCardProps } from './types';

/**
 * Unified Tool Card Component
 * Features: Consistent hover effects, loading states, accessibility
 */
export function ToolCard({
  tool,
  onToolClick,
  isLoading = false,
  cardClickable = true,
}: ToolCardProps) {
  const handleClick = (e?: React.MouseEvent) => {
    if (tool.available && !isLoading && onToolClick) {
      e?.stopPropagation();
      onToolClick(tool);
    }
  };

  const handleCardClick = () => {
    if (cardClickable && tool.available && !isLoading && onToolClick) {
      onToolClick(tool);
    }
  };

  return (
    <Card
      className={cn(
        'group relative transition-all duration-200',
        'hover:border-navy/20 hover:shadow-lg',
        'focus-within:ring-navy/20 focus-within:ring-2',
        cardClickable && tool.available && 'cursor-pointer',
        !tool.available && 'opacity-60'
      )}
      onClick={cardClickable ? handleCardClick : undefined}
    >
      {/* Header with icon and title */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon with consistent styling */}
            <div
              className={cn(
                'rounded-lg p-2 transition-colors duration-200',
                'bg-navy/10 group-hover:bg-navy/20'
              )}
            >
              <tool.icon className="text-navy h-6 w-6" />
            </div>

            {/* Title with hover effect */}
            <CardTitle
              className={cn(
                'text-navy transition-colors duration-200',
                'group-hover:text-navy/80'
              )}
            >
              {tool.title}
            </CardTitle>
          </div>

          {/* Optional badge */}
          {tool.badge && (
            <Badge variant="secondary" className="text-xs">
              {tool.badge}
            </Badge>
          )}
        </div>

        {/* Description */}
        <CardDescription className="mt-2 text-sm leading-relaxed">
          {tool.description}
        </CardDescription>
      </CardHeader>

      {/* Action button */}
      <CardContent>
        <Button
          className={cn(
            'w-full transition-all duration-200',
            'bg-navy hover:bg-navy/90 text-white',
            'group-hover:bg-navy/80',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          disabled={!tool.available || isLoading}
          variant={tool.available ? 'default' : 'outline'}
          onClick={handleClick}
          aria-label={`Accéder à ${tool.title}`}
        >
          {tool.available ? (
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Chargement...
                </>
              ) : (
                <>
                  Accéder
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      'group-hover:translate-x-1'
                    )}
                  />
                </>
              )}
            </div>
          ) : (
            <span>Bientôt disponible</span>
          )}
        </Button>
      </CardContent>

      {/* Disabled overlay */}
      {!tool.available && (
        <div className="bg-background/50 pointer-events-none absolute inset-0 cursor-not-allowed rounded-lg" />
      )}
    </Card>
  );
}
