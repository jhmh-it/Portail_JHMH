/**
 * Unified Tool Grid Component
 * Responsive grid layout with consistent animations
 * Used across: Home, Exploitation, Accounting, Greg pages
 */

'use client';

import { cn } from '@/lib/utils';

import { ToolCard } from './ToolCard';
import type { ToolGridProps } from './types';

/**
 * Unified Tool Grid Component
 * Features: Responsive layout, staggered animations, consistent spacing
 */
export function ToolGrid({
  tools,
  onToolClick,
  isLoading = false,
  className,
  title,
  isToolLoading,
}: ToolGridProps) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Optional title */}
      {title && (
        <h2 className="text-navy mb-4 text-xl font-semibold">{title}</h2>
      )}

      {/* Grid layout - responsive and consistent */}
      <div
        className={cn(
          'grid gap-6',
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          'auto-rows-fr' // Equal height rows
        )}
      >
        {tools.map((tool, index) => (
          <div
            key={tool.id || tool.href}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
              animationDuration: '0.5s',
            }}
          >
            <ToolCard
              tool={tool}
              onToolClick={onToolClick}
              isLoading={isToolLoading ? isToolLoading(tool.id) : isLoading}
              cardClickable
            />
          </div>
        ))}
      </div>
    </div>
  );
}
