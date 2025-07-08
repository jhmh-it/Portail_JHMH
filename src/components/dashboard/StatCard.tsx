'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  comparison?: {
    value: number;
    label: string;
    type: 'percentage' | 'currency' | 'number';
  };
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  progress?: {
    current: number;
    max: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  comparison,
  trend = 'neutral',
  icon: Icon,
  progress,
  className,
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    return new Intl.NumberFormat('fr-FR').format(val);
  };

  const formatComparison = (comp: StatCardProps['comparison']): string => {
    if (!comp) return '';

    const prefix = comp.value >= 0 ? '+' : '';
    switch (comp.type) {
      case 'currency':
        return `${prefix}${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(comp.value)}`;
      case 'percentage':
        return `${prefix}${comp.value.toFixed(1)}%`;
      default:
        return `${prefix}${comp.value}`;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const progressPercentage = progress
    ? (progress.current / progress.max) * 100
    : 0;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>{title}</span>
          {Icon && <Icon className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-2xl font-bold text-navy">
            {formatValue(value)}
          </div>

          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.label ?? 'Progression'}</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-navy h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {comparison && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {comparison.label}
              </span>
              <Badge className={cn('text-xs', getTrendColor())}>
                {formatComparison(comparison)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
