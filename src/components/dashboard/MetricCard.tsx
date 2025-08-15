'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    label?: string;
    period?: string;
  };
  trend?: 'up' | 'down' | 'neutral';
  format?: 'currency' | 'percentage' | 'number';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend,
  format = 'number',
  icon: Icon,
  className,
  size = 'md',
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(val);
      default:
        return val.toString();
    }
  };

  const formatChange = (changeValue: number): string => {
    const absChange = Math.abs(changeValue);
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(absChange);
      case 'percentage':
        return `${absChange.toFixed(1)}%`;
      default:
        return `${absChange.toFixed(1)}%`;
    }
  };

  const getTrendColor = (trendType?: 'up' | 'down' | 'neutral'): string => {
    switch (trendType) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trendType?: 'up' | 'down' | 'neutral') => {
    switch (trendType) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const sizeClasses = {
    sm: 'pl-4 pr-4 pt-2 pb-0',
    md: 'pl-6 pr-5 pt-3 pb-0',
    lg: 'pl-8 pr-6 pt-4 pb-0',
  };

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardContent className={cn(sizeClasses[size])}>
        <div className="flex flex-col gap-3">
          {/* Header avec titre et icône */}
          <div className="flex items-center justify-between">
            <CardTitle
              className={cn(
                'text-muted-foreground font-medium',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base'
              )}
            >
              {title}
            </CardTitle>
            {Icon && (
              <Icon
                className={cn(
                  'text-muted-foreground',
                  size === 'sm' && 'h-4 w-4',
                  size === 'md' && 'h-5 w-5',
                  size === 'lg' && 'h-6 w-6'
                )}
              />
            )}
          </div>

          {/* Valeur principale */}
          <div
            className={cn(
              'text-navy font-bold',
              size === 'sm' && 'text-xl',
              size === 'md' && 'text-2xl',
              size === 'lg' && 'text-3xl'
            )}
          >
            {formatValue(value)}
          </div>

          {/* Subtitle et/ou changement */}
          <div className="flex flex-col gap-2">
            {subtitle && (
              <p
                className={cn(
                  'text-muted-foreground',
                  size === 'sm' && 'text-xs',
                  size === 'md' && 'text-sm',
                  size === 'lg' && 'text-base'
                )}
              >
                {subtitle}
              </p>
            )}

            {change && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    'flex items-center gap-1',
                    getTrendColor(trend)
                  )}
                >
                  {getTrendIcon(trend)}
                  <span className="text-xs font-medium">
                    {change.value >= 0 ? '+' : ''}
                    {formatChange(change.value)}
                  </span>
                </Badge>
                {change.label && (
                  <span className="text-muted-foreground text-xs">
                    {change.label}
                    {change.period && ` (${change.period})`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
